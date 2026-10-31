import { supabase } from './supabase.js'
import { createViewer } from './viewer.js'
import { CONTATO } from './config.js'

const BUCKET = 'modelos-3d'
const FORMATOS = ['stl', 'obj', '3mf', 'glb']
const WHATSAPP = CONTATO.whatsapp
const CACHE = '31536000' // 1 ano: arquivos com nome único nunca mudam

const app = () => document.querySelector('#app')
const linkDe = (id) => `${location.origin}${location.pathname}#/modelo/${id}`
const urlPublica = (path) => supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
let ativo = false

/* ---------- Auxiliares de imagem ---------- */

// Converte qualquer imagem (JPG, PNG...) em WebP reduzido
async function paraWebp(arquivo, larguraMax = 800, qualidade = 0.8) {
  const bmp = await createImageBitmap(arquivo)
  const esc = Math.min(1, larguraMax / bmp.width)
  const c = document.createElement('canvas')
  c.width = Math.round(bmp.width * esc)
  c.height = Math.round(bmp.height * esc)
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height)
  return new Promise((ok) => c.toBlob(ok, 'image/webp', qualidade))
}

// Renderiza o modelo escondido e tira uma foto dele
async function capaDoModelo(url, formato) {
  const box = document.createElement('div')
  box.style.cssText = 'position:fixed;left:-9999px;top:0;width:800px;height:600px'
  document.body.appendChild(box)
  const v = createViewer(box)
  try {
    await v.loadModel(url, formato)
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    return await v.snapshot()
  } finally {
    v.dispose()
    box.remove()
  }
}

async function enviarCapa(blob) {
  const path = `capas/${crypto.randomUUID()}.webp`
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: 'image/webp', cacheControl: CACHE })
  if (error) throw error
  return path
}

/* ---------- Roteador ---------- */

export function initPortal() {
  window.addEventListener('hashchange', () => {
    if (ativo || location.hash.startsWith('#/')) location.reload()
  })
  const h = location.hash
  if (h.startsWith('#/modelo/')) {
    ativo = true
    paginaPublica(h.split('/')[2])
    return true
  }
  if (h === '#/admin') {
    ativo = true
    paginaAdmin()
    return true
  }
  return false
}

/* ---------- Galeria da página inicial ---------- */

export async function carregarGaleria(box, coluna = 'publico', textoVazio = 'Em breve, novos modelos por aqui.') {
  box.innerHTML = '<p class="muted">Carregando modelos…</p>'
  const { data, error } = await supabase
    .from('modelos')
    .select('id,nome,capa_path')
    .eq(coluna, true)
    .order('criado_em', { ascending: false })

  if (error) {
    console.error(error)
    box.innerHTML = '<p class="muted">Não foi possível carregar os modelos.</p>'
    return
  }
  if (!data.length) {
    box.innerHTML = `<p class="muted">${textoVazio}</p>`
    return
  }

  box.innerHTML = ''
  for (const m of data) {
    const a = document.createElement('a')
    a.className = 'gcard'
    a.href = `#/modelo/${m.id}`
    a.title = m.nome

    if (m.capa_path) {
      const img = document.createElement('img')
      img.src = urlPublica(m.capa_path)
      img.alt = m.nome
      img.loading = 'lazy'
      img.decoding = 'async'
      img.width = 800
      img.height = 600
      a.append(img)
    } else {
      const vazio = document.createElement('div')
      vazio.className = 'gvazio'
      vazio.textContent = '3D'
      a.append(vazio)
    }

    const leg = document.createElement('span')
    leg.className = 'glegenda'
    leg.textContent = m.nome
    a.append(leg)
    box.append(a)
  }
}
/* ---------- Página do cliente ---------- */

