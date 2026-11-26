import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { sfx, type SfxId } from '../core/audio'
import { useSave } from '../core/store'

export type V3 = [number, number, number]
// ---------- материалы и геометрии с кэшем ----------
export interface MOpt { rough?: number; metal?: number; em?: number; op?: number; side?: boolean }
const mats = new Map<string, THREE.MeshStandardMaterial>()
export function mat(c: string, o: MOpt = {}) {
  const k = c + JSON.stringify(o)
  let m = mats.get(k)
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color: c, roughness: o.rough ?? 0.5, metalness: o.metal ?? 0, transparent: o.op !== undefined, opacity: o.op ?? 1, side: o.side ? THREE.DoubleSide : THREE.FrontSide, depthWrite: o.op === undefined || o.op > 0.8 })
    if (o.em) { m.emissive.set(c); m.emissiveIntensity = o.em }
    mats.set(k, m)
  }
  return m
}
const geos = new Map<string, THREE.BufferGeometry>()
export function geo<T extends THREE.BufferGeometry>(k: string, f: () => T): T {
  let g = geos.get(k) as T | undefined
  if (!g) { g = f(); geos.set(k, g) }
  return g
}
export const gSphere = () => geo('sph', () => new THREE.SphereGeometry(1, 28, 20))
function starShape(R = 1, r = 0.5, n = 5) { const s = new THREE.Shape(); for (let i = 0; i < n * 2; i++) { const a = Math.PI / 2 + i * Math.PI / n, q = i % 2 ? r : R; i ? s.lineTo(Math.cos(a) * q, Math.sin(a) * q) : s.moveTo(Math.cos(a) * q, Math.sin(a) * q) } s.closePath(); return s }
function heartShape() { const s = new THREE.Shape(); s.moveTo(0, -0.9); s.bezierCurveTo(-1.5, 0.1, -1, 1.1, -0.45, 0.95); s.bezierCurveTo(-0.15, 0.9, 0, 0.65, 0, 0.5); s.bezierCurveTo(0, 0.65, 0.15, 0.9, 0.45, 0.95); s.bezierCurveTo(1, 1.1, 1.5, 0.1, 0, -0.9); return s }
const ext = (s: THREE.Shape, d = 0.3) => { const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelSize: 0.13, bevelThickness: 0.13, bevelSegments: 4, curveSegments: 14 }); g.center(); return g }
export const gStar = () => geo('star', () => ext(starShape()))
export const gHeart = () => geo('heart', () => ext(heartShape()))
export const gBox = (w: number, h: number, d: number, r: number) => geo(`b${w},${h},${d},${r}`, () => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2)))

interface P { p?: V3; r?: V3; s?: number | V3; c?: string; o?: MOpt; ns?: boolean; visible?: boolean; m?: THREE.Material }
const common = (q: P, g: THREE.BufferGeometry) => (
  <mesh geometry={g} material={q.m ?? mat(q.c ?? '#ffffff', q.o)} position={q.p} rotation={q.r} scale={q.s ?? 1} castShadow={!q.ns && !q.o?.op} receiveShadow={!q.o?.op} visible={q.visible ?? true} dispose={null} />
)
export const S = (q: P) => common(q, gSphere())
export const B = (q: P & { a: V3; rad?: number }) => common(q, gBox(q.a[0], q.a[1], q.a[2], q.rad ?? 0.08))
export const C = (q: P & { a: V3; seg?: number }) => common(q, geo(`c${q.a}|${q.seg}`, () => new THREE.CylinderGeometry(q.a[0], q.a[1], q.a[2], q.seg ?? 28)))
export const K = (q: P & { a: [number, number]; seg?: number }) => common(q, geo(`k${q.a}|${q.seg}`, () => new THREE.ConeGeometry(q.a[0], q.a[1], q.seg ?? 28)))
export const T = (q: P & { a: [number, number]; arc?: number }) => common(q, geo(`t${q.a}|${q.arc}`, () => new THREE.TorusGeometry(q.a[0], q.a[1], 14, 36, q.arc ?? Math.PI * 2)))
export const Cap = (q: P & { a: [number, number] }) => common(q, geo(`cp${q.a}`, () => new THREE.CapsuleGeometry(q.a[0], q.a[1], 8, 18)))
export const Disc = (q: P & { a: number }) => common({ ns: true, ...q, r: q.r ?? [-Math.PI / 2, 0, 0] }, geo(`d${q.a}`, () => new THREE.CircleGeometry(q.a, 48)))
export const Star3 = (q: P) => common(q, gStar())
export const Heart3 = (q: P) => common(q, gHeart())

