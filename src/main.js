import './style.css'
import { initPortal, carregarGaleria } from './portal.js'
import { CONTATO } from './config.js'

document.querySelector('#app').innerHTML = `
  <header class="header">
    <a href="#" class="logo">
  <img src="/logo.png" alt="Ao Cubo³" class="logo-img">
  <span>AO CUBO³</span>
    </a>
    <nav class="navigation">
      <a href="#inicio">Início</a>
      <a href="#projetos">Projetos</a>
      <a href="#sobre">Sobre</a>
      <a href="#modelos">Visualizar modelos</a>
      <a href="#vendidos">Mais vendidos</a>
    </nav>

    <a href="#projetos" class="header-button">
      Explorar projetos
    </a>
  </header>

  <main>
    <section class="hero" id="inicio">
      <div class="hero-content">
        <span class="eyebrow">
          <span class="status-dot"></span>
          PORTAL DE VISUALIZAÇÃO 3D
        </span>

        <h1>
          Sua ideia.<br>
          Nossa tecnologia.<br>
          <span>Em três dimensões.</span>
        </h1>

        <p>
          Explore projetos, visualize cada detalhe e descubra
          novas possibilidades com a tecnologia de impressão 3D
          da Ao Cubo³.
        </p>

        <a href="#projetos" class="primary-button">
          Explorar projetos
          <span>↗</span>
        </a>

        <div class="hero-info">
          <span>MODELAGEM 3D</span>
          <span>IMPRESSÃO 3D</span>
          <span>MANUFATURA ADITIVA</span>
        </div>
      </div>

      <div class="hero-visual">
  <div class="cube-scene">
    <div class="cube">
      <div class="cube-face front"></div>
      <div class="cube-face back"></div>
      <div class="cube-face right"></div>
      <div class="cube-face left"></div>
      <div class="cube-face top"></div>
      <div class="cube-face bottom"></div>
    </div>
  </div>
</div>
        
      </div>
    </section>

    <section class="projects" id="projetos">
      <div class="section-heading">
        <div>
          <span class="eyebrow">NOSSO UNIVERSO</span>
          <h2>Projetos em destaque<span>.</span></h2>
        </div>

        <span class="project-count">01 — EXPLORE</span>
      </div>

      <div class="empty-projects">
        
          <div id="galeria-destaque" class="galeria"></div>
        <p>
          Veja de perto o que fazemos.
        </p>
      </div>
    </section>

    <section class="about" id="sobre">
      <span class="eyebrow">AO CUBO³</span>
      <h2>
        Da ideia à realidade.<br>
        <span>Camada por camada.</span>
      </h2>
      <p>
        Tecnologia, criatividade e fabricação digital
        para transformar ideias em objetos reais.
      </p>
    </section>
    <section class="model-viewer-section" id="modelos">
    <div class="section-header">
    <span class="eyebrow">EXPERIÊNCIA 3D</span>
    <h2>Explore nossos modelos</h2>
    <p>
      Gire, aproxime e explore cada detalhe dos projetos da Ao Cubo³.
    </p>
  </div>
    <div id="galeria" class="galeria"></div>

    <div id="viewer-3d"></div>
  </div>
  <section class="model-viewer-section" id="vendidos">
  <div class="section-header">
    <span class="eyebrow">FAVORITOS DOS CLIENTES</span>
    <h2>Mais vendidos</h2>
    <p>As peças que mais saem da nossa impressora.</p>
  </div>
  <div id="galeria-vendidos" class="galeria"></div>
  </section>
</section>
<section class="contact-section" id="contato">
  <div class="section-header">
    <span class="eyebrow">CONTATO</span>
    <h2>Vamos imprimir sua ideia?</h2>
    <p>Fale com a gente e peça o seu orçamento.</p>
  </div>

  <div class="contact-grid">
    <a class="contact-card" target="_blank" rel="noopener"
       href="https://wa.me/${CONTATO.whatsapp}?text=${encodeURIComponent('Olá! Vim pelo site da Ao Cubo³ e gostaria de um orçamento.')}">
      <small>WHATSAPP</small>
      <strong>${CONTATO.whatsappExibido}</strong>
      <span>Resposta mais rápida</span>
    </a>

    <a class="contact-card" href="mailto:${CONTATO.email}">
      <small>E-MAIL</small>
      <strong>${CONTATO.email}</strong>
      <span>Envie arquivos e detalhes do projeto</span>
    </a>

    ${CONTATO.instagram ? `
    <a class="contact-card" target="_blank" rel="noopener"
       href="https://instagram.com/${CONTATO.instagram}">
      <small>INSTAGRAM</small>
      <strong>@${CONTATO.instagram}</strong>
      <span>Veja nossos trabalhos</span>
    </a>` : ''}

    ${CONTATO.cidade ? `
    <div class="contact-card">
      <small>LOCALIZAÇÃO</small>
      <strong>${CONTATO.cidade}</strong>
      <span>Atendimento e envios</span>
    </div>` : ''}
  </div>
</section>

<footer class="site-footer">© ${new Date().getFullYear()} Ao Cubo³ · Impressão 3D e Sistemas Digitais</footer>

<a class="zap-float" target="_blank" rel="noopener" aria-label="Falar no WhatsApp"
   href="https://wa.me/${CONTATO.whatsapp}?text=${encodeURIComponent('Olá! Vim pelo site da Ao Cubo³.')}">
  <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
</a>
  </main>

  <footer class="footer">
    <a href="#" class="logo">
  <img src="/logo.png" alt="Ao Cubo³" class="logo-img">
  <span>AO CUBO³</span>
    </a>
    <span>© ${new Date().getFullYear()} Ao Cubo³. Todos os direitos reservados.</span>
    <span>TECNOLOGIA EM CADA CAMADA.</span>
  </footer>
`
const viewerContainer = document.querySelector('#viewer-3d')

if (!initPortal()) {
  const g = document.querySelector('#galeria')
  if (g) carregarGaleria(g, 'publico')

  const d = document.querySelector('#galeria-destaque')
  if (d) carregarGaleria(d, 'destaque', 'Novos projetos em breve.')

  const v = document.querySelector('#galeria-vendidos')
  if (v) carregarGaleria(v, 'mais_vendido', 'Em breve, os mais vendidos por aqui.')
}