async function paginaPublica(id) {
  app().innerHTML = `
    <main class="portal">
      <header class="portal-top"><strong>Ao Cubo³</strong><span>VISUALIZADOR 3D</span></header>

      <section class="p-head">
        <span class="eyebrow">MODELO 3D</span>
        <h1 id="p-nome">Carregando…</h1>
        <p id="p-desc" class="muted"></p>
      </section>

      <div class="viewer-wrap" id="wrap">
        <div id="viewer-3d"></div>

        <div class="loading" id="loading">
          <div class="bar"><span id="bar"></span></div>
          <small id="load-txt">Carregando modelo…</small>
        </div>

        <div class="hint">Arraste para girar · role para aproximar</div>

        <div class="swatches" id="swatches">
          <button data-cor="0x4da3ff" style="background:#4da3ff" title="Azul"></button>
          <button data-cor="0xe8eef5" style="background:#e8eef5" title="Branco"></button>
          <button data-cor="0xff7a3d" style="background:#ff7a3d" title="Laranja"></button>
          <button data-cor="0x3ddc84" style="background:#3ddc84" title="Verde"></button>
          <button data-cor="0x888f99" style="background:#888f99" title="Cinza"></button>
        </div>

        <div class="viewer-tools">
          <button class="tool" data-act="iso">Reiniciar</button>
          <button class="tool" data-act="front">Frente</button>
          <button class="tool" data-act="side">Lado</button>
          <button class="tool" data-act="top">Topo</button>
          <button class="tool" data-act="girar">Girar</button>
          <button class="tool on" data-act="grade">Grade</button>
          <button class="tool" data-act="wire">Malha</button>
          <button class="tool" data-act="full">Tela cheia</button>
        </div>
      </div>

      <div class="stats" id="stats"></div>

      <a class="btn zap" id="zap" target="_blank" rel="noopener">Falar com a Ao Cubo³ sobre este modelo</a>
      <footer class="portal-foot">Ao Cubo³ · Impressão 3D</footer>
    </main>`

  const nome = document.querySelector('#p-nome')
  const { data, error } = await supabase.rpc('modelo_por_id', { p_id: id }).maybeSingle()
  if (error || !data) {
    nome.textContent = 'Modelo não encontrado'
    document.querySelector('#loading').remove()
    return
  }

  document.title = `${data.nome} · Ao Cubo³`
  nome.textContent = data.nome
  document.querySelector('#p-desc').textContent = data.descricao || ''
  document.querySelector('#zap').href =
    `https://wa.me/${WHATSAPP}?text=` +
    encodeURIComponent(`Olá! Vi o modelo "${data.nome}" e gostaria de conversar sobre ele: ${location.href}`)

  const wrap = document.querySelector('#wrap')
  const viewer = createViewer(document.querySelector('#viewer-3d'))

  wrap.querySelectorAll('[data-act]').forEach((b) => {
    b.onclick = () => {
      const a = b.dataset.act
      if (['iso', 'front', 'side', 'top'].includes(a)) viewer.setView(a)
      else if (a === 'girar') b.classList.toggle('on', viewer.toggleAutoRotate())
      else if (a === 'grade') b.classList.toggle('on', viewer.toggleGrid())
      else if (a === 'wire') b.classList.toggle('on', viewer.toggleWireframe())
      else if (a === 'full') {
        document.fullscreenElement ? document.exitFullscreen() : wrap.requestFullscreen?.()
      }
    }
  })
  wrap.querySelectorAll('[data-cor]').forEach((b) => {
    b.onclick = () => viewer.setColor(Number(b.dataset.cor))
  })

  const bar = document.querySelector('#bar')
  const loading = document.querySelector('#loading')
  try {
    const d = await viewer.loadModel(urlPublica(data.arquivo_path), data.formato, (p) => {
      bar.style.width = Math.round(p * 100) + '%'
    })
    loading.remove()

    const unidade = data.formato === 'glb' ? '' : ' mm'
    const card = (rotulo, valor) =>
      `<div class="stat"><small>${rotulo}</small><strong>${valor}</strong></div>`
    document.querySelector('#stats').innerHTML =
      card('Largura', d.largura.toFixed(1) + unidade) +
      card('Profundidade', d.profundidade.toFixed(1) + unidade) +
      card('Altura', d.altura.toFixed(1) + unidade) +
      card('Formato', data.formato.toUpperCase())

    if (['3mf', 'glb'].includes(data.formato)) document.querySelector('#swatches').remove()
  } catch (e) {
    console.error(e)
    document.querySelector('#load-txt').textContent = 'Não foi possível carregar o modelo.'
  }
}