/** Полушарие */
export const Dome = (q: P) => common(q, geo('dome', () => new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2)))

// ---------- текст/эмодзи на табличке ----------
const texs = new Map<string, THREE.CanvasTexture>()
export function textTex(t: string, opt: { w?: number; h?: number; bg?: string; fg?: string; px?: number } = {}) {
  const k = t + JSON.stringify(opt)
  let x = texs.get(k)
  if (!x) {
    const w = opt.w ?? 256, h = opt.h ?? 256, cv = document.createElement('canvas'); cv.width = w; cv.height = h
    const g = cv.getContext('2d')!
    if (opt.bg) { g.fillStyle = opt.bg; g.fillRect(0, 0, w, h) }
    let px = opt.px ?? h * 0.72
    const font = () => { g.font = `800 ${px}px "Noto Sans Armenian","Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif` }
    font(); while (g.measureText(t).width > w * 0.92 && px > 10) { px -= 2; font() }
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = opt.fg ?? '#7a3f78'; g.fillText(t, w / 2, h / 2 + px * 0.06)
    x = new THREE.CanvasTexture(cv); x.colorSpace = THREE.SRGBColorSpace; x.anisotropy = 4
    texs.set(k, x)
  }
  return x
}
export function Emoji({ e, p, s = 1, r }: { e: string; p?: V3; s?: number; r?: V3 }) {
  return <mesh position={p} rotation={r} scale={s}><planeGeometry /><meshBasicMaterial map={textTex(e)} transparent alphaTest={0.08} toneMapped={false} side={THREE.DoubleSide} /></mesh>
}
export function Sign({ t, p, w = 2, h = 0.5, bg = '#fff6fb', fg = '#8a3f86', r }: { t: string; p?: V3; w?: number; h?: number; bg?: string; fg?: string; r?: V3 }) {
  return <group position={p} rotation={r}>
    <B a={[w + 0.16, h + 0.16, 0.14]} rad={0.07} c="#ffb9dc" />
    <mesh position={[0, 0, 0.08]}><planeGeometry args={[w, h]} /><meshBasicMaterial map={textTex(t, { w: 512, h: Math.round(512 * h / w), bg, fg })} toneMapped={false} /></mesh>
  </group>
}

