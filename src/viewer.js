import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const LOADERS = { stl: STLLoader, obj: OBJLoader, '3mf': ThreeMFLoader, glb: GLTFLoader }

function lerArquivo(Loader, url, onProgress) {
  return new Promise((ok, erro) =>
    new Loader().load(
      url,
      ok,
      (e) => e.lengthComputable && onProgress?.(e.loaded / e.total),
      erro
    )
  )
}

export function createViewer(container) {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100000)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.innerHTML = ''
  container.appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.autoRotateSpeed = 2

  // Iluminação: principal + preenchimento + contraluz
  scene.add(new THREE.HemisphereLight(0xffffff, 0x334455, 1.1))
  const sun = new THREE.DirectionalLight(0xffffff, 2.2)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.bias = -0.0005
  scene.add(sun)
  const fill = new THREE.DirectionalLight(0x9ec5ff, 0.8)
  fill.position.set(-2, 1, -1)
  scene.add(fill)

  let grupo = null
  let grade = null
  let chao = null
  let maxDim = 100
  let corPropria = false
  let wireframe = false
  let cor = 0x4da3ff
  let casa = { pos: new THREE.Vector3(1, 0.8, 1), alvo: new THREE.Vector3() }

  function resize() {
    const w = container.clientWidth
    const h = container.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  new ResizeObserver(resize).observe(container)
  resize()

  let rodando = true
  function animate() {
    if (!rodando) return
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()

  const material = () =>
    new THREE.MeshStandardMaterial({ color: cor, metalness: 0.15, roughness: 0.5 })

  function meshes(fn) {
    grupo?.traverse((c) => c.isMesh && fn(c))
  }

  async function loadModel(url, formato, onProgress) {
    const f = formato.toLowerCase()
    const Loader = LOADERS[f]
    if (!Loader) throw new Error('Formato não suportado: ' + formato)

    let obj
    const dado = await lerArquivo(Loader, url, onProgress)
    if (f === 'stl') {
      dado.computeVertexNormals()
      obj = new THREE.Mesh(dado, material())
      corPropria = true
    } else if (f === 'obj') {
      obj = dado
      obj.traverse((c) => { if (c.isMesh) c.material = material() })
      corPropria = true
    } else if (f === '3mf') {
      obj = dado
      corPropria = false
    } else {
      obj = dado.scene
      corPropria = false
    }

    // STL, OBJ e 3MF usam Z para cima; o Three.js usa Y para cima
    if (['stl', 'obj', '3mf'].includes(f)) obj.rotation.x = -Math.PI / 2

    if (grupo) scene.remove(grupo)
    if (grade) scene.remove(grade)
    if (chao) scene.remove(chao)

    grupo = new THREE.Group()
    grupo.add(obj)
    meshes((m) => { m.castShadow = true })

    let box = new THREE.Box3().setFromObject(grupo)
    grupo.position.sub(box.getCenter(new THREE.Vector3()))
    box = new THREE.Box3().setFromObject(grupo)
    const size = box.getSize(new THREE.Vector3())
    maxDim = Math.max(size.x, size.y, size.z)
    scene.add(grupo)

    // Grade e sombra no chão
    grade = new THREE.GridHelper(maxDim * 3, 30, 0x2f6fb5, 0x263547)
    grade.position.y = box.min.y - maxDim * 0.001
    scene.add(grade)

    chao = new THREE.Mesh(
      new THREE.PlaneGeometry(maxDim * 6, maxDim * 6),
      new THREE.ShadowMaterial({ opacity: 0.35 })
    )
    chao.rotation.x = -Math.PI / 2
    chao.position.y = box.min.y
    chao.receiveShadow = true
    scene.add(chao)

    sun.position.set(maxDim * 1.2, maxDim * 2.2, maxDim * 1.5)
    const s = sun.shadow.camera
    s.left = s.bottom = -maxDim * 1.5
    s.right = s.top = maxDim * 1.5
    s.near = 0.1
    s.far = maxDim * 8
    s.updateProjectionMatrix()

    camera.near = maxDim / 100
    camera.far = maxDim * 100
    camera.updateProjectionMatrix()
    controls.minDistance = maxDim * 0.3
    controls.maxDistance = maxDim * 8
    controls.maxPolarAngle = Math.PI * 0.495 // não deixa passar por baixo do chão

    wireframe = false
    setView('iso')

    // altura = Y do Three.js; profundidade = Z
    return { largura: size.x, profundidade: size.z, altura: size.y }
  }

  function setView(nome) {
    const d = (maxDim / (2 * Math.tan((camera.fov * Math.PI) / 360))) * 1.9
    const posicoes = {
      iso: [d * 0.75, d * 0.55, d * 0.9],
      front: [0, 0, d],
      side: [d, 0, 0],
      top: [0, d, 0.001],
    }
    const p = posicoes[nome] || posicoes.iso
    camera.position.set(...p)
    controls.target.set(0, 0, 0)
    controls.update()
  }

  function toggleAutoRotate() {
    controls.autoRotate = !controls.autoRotate
    return controls.autoRotate
  }
  function toggleGrid() {
    if (!grade) return true
    grade.visible = !grade.visible
    return grade.visible
  }
  function toggleWireframe() {
    wireframe = !wireframe
    meshes((m) => {
      const mats = Array.isArray(m.material) ? m.material : [m.material]
      mats.forEach((x) => (x.wireframe = wireframe))
    })
    return wireframe
  }
  function setColor(hex) {
    cor = hex
    if (!corPropria) return false // 3MF e GLB mantêm as cores originais
    meshes((m) => m.material.color.setHex(hex))
    return true
  }
 function dispose() {
  rodando = false
  renderer.dispose()
  renderer.forceContextLoss()
}

return { loadModel, setView, toggleAutoRotate, toggleGrid, toggleWireframe, setColor, snapshot, dispose }
  function snapshot(larguraMax = 800, qualidade = 0.8) {
  renderer.render(scene, camera)
  const src = renderer.domElement
  const esc = Math.min(1, larguraMax / src.width)
  const c = document.createElement('canvas')
  c.width = Math.round(src.width * esc)
  c.height = Math.round(src.height * esc)
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(c.width / 2, c.height * 0.35, 0, c.width / 2, c.height * 0.35, c.width * 0.8)
  g.addColorStop(0, '#1b2a3d')
  g.addColorStop(1, '#0e1520')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.drawImage(src, 0, 0, c.width, c.height)
  return new Promise((ok) => c.toBlob(ok, 'image/webp', qualidade))
}
}