/* ---------- Admin ---------- */

async function paginaAdmin() {
  const { data } = await supabase.auth.getSession()
  data.session ? painel() : login()
}

function login() {
  app().innerHTML = `
    <main class="portal narrow">
      <h1>Área administrativa</h1>
      <form id="f-login" class="form">
        <input type="email" id="email" placeholder="E-mail" required>
        <input type="password" id="senha" placeholder="Senha" required>
        <button class="btn">Entrar</button>
        <p id="msg" class="muted"></p>
      </form>
    </main>`
  document.querySelector('#f-login').onsubmit = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({
      email: document.querySelector('#email').value,
      password: document.querySelector('#senha').value,
    })
    if (error) document.querySelector('#msg').textContent = 'E-mail ou senha incorretos.'
    else painel()
  }
}

function painel() {
  app().innerHTML = `
    <main class="portal">
      <header class="portal-top"><strong>Admin · Ao Cubo³</strong><button id="sair" class="btn small">Sair</button></header>
      <h2>Novo modelo</h2>
      <form id="f-up" class="form">
        <input id="nome" placeholder="Nome da peça" required>
        <textarea id="desc" placeholder="Descrição (opcional)"></textarea>
        <label class="muted">Arquivo 3D (STL, OBJ, 3MF ou GLB)</label>
        <input type="file" id="arq" accept=".stl,.obj,.3mf,.glb" required>
        <label class="muted">Imagem de capa (opcional). Se ficar vazia, gero a capa a partir do 3D.</label>
        <input type="file" id="capa" accept="image/*">
        <label class="check"><input type="checkbox" id="pub"> Mostrar em "Visualizar modelos"</label>
        <label class="check"><input type="checkbox" id="dest"> Projetos em destaque</label>
        <label class="check"><input type="checkbox" id="vend"> Mais vendidos</label>
        <button class="btn">Enviar e gerar link</button>
        <p id="msg" class="muted"></p>
      </form>
      <h2>Modelos enviados</h2>
      <div id="lista"></div>
    </main>`

  document.querySelector('#sair').onclick = async () => {
    await supabase.auth.signOut()
    login()
  }

  document.querySelector('#f-up').onsubmit = async (e) => {
    e.preventDefault()
    const form = e.target
    const msg = document.querySelector('#msg')
    const file = document.querySelector('#arq').files[0]
    const capaFile = document.querySelector('#capa').files[0]
    const formato = file.name.split('.').pop().toLowerCase()
    if (!FORMATOS.includes(formato)) { msg.textContent = 'Formato não suportado.'; return }

    let path, capaPath
    try {
      msg.textContent = 'Enviando modelo…'
      path = `${crypto.randomUUID()}.${formato}`
      const up = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: CACHE })
      if (up.error) throw up.error

      msg.textContent = 'Gerando capa em WebP…'
      const blob = capaFile
        ? await paraWebp(capaFile)
        : await capaDoModelo(URL.createObjectURL(file), formato)
      capaPath = await enviarCapa(blob)

      const ins = await supabase.from('modelos').insert({
        nome: document.querySelector('#nome').value,
        descricao: document.querySelector('#desc').value,
        arquivo_path: path,
        formato,
        capa_path: capaPath,
        publico: document.querySelector('#pub').checked,
        destaque: document.querySelector('#dest').checked,
        mais_vendido: document.querySelector('#vend').checked,
      })
      if (ins.error) throw ins.error
    } catch (err) {
      console.error(err)
      const lixo = [path, capaPath].filter(Boolean)
      if (lixo.length) await supabase.storage.from(BUCKET).remove(lixo)
      msg.textContent = 'Erro: ' + (err.message || err)
      return
    }
    msg.textContent = 'Modelo enviado!'
    form.reset()
    listar()
  }
  listar()
}