// ---------- частицы ----------
export type FxKind = 'star' | 'heart' | 'confetti' | 'bubble' | 'drop'
const N = 150
interface Part { x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number; max: number; s: number; rx: number; g: number }
const emit: Partial<Record<FxKind, (p: V3, n: number, spread: number) => void>> = {}
export function burst(p: V3 | THREE.Vector3, k: FxKind = 'star', n = 14, spread = 1) { emit[k]?.(Array.isArray(p) ? p : [p.x, p.y, p.z], n, spread) }
/** Дождь из конфетти сверху */
export function shower(c: V3 = [0, 4, 0], w = 4, k: FxKind = 'confetti', n = 70) { for (let i = 0; i < n; i++) setTimeout(() => emit[k]?.([c[0] + (Math.random() - 0.5) * 2 * w, c[1] + Math.random(), c[2] + (Math.random() - 0.5) * w], 1, 0.35), i * 18) }
const COLS = ['#ff8fc5', '#ffd257', '#8fd3ff', '#b79bff', '#8fe3b0', '#ffb07a', '#ff7a9a']
function FxPool({ k }: { k: FxKind }) {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const parts = useRef<Part[]>([])
  const cur = useRef(0)
  const g = useMemo(() => k === 'star' ? gStar() : k === 'heart' ? gHeart() : k === 'confetti' ? geo('cf', () => new THREE.PlaneGeometry(1.4, 1)) : geo('lowsph', () => new THREE.SphereGeometry(1, 12, 10)), [k])
  const m = useMemo(() => k === 'bubble' ? new THREE.MeshStandardMaterial({ color: '#dff6ff', transparent: true, opacity: 0.45, roughness: 0.05, metalness: 0.2, depthWrite: false }) : k === 'drop' ? new THREE.MeshStandardMaterial({ color: '#7fd0ff', transparent: true, opacity: 0.8, roughness: 0.1 }) : new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4, side: THREE.DoubleSide, emissive: '#555555' }), [k])
  useEffect(() => {
    const c = new THREE.Color(), o = new THREE.Object3D(); o.scale.setScalar(0); o.updateMatrix()
    for (let i = 0; i < N; i++) { ref.current.setMatrixAt(i, o.matrix); if (k !== 'bubble' && k !== 'drop') ref.current.setColorAt(i, c.set(k === 'star' ? ['#ffd94f', '#fff0a0', '#ffb7e0'][i % 3] : k === 'heart' ? ['#ff6fae', '#ff9ecb', '#ff5a8f'][i % 3] : COLS[i % COLS.length])) }
    ref.current.instanceMatrix.needsUpdate = true
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true
  }, [k])
  useEffect(() => {
    const fn = (p: V3, n: number, sp: number) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * 6.28, u = Math.random() * sp * 2.4, up = k === 'bubble'
        parts.current[cur.current] = { x: p[0], y: p[1], z: p[2], vx: Math.cos(a) * u, vz: Math.sin(a) * u, vy: up ? 0.6 + Math.random() : (1.5 + Math.random() * 3) * sp, life: 0, max: up ? 2 + Math.random() * 1.6 : 1 + Math.random() * 0.8, s: (k === 'bubble' ? 0.06 + Math.random() * 0.14 : k === 'confetti' ? 0.08 : k === 'drop' ? 0.06 : 0.07 + Math.random() * 0.08), rx: Math.random() * 6, g: up ? -0.25 : k === 'confetti' ? 2.2 : 4.5 }
        cur.current = (cur.current + 1) % N
      }
    }
    emit[k] = fn
    return () => { if (emit[k] === fn) delete emit[k] }
  }, [k])
  const o = useMemo(() => new THREE.Object3D(), [])
  useFrame((st, d) => {
    d = Math.min(d, 0.05); let any = false
    for (let i = 0; i < N; i++) {
      const q = parts.current[i]; if (!q) continue
      any = true; q.life += d
      if (q.life > q.max) { delete parts.current[i]; o.scale.setScalar(0) }
      else {
        q.vy -= q.g * d; q.vx *= 1 - d; q.vz *= 1 - d
        if (k === 'confetti') q.vy = Math.max(q.vy, -1.6)
        q.x += q.vx * d; q.y += q.vy * d; q.z += q.vz * d
        o.position.set(q.x, q.y, q.z); o.rotation.set(k === 'confetti' ? q.rx + q.life * 5 : 0, q.rx + q.life * 3, k === 'bubble' ? 0 : q.life)
        const f = q.life / q.max; o.scale.setScalar(q.s * (f < 0.12 ? f / 0.12 : f > 0.75 ? (1 - f) * 4 : 1))
      }
      o.updateMatrix(); ref.current.setMatrixAt(i, o.matrix)
    }
    if (any) ref.current.instanceMatrix.needsUpdate = true
    void st
  })
  return <instancedMesh ref={ref} args={[g, m, N]} frustumCulled={false} raycast={() => null} />
}
const Fx = () => <><FxPool k="star" /><FxPool k="heart" /><FxPool k="confetti" /><FxPool k="bubble" /><FxPool k="drop" /></>

