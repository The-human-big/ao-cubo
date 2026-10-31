import './style.css'
import { initPortal, carregarGaleria } from './portal.js'

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
        <div class="floating-label">
          <span>01 / 03</span>
          <strong>DESIGN EM 3D</strong>
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
        <div class="empty-icon">◇</div>
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