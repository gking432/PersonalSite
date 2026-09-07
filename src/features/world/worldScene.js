import * as T from 'three'
import { Sky } from 'three/addons/objects/Sky.js'

import { locations, findRoute } from './worldNavigation'

export function createWorld(host, callbacks) {
  let disposed = false, current = 'road', moving = false, night = false, reduced = false, paused = false
  let yaw = 0, pitch = .035, route = [], segment = null, elapsed = 0, lastFrame = 0
  let seed = 83
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }
  const scene = new T.Scene()
  scene.fog = new T.FogExp2('#d8dcc2', .007)
  const camera = new T.PerspectiveCamera(65, 1, .08, 250)
  camera.rotation.order = 'YXZ'
  camera.position.fromArray(locations.road.p)
  const renderer = new T.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = T.PCFSoftShadowMap
  renderer.toneMapping = T.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.domElement.tabIndex = 0
  renderer.domElement.setAttribute('aria-label', 'Explore the 3D world. Drag to look around; click a glowing ground marker to walk. Arrow keys look around. Use the destination buttons to travel with a keyboard.')
  host.appendChild(renderer.domElement)
  const resources = new Set(), textures = new Set()
  const material = (color, extra = {}) => { const m = new T.MeshStandardMaterial({ color, roughness: .86, ...extra }); resources.add(m); return m }
  const stone = material('#e7d5aa'), trim = material('#f3e5bf'), roof = material('#a85e3f'), wood = material('#604a31'), dark = material('#253c2e'), gold = material('#c4a156', { metalness: .55, roughness: .35 }), leaf = material('#4b6633'), water = material('#699d94', { metalness: .4, roughness: .18 })
  // A small repeatable surface texture gives the modeled stone a tactile grain.
  const surface = document.createElement('canvas'); surface.width = surface.height = 128
  const ctx = surface.getContext('2d'); ctx.fillStyle = '#d9c9a4'; ctx.fillRect(0, 0, 128, 128)
  for (let i = 0; i < 5000; i++) { const v = 105 + random() * 120; ctx.fillStyle = `rgba(${v},${v},${v},.16)`; ctx.fillRect(random() * 128, random() * 128, 2, 2) }
  ctx.strokeStyle = '#84744f55'; ctx.lineWidth = 1; for (let y = 0; y < 128; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(128, y); ctx.stroke(); for (let x = (y / 32 % 2) * 32; x < 128; x += 64) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 32); ctx.stroke() } }
  const stoneMap = new T.CanvasTexture(surface); stoneMap.wrapS = stoneMap.wrapT = T.RepeatWrapping; stoneMap.repeat.set(2, 2); textures.add(stoneMap); stone.map = stoneMap; stone.bumpMap = stoneMap; stone.bumpScale = .055
  const mesh = (geo, mat, x, y, z, parent = scene) => { resources.add(geo); const o = new T.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o }
  const box = (w, h, d, x, y, z, mat = stone, parent = scene) => mesh(new T.BoxGeometry(w, h, d), mat, x, y, z, parent)
  const cylinder = (r1, r2, h, x, y, z, mat = stone, sides = 24, parent = scene) => mesh(new T.CylinderGeometry(r1, r2, h, sides), mat, x, y, z, parent)
  const sphere = (r, x, y, z, mat, parent = scene) => mesh(new T.IcosahedronGeometry(r, 2), mat, x, y, z, parent)
  const arch = (x, z, width, spring, depth = .65, parent = scene) => {
    const radius = width / 2, outer = radius + .5
    const shape = new T.Shape(); shape.moveTo(-outer, 0); shape.lineTo(-outer, spring); shape.absarc(0, spring, outer, Math.PI, 0, true); shape.lineTo(outer, 0); shape.lineTo(radius, 0); shape.lineTo(radius, spring); shape.absarc(0, spring, radius, 0, Math.PI, false); shape.lineTo(-radius, 0); shape.closePath()
    return mesh(new T.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 28 }), stone, x, .05, z, parent)
  }
  const column = (x, z, height, parent = scene) => { cylinder(.24, .32, height, x, height / 2, z, trim, 16, parent); box(.78, .25, .78, x, .15, z, trim, parent); box(.75, .22, .75, x, height, z, trim, parent); cylinder(.37, .25, .3, x, height - .25, z, trim, 16, parent) }
  const sign = (text, sub, x, y, z, width = 3, parent = scene) => {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 320; const g = c.getContext('2d')
    g.fillStyle = '#ece1bf'; g.fillRect(0, 0, 1024, 320); g.strokeStyle = '#8d744a'; g.lineWidth = 5; g.strokeRect(15, 15, 994, 290)
    g.textAlign = 'center'; g.fillStyle = '#294134'; g.font = '60px Georgia'; g.fillText(text, 512, 138); g.font = '25px sans-serif'; g.fillText(sub, 512, 213)
    const texture = new T.CanvasTexture(c); texture.colorSpace = T.SRGBColorSpace; textures.add(texture)
    const mat = material('#ffffff', { map: texture, roughness: 1 })
    return mesh(new T.PlaneGeometry(width, width * .3125), mat, x, y, z, parent)
  }
  const hemi = new T.HemisphereLight('#c4def0', '#8a8054', 2.4); scene.add(hemi)
  const sunlight = new T.DirectionalLight('#ffe0a1', 3.5); sunlight.position.set(-25, 38, 30); sunlight.castShadow = true
  sunlight.shadow.mapSize.set(2048, 2048); Object.assign(sunlight.shadow.camera, { left: -42, right: 42, top: 48, bottom: -48, near: .5, far: 130 }); sunlight.shadow.normalBias = .06; scene.add(sunlight)
  const sky = new Sky(); sky.scale.setScalar(400); scene.add(sky)
  sky.material.uniforms.turbidity.value = 7; sky.material.uniforms.rayleigh.value = 1.7; sky.material.uniforms.mieCoefficient.value = .004; sky.material.uniforms.sunPosition.value.copy(sunlight.position).normalize()
  const cloudMat = material('#fff7e5', { roughness: 1 }); const clouds = new T.Group(); scene.add(clouds)
  for (let i = 0; i < 24; i++) { const x = (random() - .5) * 220, z = -60 - random() * 90, y = 30 + random() * 25; for (let j = 0; j < 5; j++) { const c = sphere(3 + random() * 4, x + j * 4, y + random() * 2, z, cloudMat, clouds); c.scale.y = .55; c.castShadow = false } }
  box(450, .25, 450, 0, -.3, 0, material('#81975a'))
  box(7, .1, 80, 0, -.1, 36, material('#c3b18a'))
  box(43, .14, 37, 0, -.06, -1, material('#cdbf9e'))
  // Instanced paving and vegetation keep the world inexpensive to draw.
  const pavingGeo = new T.BoxGeometry(1.1, .035, .72); resources.add(pavingGeo)
  const paving = new T.InstancedMesh(pavingGeo, stone, 1500); let count = 0; const dummy = new T.Object3D()
  for (let x = -20; x < 21; x += 1.25) for (let z = -17; z < 17; z += .9) { if (count >= 1500) break; dummy.position.set(x + ((Math.round(z / .9) % 2) * .55), .02, z); dummy.rotation.y = (random() - .5) * .045; dummy.updateMatrix(); paving.setMatrixAt(count++, dummy.matrix) }
  paving.count = count; paving.receiveShadow = true; scene.add(paving)
  // Crossed, tapered leaves make recognizable corn stalks, with real parallax.
  const cornVertices = []
  const triangle = (a, b, c) => cornVertices.push(...a, ...b, ...c)
  triangle([-.035, 0, 0], [.035, 0, 0], [0, 1.9, 0])
  triangle([0, 0, -.035], [0, 0, .035], [0, 1.9, 0])
  for (let i = 0; i < 7; i++) {
    const a = i * 2.4, y = .3 + i * .18, length = .5 + (7 - i) * .035
    const base = [0, y, 0], edge = [Math.cos(a) * length * .5, y + .22, Math.sin(a) * length * .5], tip = [Math.cos(a) * length, y + .08, Math.sin(a) * length]
    const wide = [edge[0] + Math.sin(a) * .09, edge[1], edge[2] - Math.cos(a) * .09]
    triangle(base, wide, tip); triangle(base, tip, edge)
  }
  const stalkGeo = new T.BufferGeometry(); stalkGeo.setAttribute('position', new T.Float32BufferAttribute(cornVertices, 3)); stalkGeo.computeVertexNormals(); resources.add(stalkGeo)
  const corn = new T.InstancedMesh(stalkGeo, material('#899347', { side: T.DoubleSide }), 11000)
  for (let i = 0; i < 11000; i++) { const side = i % 2 ? 1 : -1; dummy.position.set(side * (5.5 + random() * 48), 0, 20 + random() * 74); dummy.scale.setScalar(.7 + random() * .7); dummy.rotation.y = random() * 6; dummy.updateMatrix(); corn.setMatrixAt(i, dummy.matrix); corn.setColorAt(i, new T.Color().setHSL(.17 + random() * .04, .35, .3 + random() * .17)) }; scene.add(corn); dummy.scale.set(1, 1, 1)
  // The road has a low farm fence and meadow flowers around its edges.
  for (const side of [-1, 1]) {
    for (let z = 29; z < 75; z += 4) box(.13, 1, .13, side * 4.8, .5, z, wood)
    for (const y of [.4, .8]) box(.11, .1, 45, side * 4.8, y, 51, wood)
  }
  const flowerGeo = new T.IcosahedronGeometry(.075, 0); resources.add(flowerGeo)
  const meadow = new T.InstancedMesh(flowerGeo, material('#fff1bb'), 1800)
  for (let i = 0; i < 1800; i++) { const side = i % 2 ? 1 : -1; dummy.position.set(side * (3.65 + random() * 1.2), .15 + random() * .4, 26 + random() * 55); dummy.rotation.set(0, random() * 6, 0); dummy.updateMatrix(); meadow.setMatrixAt(i, dummy.matrix) }; scene.add(meadow)
  const hillMat = material('#7c9265')
  for (let i = 0; i < 12; i++) { const hill = sphere(24, -140 + i * 25, 0, -92 - random() * 40, hillMat); hill.scale.set(1.5, .2 + random() * .15, 1); hill.castShadow = false }
  const tree = (x, z, h = 8) => { cylinder(.16, .24, h * .65, x, h * .3, z, wood, 7); const crown = sphere(1, x, h * .63, z, dark); crown.scale.set(1.05, h * .48, 1.05) }
  for (const x of [-22, 22]) for (let z = -30; z < 28; z += 9) tree(x + random() * 2, z, 7 + random() * 3)
  for (let i = 0; i < 22; i++) tree((random() - .5) * 130, -45 - random() * 35, 5 + random() * 5)
  // The entrance is a true open arch; the camera passes through its opening.
  arch(0, 24, 6, 4.1, 1.3); box(9, .5, 1.9, 0, 7.75, 24.65, trim)
  column(-4, 24.9, 7.2); column(4, 24.9, 7.2)
  box(.17, 1.5, .18, 0, 8.8, 24.65, gold); box(.9, .16, .18, 0, 9, 24.65, gold)
  sign('SOMEWHERE', 'CURIOSITY ENCOURAGED', 0, 7.35, 25.98, 3.8)
  box(.18, 1.6, .18, 4.7, .8, 27, wood); box(.65, .5, 1, 4.7, 1.75, 27, dark); box(.08, .5, .05, 5.05, 2.05, 27, roof)
  // Fountain: a physical obstacle. Navigation paths go around it.
  cylinder(3.1, 3.25, .4, 0, .2, 2, trim, 48); cylinder(2.75, 2.75, .11, 0, .46, 2, water, 48)
  cylinder(.38, .65, 1.8, 0, 1.1, 2, stone); cylinder(1.35, .55, .4, 0, 1.9, 2, trim); cylinder(.2, .3, 1.1, 0, 2.4, 2, stone); cylinder(.75, .3, .22, 0, 2.95, 2, trim)
  const drops = new T.Group(); scene.add(drops)
  for (let i = 0; i < 36; i++) { const angle = i / 36 * Math.PI * 2; const drop = sphere(.035, Math.cos(angle) * .8, 1, 2 + Math.sin(angle) * .8, water, drops); drop.userData.phase = random() * 3 }
  const interactives = []
  const building = (x, z, title, room) => {
    const w = 10, d = 11, h = 5.4
    box(.5, h, d, x - w / 2, h / 2, z - d / 2); box(.5, h, d, x + w / 2, h / 2, z - d / 2); box(w, h, .5, x, h / 2, z - d)
    box(3.4, h, .55, x - 3.35, h / 2, z); box(3.4, h, .55, x + 3.35, h / 2, z); arch(x, z - .3, 3.2, 2.5, .8); box(3.3, 1.15, .55, x, 4.95, z)
    box(10.5, .18, 11.5, x, .12, z - 5.5, trim)
    for (const side of [-1, 1]) { const r = box(6, .28, 12, x + side * 2.6, 6.25, z - 5.5, roof); r.rotation.z = -side * .3 }
    box(.35, .35, 12, x, 7.1, z - 5.5, roof)
    for (let j = 0; j < 12; j++) for (const side of [-1, 1]) { const r = box(5.9, .055, .065, x + side * 2.6, 6.44, z - j, material(j % 2 ? '#b9724f' : '#ad6345')); r.rotation.z = -side * .3 }
    column(x - 4.5, z + .6, 4.8); column(x + 4.5, z + .6, 4.8); sign(title, room === 'library' ? 'IDEAS, EVIDENCE & THE WORK BEHIND THEM' : 'USEFUL THINGS, MADE WITH CURIOSITY', x, 4.75, z + .45, 4.8)
    box(10.5, .18, .8, x, 5.25, z + .15, trim)
    const glass = material('#586f69', { metalness: .35, roughness: .26 })
    for (const side of [-1, 1]) {
      const wx = x + side * 3.3, outline = new T.Shape()
      outline.moveTo(-.65, 0); outline.lineTo(-.65, 1.05); outline.absarc(0, 1.05, .65, Math.PI, 0, true); outline.lineTo(.65, 0); outline.closePath()
      mesh(new T.ShapeGeometry(outline), glass, wx, 1.6, z + .3)
      box(.09, 1.7, .1, wx, 2.4, z + .36, gold); box(1.35, .08, .1, wx, 2.35, z + .36, gold); box(1.55, .14, .45, wx, 1.55, z + .3, trim)
      cylinder(.38, .24, .65, x + side * 2, .36, z + .8, roof, 16)
      for (let j = 0; j < 9; j++) { const a = j * 2.4; sphere(.18, x + side * 2 + Math.cos(a) * .26, .9 + random() * .25, z + .8 + Math.sin(a) * .26, j % 3 ? leaf : trim) }
      for (let j = 0; j < 30; j++) {
        const h = j * .17, vineX = x + side * (4.65 - Math.max(0, h - 3.5) * 1.4)
        const ivy = sphere(.2 + random() * .14, vineX + Math.sin(j) * .18, h, z + .4, leaf); ivy.scale.set(1, .7, .4)
      }
    }
    for (let j = 0; j < 4; j++) box(.17, .24, d, x - 3.6 + j * 2.4, 5.2, z - d / 2, wood)
    const warm = new T.PointLight('#ffca78', 30, 15, 2); warm.position.set(x, 3.5, z - 5); scene.add(warm)
    if (room === 'workshop') {
      box(6.5, .22, 1.7, x, 1, z - 8.8, wood); for (const dx of [-2.8, 2.8]) box(.2, 1, 1.4, x + dx, .5, z - 8.8, wood)
      const loader = new T.TextureLoader()
      ;['project-northstar.png', 'project-prepme.png', 'project-steward.jpg'].forEach((file, i) => {
        const screen = box(1.8, 1.25, .13, x + (i - 1) * 2.2, 2, z - 8.8, dark)
        const tex = loader.load('/images/' + file, () => { if (disposed) tex.dispose() }); tex.colorSpace = T.SRGBColorSpace; textures.add(tex)
        const face = mesh(new T.PlaneGeometry(1.65, 1.08), material('#ffffff', { map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: .35 }), screen.position.x, 2, z - 8.72); face.userData.room = 'workshop'; interactives.push(face)
      })
      sign('THE WORKSHOP', 'CLICK THE SCREENS TO EXPLORE THE DEMOS', x, 3.8, z - 10.7, 5)
    } else {
      const bookMats = ['#6c3931', '#334e43', '#b99650', '#5a6a7d', '#9a6e4a'].map(c => material(c))
      for (const side of [-1, 1]) for (let row = 0; row < 4; row++) { box(1.1, .12, 8, x + side * 4.25, .6 + row, z - 6, wood); for (let b = 0; b < 21; b++) box(.65, .5 + random() * .3, .18, x + side * 4.25, .92 + row, z - 2.5 - b * .33, bookMats[b % 5]) }
      box(3.3, .16, 2, x, 1, z - 8.3, wood); const book = box(1.3, .1, .9, x, 1.15, z - 8, trim); book.userData.room = 'library'; interactives.push(book)
      sign('THE LIBRARY', 'CLICK THE OPEN BOOK · READ THE CASE STUDIES', x, 3, z - 10.7, 5.8)
    }
  }
  building(12, -6, 'THE WORKSHOP', 'workshop'); building(-12, -6, 'THE LIBRARY', 'library')
  // Chapel nave, open front door, raised bell tower, and colored rose window.
  box(.5, 7, 13, -4, 3.5, -24.5); box(.5, 7, 13, 4, 3.5, -24.5); box(8, 7, .5, 0, 3.5, -31)
  box(2.5, 7, .5, -2.8, 3.5, -18); box(2.5, 7, .5, 2.8, 3.5, -18); arch(0, -18.25, 3, 2.8, .65); box(3.1, 2.4, .5, 0, 5.8, -18)
  box(8.6, .3, 13.7, 0, 7.1, -24.5, roof)
  box(3, 8, 3, 2.5, 11, -28, stone)
  for (const dx of [-1.1, 1.1]) column(2.5 + dx, -26.5, 15.8)
  cylinder(.4, .7, .8, 2.5, 14.3, -26.5, gold); const spire = mesh(new T.ConeGeometry(2.4, 3, 4), roof, 2.5, 17, -28); spire.rotation.y = Math.PI / 4
  box(.15, 1.8, .15, 2.5, 19, -28, gold); box(1, .15, .15, 2.5, 19.3, -28, gold)
  const rose = mesh(new T.CircleGeometry(1.1, 40), material('#bd824f', { emissive: '#b97538', emissiveIntensity: .4, side: T.DoubleSide }), 0, 5.4, -17.72)
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; const pane = mesh(new T.CircleGeometry(.3, 16), material(i % 2 ? '#697caa' : '#c99758', { emissive: i % 2 ? '#697caa' : '#c99758', emissiveIntensity: .5, side: T.DoubleSide }), Math.cos(a) * .65, 5.4 + Math.sin(a) * .65, -17.7); pane.castShadow = false }
  sign('THE QUIET ROOM', 'LEAVE A NOTE. START SOMETHING GOOD.', 0, 3.2, -30.7, 5)
  box(2.6, .18, 1.5, 0, 1, -28, wood); for (const x of [-2, 2]) for (let z = -21; z > -27; z -= 2) { box(1.5, .15, .55, x, .6, z, wood); box(1.5, .65, .12, x, .95, z - .2, wood) }
  const note = box(.7, .02, .45, 0, 1.11, -27.8, trim); note.userData.room = 'post'; interactives.push(note)
  const chapelLight = new T.PointLight('#edbb76', 45, 18); chapelLight.position.set(0, 4, -24); scene.add(chapelLight)
  // Garden colonnade, flower beds, a bench, and a rural gilded silo.
  for (let i = 0; i < 4; i++) { arch(-17 + i * 3.1, 9, 2.5, 2.4, .55); box(3.2, .2, 1, -17 + i * 3.1, 4.4, 9.3, roof) }
  for (const z of [6, 12]) { box(10, .4, .9, -13, .2, z, stone); for (let i = 0; i < 28; i++) { const f = sphere(.22, -17.8 + i * .35, .7 + random() * .3, z, i % 3 ? leaf : material('#ccad86')); f.scale.y = 1.4 } }
  box(2.5, .16, .65, -8, .6, 6, wood); box(2.5, .8, .12, -8, 1, 5.7, wood)
  cylinder(2.8, 2.8, 12, 27, 6, -23, material('#bcbab0'), 32); const dome = sphere(2.85, 27, 12, -23, gold); dome.scale.y = .7
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; cylinder(.04, .04, 12, 27 + Math.cos(a) * 2.85, 6, -23 + Math.sin(a) * 2.85, trim, 5) }
  // Glowing navigation rings belong to the ground in 3D, not to the screen.
  const markers = new Map(), markerMat = new T.MeshBasicMaterial({ color: '#fff2bb', transparent: true, opacity: .92, depthWrite: false }); resources.add(markerMat)
  for (const [id, node] of Object.entries(locations)) { const ring = mesh(new T.TorusGeometry(.55, .055, 8, 40), markerMat, node.p[0], .2, node.p[2]); ring.rotation.x = -Math.PI / 2; ring.userData.destination = id; ring.castShadow = false; const target = mesh(new T.CircleGeometry(.62, 32), material('#fff2bb', { transparent: true, opacity: .12, side: T.DoubleSide, depthWrite: false }), 0, 0, .006, ring); target.userData.destination = id; target.castShadow = false; markers.set(id, ring) }
  function updateMarkers() { for (const [id, ring] of markers) ring.visible = !moving && locations[current].links.includes(id) }
  updateMarkers()
  const raycaster = new T.Raycaster(), pointer = new T.Vector2()
  const routeTo = id => { if (moving || !locations[id] || id === current) return; route = findRoute(current, id); if (!route.length) return; moving = true; callbacks.onTravel(true); updateMarkers(); nextSegment() }
  function nextSegment() {
    const target = route.shift()
    if (!target) { moving = false; segment = null; callbacks.onTravel(false); updateMarkers(); return }
    const end = new T.Vector3().fromArray(locations[target].p), start = camera.position.clone(), direction = end.clone().sub(start)
    const targetYaw = Math.atan2(-direction.x, -direction.z)
    segment = { target, start, end, time: 0, duration: reduced ? .01 : Math.max(1.8, start.distanceTo(end) / 4.3), yawStart: yaw, yawEnd: yaw + Math.atan2(Math.sin(targetYaw - yaw), Math.cos(targetYaw - yaw)) }
  }
  let down = null
  const pointerDown = e => { if (e.button !== 0) return; down = { x: e.clientX, y: e.clientY, lastX: e.clientX, lastY: e.clientY, drag: false }; renderer.domElement.setPointerCapture(e.pointerId) }
  const pointerMove = e => { if (!down || moving) return; if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) down.drag = true; yaw -= (e.clientX - down.lastX) * .004; pitch = T.MathUtils.clamp(pitch - (e.clientY - down.lastY) * .003, -.9, 1.15); down.lastX = e.clientX; down.lastY = e.clientY }
  const pointerUp = e => {
    if (!down) return
    const click = !down.drag; down = null
    if (!click || moving) return
    const rect = renderer.domElement.getBoundingClientRect(); pointer.set((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1); raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects([...markers.values()].filter(o => o.visible).concat(interactives))
    if (hits.length) { const hit = hits[0]; if (hit.object.userData.destination) routeTo(hit.object.userData.destination); else if (hit.distance < 7) callbacks.onOpen(hit.object.userData.room) }
  }
  const cancelPointer = () => { down = null }
  const keyDown = e => { if (moving) return; if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) { e.preventDefault(); if (e.key === 'ArrowLeft') yaw += .16; if (e.key === 'ArrowRight') yaw -= .16; if (e.key === 'ArrowUp') pitch = Math.min(1.15, pitch + .1); if (e.key === 'ArrowDown') pitch = Math.max(-.9, pitch - .1) } }
  const canvas = renderer.domElement
  canvas.addEventListener('pointerdown', pointerDown); canvas.addEventListener('pointermove', pointerMove); canvas.addEventListener('pointerup', pointerUp); canvas.addEventListener('pointercancel', cancelPointer); canvas.addEventListener('keydown', keyDown)
  const lost = e => { e.preventDefault(); callbacks.onError('The 3D view was interrupted. Reload the world, or use the portfolio links.'); renderer.setAnimationLoop(null) }
  canvas.addEventListener('webglcontextlost', lost)
  const resize = () => { const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix() }
  const observer = new ResizeObserver(resize); observer.observe(host); resize()
  renderer.setAnimationLoop(time => {
    const dt = Math.min((time - lastFrame) / 1000 || .016, .05); lastFrame = time
    if (document.hidden || paused) return
    if (!reduced) elapsed += dt
    if (segment) {
      segment.time += dt; const t = Math.min(segment.time / segment.duration, 1), ease = t * t * (3 - 2 * t)
      camera.position.lerpVectors(segment.start, segment.end, ease)
      if (!reduced) camera.position.y += Math.sin(t * Math.PI * 10) * .018 * Math.sin(t * Math.PI)
      yaw = T.MathUtils.lerp(segment.yawStart, segment.yawEnd, Math.min(1, t * 3)); pitch = T.MathUtils.lerp(pitch, 0, .08)
      if (t === 1) { current = segment.target; camera.position.copy(segment.end); callbacks.onLocation(current); nextSegment() }
    }
    camera.rotation.set(pitch, yaw, 0, 'YXZ')
    drops.children.forEach((drop, i) => { drop.position.y = .5 + ((elapsed * .8 + drop.userData.phase) % 2.4); const a = i / 36 * Math.PI * 2; const radius = .6 + (2.9 - drop.position.y) * .27; drop.position.x = Math.cos(a) * radius; drop.position.z = 2 + Math.sin(a) * radius })
    clouds.position.x = Math.sin(elapsed * .007) * 3
    for (const ring of markers.values()) ring.scale.setScalar(1 + Math.sin(elapsed * 2) * .07)
    renderer.render(scene, camera)
  })
  callbacks.onReady()
  return {
    go: routeTo,
    turn: angle => { if (!moving) yaw += angle },
    setReduced: value => { reduced = value },
    setPaused: value => { paused = value },
    setNight: value => { night = value; sunlight.intensity = night ? .45 : 3.5; hemi.intensity = night ? 1 : 2.4; renderer.toneMappingExposure = night ? .75 : 1.05; scene.fog.color.set(night ? '#7b8f99' : '#d8dcc2'); sky.material.uniforms.sunPosition.value.set(-25, night ? -2 : 38, 30).normalize() },
    dispose: () => { disposed = true; renderer.setAnimationLoop(null); observer.disconnect(); canvas.removeEventListener('pointerdown', pointerDown); canvas.removeEventListener('pointermove', pointerMove); canvas.removeEventListener('pointerup', pointerUp); canvas.removeEventListener('pointercancel', cancelPointer); canvas.removeEventListener('keydown', keyDown); canvas.removeEventListener('webglcontextlost', lost); scene.traverse(o => { if (o.geometry) resources.add(o.geometry); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => resources.add(m)) }); resources.forEach(r => r.dispose()); textures.forEach(t => t.dispose()); renderer.dispose(); canvas.remove() },
  }
}