// ---------- камера, которая вписывает сцену в любой экран ----------
export interface Cam { t: V3; dir?: V3; w: number; h: number; tray?: boolean; speed?: number }
function Rig({ cam }: { cam: Cam }) {
  const { camera, size } = useThree()
  const look = useRef<THREE.Vector3 | null>(null)
  const v = useMemo(() => new THREE.Vector3(), []), v2 = useMemo(() => new THREE.Vector3(), [])
  useFrame((st, d) => {
    const pc = camera as THREE.PerspectiveCamera, tan = Math.tan(THREE.MathUtils.degToRad(pc.fov / 2))
    const top = Math.min(0.16, 84 / size.height), bot = cam.tray ? Math.min(0.28, 150 / size.height) : 0.03, use = 1 - top - bot
    const dist = Math.max(cam.h / use / 2 / tan, cam.w / 2 / (tan * pc.aspect))
    const shift = (bot - top) / 2 * dist * tan * 2
    const dir = v.set(...(cam.dir ?? [0, 0.25, 1])).normalize()
    v2.set(cam.t[0], cam.t[1] - shift, cam.t[2])
    const px = st.pointer.x * dist * 0.02, py = st.pointer.y * dist * 0.012
    const pos = dir.multiplyScalar(dist).add(v2); pos.x += px; pos.y += py
    const k = look.current ? 1 - Math.exp(-d * (cam.speed ?? 3.2)) : 1
    if (!look.current) look.current = v2.clone()
    look.current.lerp(v2, k); camera.position.lerp(pos, k); camera.lookAt(look.current)
  })
  return null
}
function Sky({ a, b }: { a: string; b: string }) {
  const m = useMemo(() => new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { a: { value: new THREE.Color(a) }, b: { value: new THREE.Color(b) } }, vertexShader: 'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}', fragmentShader: 'uniform vec3 a;uniform vec3 b;varying vec3 p;void main(){float h=smoothstep(-.15,.75,normalize(p).y);gl_FragColor=vec4(mix(b,a,h),1.);\n#include <colorspace_fragment>\n}' }), [a, b])
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ camera }) => ref.current.position.copy(camera.position))
  return <mesh ref={ref} material={m} scale={180} renderOrder={-10} raycast={() => null} frustumCulled={false}><sphereGeometry args={[1, 24, 16]} /></mesh>
}
function Env({ i }: { i: number }) {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl), room = new RoomEnvironment(), rt = pm.fromScene(room, 0.04)
    scene.environment = rt.texture; scene.environmentIntensity = i; pm.dispose()
    return () => { scene.environment = null; rt.dispose() }
  }, [gl, scene, i])
  return null
}
function Adaptive() {
  const { setDpr } = useThree()
  const acc = useRef({ t: 0, n: 0, dpr: 0 })
  useFrame((_, d) => {
    const a = acc.current; if (!a.dpr) a.dpr = Math.min(window.devicePixelRatio, 2)
    if (d < 0.5) { a.t += d; a.n++ }
    if (a.t > 2.5) { const fps = a.n / a.t; if (fps < 38 && a.dpr > 0.8) { a.dpr = Math.max(0.8, a.dpr * 0.8); setDpr(a.dpr) } a.t = 0; a.n = 0 }
  })
  return null
}
export interface StageProps { children: ReactNode; cam?: Cam; sky?: [string, string]; shadow?: number; center?: V3; fog?: [number, number]; env?: number; sun?: number; sunColor?: string; onMiss?: () => void }
export function Stage({ children, cam, sky = ['#8ed0ff', '#ffe1f2'], shadow = 9, center = [0, 0, 0], fog, env = 0.5, sun = 1.9, sunColor = '#fff2dc', onMiss }: StageProps) {
  const low = useSave(s => s.lowGfx)
  const tgt = useMemo(() => { const o = new THREE.Object3D(); o.position.set(...center); return o }, [center[0], center[1], center[2]])
  return <Canvas className="stage" shadows={low ? false : 'percentage'} dpr={low ? 1 : [1, 2]} camera={{ fov: 38, near: 0.1, far: 400, position: [0, 4, 12] }} gl={{ antialias: !low, powerPreference: 'high-performance', preserveDrawingBuffer: false }}
    onCreated={({ gl }) => { gl.toneMapping = THREE.NeutralToneMapping; gl.toneMappingExposure = 1.05 }} onPointerMissed={onMiss}>
    <Sky a={sky[0]} b={sky[1]} />
    {fog && <fog attach="fog" args={[sky[1], fog[0], fog[1]]} />}
    <Env i={env} />
    <hemisphereLight args={['#fff6ff', '#ffd9c9', 0.75]} />
    <primitive object={tgt} />
    <directionalLight target={tgt} position={[center[0] + 5, center[1] + 11, center[2] + 7]} intensity={sun} color={sunColor} castShadow={!low} shadow-mapSize={[1024, 1024]} shadow-bias={-0.0006} shadow-normalBias={0.03} shadow-radius={5}>
      <orthographicCamera attach="shadow-camera" args={[-shadow, shadow, shadow, -shadow, 0.5, 45]} />
    </directionalLight>
    {cam && <Rig cam={cam} />}
    <Adaptive />
    {children}
    <Fx />
  </Canvas>
}