async function listar() {
  const lista = document.querySelector('#lista')
  const { data, error } = await supabase
    .from('modelos')
    .select('*')
    .order('criado_em', { ascending: false })

  if (error) {
    console.error(error)
    lista.innerHTML = ''
    const p = document.createElement('p')
    p.className = 'muted'
    p.textContent = 'Erro ao listar: ' + error.message
    lista.append(p)
    return
  }

  lista.innerHTML = ''
  if (!data.length) {
    lista.innerHTML = '<p class="muted">Nenhum modelo enviado ainda.</p>'
    return
  }

  const botao = (txt, fn) => {
    const b = document.createElement('button')
    b.className = 'btn small'
    b.textContent = txt
    b.onclick = fn
    return b
  }

  for (const m of data) {
    const link = linkDe(m.id)
    const row = document.createElement('div')
    row.className = 'row'

    const thumb = document.createElement('div')
    thumb.className = 'thumb'
    if (m.capa_path) {
      const img = document.createElement('img')
      img.src = urlPublica(m.capa_path)
      img.alt = ''
      img.loading = 'lazy'
      thumb.append(img)
    } else {
      thumb.textContent = 'sem capa'
    }

    const t = document.createElement('strong')
    t.textContent = `${m.nome} (${m.formato.toUpperCase()})`

    const marcador = (coluna, texto) => {
      const l = document.createElement('label')
      l.className = 'check'
      const c = document.createElement('input')
      c.type = 'checkbox'
      c.checked = !!m[coluna]
      c.onchange = async () => {
        const { error } = await supabase.from('modelos').update({ [coluna]: c.checked }).eq('id', m.id)
        if (error) { alert('Erro: ' + error.message); c.checked = !c.checked }
      }
      l.append(c, ' ' + texto)
      return l
    }

    const gerar = botao(m.capa_path ? 'Refazer capa' : 'Gerar capa', async () => {
      gerar.disabled = true
      gerar.textContent = 'Gerando…'
      try {
        const blob = await capaDoModelo(urlPublica(m.arquivo_path), m.formato)
        const novo = await enviarCapa(blob)
        const { error } = await supabase.from('modelos').update({ capa_path: novo }).eq('id', m.id)
        if (error) throw error
        if (m.capa_path) await supabase.storage.from(BUCKET).remove([m.capa_path])
        listar()
      } catch (err) {
        alert('Erro: ' + (err.message || err))
        gerar.disabled = false
        gerar.textContent = 'Gerar capa'
      }
    })

    row.append(
      thumb,
      t,
      marcador('publico', 'Galeria'),
      marcador('destaque', 'Destaque'),
      marcador('mais_vendido', 'Mais vendido'),
      gerar,
      botao('Abrir', () => window.open(link, '_blank')),
      botao('Copiar link', async () => { await navigator.clipboard.writeText(link); alert('Link copiado!') }),
      botao('WhatsApp', () => window.open('https://wa.me/?text=' + encodeURIComponent('Veja o seu modelo 3D: ' + link))),
      botao('Excluir', async () => {
        if (!confirm('Excluir este modelo?')) return
        const arquivos = [m.arquivo_path, m.capa_path].filter(Boolean)
        await supabase.storage.from(BUCKET).remove(arquivos)
        await supabase.from('modelos').delete().eq('id', m.id)
        listar()
      })
    )
    lista.append(row)
  }
}