// ---------- нажимаемый объект: пружинит, звучит, искрится ----------
export interface TapProps { children?: ReactNode; on?: (p: THREE.Vector3) => void; p?: V3; r?: V3; s?: number; snd?: SfxId | null; fx?: FxKind | null; hit?: number; hitP?: V3; glow?: boolean; bob?: number; spin?: number }
export function Tap({ children, on, p, r, s = 1, snd = 'tap', fx = 'star', hit, hitP, glow, bob = 0, spin = 0 }: TapProps) {
  const ref = useRef<THREE.Group>(null!), sq = useRef(0), halo = useRef<THREE.Mesh>(null), t0 = useMemo(() => Math.random() * 6, [])
  const cam = useThree(s => s.camera)
  useEffect(() => { // только для автотестов в режиме разработки
    if (!import.meta.env.DEV || !on) return
    const set: Set<unknown> = ((window as any).__taps ??= new Set()), e = { ref, cam, hitP, glow, hit }; set.add(e)
    return () => { set.delete(e) }
  }, [!!on, cam, glow])
  useFrame((st, d) => {
    const g = ref.current, t = st.clock.elapsedTime
    sq.current = Math.max(0, sq.current - d * 2.4)
    const q = Math.sin(sq.current * 14) * sq.current * 0.22 + (glow ? Math.sin(t * 5) * 0.05 : 0)
    g.scale.set(s * (1 + q), s * (1 - q), s * (1 + q))
    g.position.y = (p?.[1] ?? 0) + (bob ? Math.sin(t * 1.8 + t0) * bob : 0)
    if (spin) g.rotation.y += d * spin
    if (halo.current) { halo.current.scale.setScalar((hit ?? 0.7) * (1.15 + Math.sin(t * 4) * 0.12)) }
  })
  return <group ref={ref} position={p} rotation={r} onPointerDown={on ? (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation(); sq.current = 1; if (snd) sfx(snd); if (fx) burst(e.point, fx, 8, 0.7); on(e.point)
  } : undefined} onPointerOver={on ? () => { document.body.style.cursor = 'pointer' } : undefined} onPointerOut={on ? () => { document.body.style.cursor = '' } : undefined}>
    {children}
    {hit && <mesh position={hitP}><sphereGeometry args={[hit, 10, 8]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>}
    {glow && <mesh ref={halo} position={hitP} raycast={() => null}><sphereGeometry args={[1, 20, 14]} /><meshBasicMaterial color="#fff3a8" transparent opacity={0.28} depthWrite={false} /></mesh>}
  </group>
}

/** Перетаскивание в плоскости z=const. onDrop возвращает true — предмет остаётся, иначе плавно едет домой. */
/** goal+gr: попадание проверяется на экране, поэтому не зависит от глубины и размера устройства */
export function Drag({ children, home, on, onDrop, s = 1, off, hit = 0.6, onMove, plane = 'z', goal, gr = 1 }: { goal?: V3; gr?: number; children: ReactNode; home: V3; on?: () => void; onDrop: (p: THREE.Vector3, inGoal: boolean) => boolean | void; s?: number; off?: boolean; hit?: number; onMove?: (p: THREE.Vector3) => void; plane?: 'z' | 'y' }) {
  const ref = useRef<THREE.Group>(null!), drag = useRef(false), pl = useMemo(() => new THREE.Plane(), []), v = useMemo(() => new THREE.Vector3(), []), sc = useRef(s), cam = useThree(q => q.camera), size = useThree(q => q.size)
  const inGoal = () => {
    if (!goal) return false
    const px = (w: THREE.Vector3) => { const n = w.project(cam); return new THREE.Vector2(n.x * size.width / 2, n.y * size.height / 2) }
    const g = px(new THREE.Vector3(...goal)), e = px(new THREE.Vector3(gr, 0, 0).applyQuaternion(cam.quaternion).add(new THREE.Vector3(...goal)))
    return px(ref.current.position.clone()).distanceTo(g) < Math.max(e.distanceTo(g), 44)
  }
  useEffect(() => { if (!import.meta.env.DEV || off) return; const set: Set<unknown> = ((window as any).__drags ??= new Set()), e = { ref, cam, goal }; set.add(e); return () => { set.delete(e) } }, [off, cam, goal?.join()])
  useFrame((_, d) => {
    if (!drag.current) { v.set(...home); ref.current.position.lerp(v, 1 - Math.exp(-d * 9)) }
    sc.current += ((drag.current ? s * 1.18 : s) - sc.current) * Math.min(1, d * 12); ref.current.scale.setScalar(sc.current)
  })
  useEffect(() => { ref.current.position.set(...home) }, [])
  const end = (e: ThreeEvent<PointerEvent>) => {
    if (!drag.current) return
    drag.current = false; (e.target as Element).releasePointerCapture?.(e.pointerId)
    const ok = onDrop(ref.current.position.clone(), inGoal()); if (!ok) sfx('whoosh')
  }
  return <group ref={ref}
    onPointerDown={off ? undefined : e => { e.stopPropagation(); (e.target as Element).setPointerCapture?.(e.pointerId); drag.current = true; sfx('tap'); on?.() }}
    onPointerMove={off ? undefined : e => {
      if (!drag.current) return
      e.stopPropagation()
      plane === 'z' ? pl.set(new THREE.Vector3(0, 0, 1), -(home[2] + 0.35)) : pl.set(new THREE.Vector3(0, 1, 0), -(home[1] + 0.25))
      if (e.ray.intersectPlane(pl, v)) { ref.current.position.copy(v); onMove?.(v) }
    }}
    onPointerUp={off ? undefined : end} onPointerCancel={off ? undefined : end}>
    {children}
    {!off && <mesh><sphereGeometry args={[hit, 10, 8]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>}
  </group>
}

/** Плавно переезжает в позицию/масштаб (появляется с пружинкой) */
export function Glide({ p, s = 1, r, children, speed = 6, from, arc = 0 }: { p: V3; s?: number; r?: V3; children: ReactNode; speed?: number; from?: V3; arc?: number }) {
  const ref = useRef<THREE.Group>(null!), v = useMemo(() => new THREE.Vector3(), []), flat = useRef(new THREE.Vector3(...(from ?? p))), init = useRef(false), k0 = useRef(new THREE.Vector3())
  const last = useRef('')
  useFrame((_, d) => {
    const g = ref.current
    if (!init.current) { init.current = true; g.position.copy(flat.current); g.scale.setScalar(0.01) }
    const key = p.join(); if (key !== last.current) { last.current = key; k0.current.copy(flat.current) }
    v.set(...p); const k = 1 - Math.exp(-d * speed); flat.current.lerp(v, k); g.position.copy(flat.current)
    if (arc) { const tot = k0.current.distanceTo(v); if (tot > 0.2) { const f = flat.current.distanceTo(v) / tot; g.position.y += Math.sin(f * Math.PI) * arc } }
    g.scale.setScalar(g.scale.x + (s - g.scale.x) * k)
    if (r) { g.rotation.x += (r[0] - g.rotation.x) * k; g.rotation.y += (r[1] - g.rotation.y) * k; g.rotation.z += (r[2] - g.rotation.z) * k }
  })
  return <group ref={ref}>{children}</group>
}
/** Покачивание */
export function Float({ children, p, a = 0.15, sp = 1.5, rot = 0.08 }: { children: ReactNode; p?: V3; a?: number; sp?: number; rot?: number }) {
  const ref = useRef<THREE.Group>(null!), t0 = useMemo(() => Math.random() * 9, [])
  useFrame(st => { const t = st.clock.elapsedTime * sp + t0; ref.current.position.set(p?.[0] ?? 0, (p?.[1] ?? 0) + Math.sin(t) * a, p?.[2] ?? 0); ref.current.rotation.z = Math.sin(t * 0.8) * rot })
  return <group ref={ref}>{children}</group>
}
/** Круговой полёт */
export function Orbit({ children, c = [0, 0, 0], rad = 3, sp = 0.4, y = 0.4, ph = 0 }: { children: ReactNode; c?: V3; rad?: number; sp?: number; y?: number; ph?: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(st => { const t = st.clock.elapsedTime * sp + ph; ref.current.position.set(c[0] + Math.cos(t) * rad, c[1] + Math.sin(t * 2.3) * y, c[2] + Math.sin(t) * rad); ref.current.rotation.y = -t + (sp > 0 ? Math.PI : 0) })
  return <group ref={ref}>{children}</group>
}
export const rnd = (a: number, b: number) => a + Math.random() * (b - a)
export const shuffle = <X,>(a: X[]): X[] => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]] } return b }
export const pick = <X,>(a: readonly X[]) => a[Math.floor(Math.random() * a.length)]
/** Таймеры, которые умирают вместе со сценой */
export function useLater() {
  const ids = useRef<number[]>([])
  useEffect(() => () => ids.current.forEach(clearTimeout), [])
  return useMemo(() => (f: () => void, ms: number) => { const id = window.setTimeout(f, ms); ids.current.push(id); return id }, [])
}
export function useOnce(f: () => void) { useEffect(() => { const id = setTimeout(f, 700); return () => clearTimeout(id) }, []) }
export { useState }
