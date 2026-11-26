import { useMemo, useRef, useState, type ReactNode, type MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { V3 } from './base'
import { geo, mat } from './base'

export interface PlayerRef { x: number; y: number; z: number; vy: number; heading: number; speed: number; target: { x: number; z: number } | null; lock: boolean }
export const newPlayer = (x = 0, z = 0): PlayerRef => ({ x, y: 0, z, vy: 0, heading: 0, speed: 0, target: null, lock: false })
interface Cfg {
  pl: MutableRefObject<PlayerRef>; dir: MutableRefObject<{ x: number; y: number }>; max: number; ok: (x: number, z: number) => boolean; height?: (x: number, z: number) => number
  obst?: [number, number, number][]; cam?: V3; car?: boolean; onTick?: (p: PlayerRef, dt: number) => void; children: (moving: boolean) => ReactNode
}
/** Игрок от третьего лица: джойстик, стрелки или касание земли. Камера и солнце следуют за ним. */
export function Player({ pl, dir, max, ok, height, obst = [], cam = [0, 6, 10], car, onTick, children }: Cfg) {
  const g = useRef<THREE.Group>(null!), { camera, scene, size } = useThree(), [mv, setMv] = useState(false), mvR = useRef(false), look = useRef<THREE.Vector3 | null>(null), v = useMemo(() => new THREE.Vector3(), [])
  const sun = useRef<THREE.DirectionalLight | null>(null)
  useFrame((_, d0) => {
    const d = Math.min(d0, 0.05), p = pl.current
    let dx = dir.current.x, dz = -dir.current.y
    if (dx || dz) p.target = null
    else if (p.target) { dx = p.target.x - p.x; dz = p.target.z - p.z; const l = Math.hypot(dx, dz); if (l < 0.4) { p.target = null; dx = dz = 0 } else { const f = Math.min(1, l / 1.5); dx = dx / l * f; dz = dz / l * f } }
    if (p.lock) dx = dz = 0
    const want = Math.min(1, Math.hypot(dx, dz)) * max
    p.speed += (want - p.speed) * (1 - Math.exp(-d * (car ? 2.6 : 9)))
    if (Math.hypot(dx, dz) > 0.08) { let dh = Math.atan2(dx, dz) - p.heading; while (dh > Math.PI) dh -= Math.PI * 2; while (dh < -Math.PI) dh += Math.PI * 2; p.heading += dh * (1 - Math.exp(-d * (car ? 4.5 : 10))) }
    if (!p.lock) {
      const sx = Math.sin(p.heading) * p.speed * d, sz = Math.cos(p.heading) * p.speed * d
      if (ok(p.x + sx, p.z + sz)) { p.x += sx; p.z += sz } else if (ok(p.x + sx, p.z)) p.x += sx; else if (ok(p.x, p.z + sz)) p.z += sz; else p.target = null
      for (const [ox, oz, r] of obst) { const ex = p.x - ox, ez = p.z - oz, l = Math.hypot(ex, ez); if (l < r && l > 0.01) { const nx = ox + ex / l * r, nz = oz + ez / l * r; if (ok(nx, nz)) { p.x = nx; p.z = nz } if (p.target && Math.hypot(p.target.x - ox, p.target.z - oz) < r) p.target = null } }
    }
    const h = height ? height(p.x, p.z) : 0
    p.vy -= 18 * d; p.y += p.vy * d
    if (p.y <= h) { p.y = h; p.vy = 0 }
    if (!p.lock) { g.current.position.set(p.x, p.y, p.z); g.current.rotation.y = p.heading }
    const m = p.speed > 0.35; if (m !== mvR.current) { mvR.current = m; setMv(m) }
    onTick?.(p, d)
    const asp = size.width / size.height, f = asp < 0.8 ? 1.35 : 1, k = look.current ? 1 - Math.exp(-d * 4) : 1
    v.set(p.x, h * 0.8 + 1.4, p.z); if (!look.current) look.current = v.clone(); look.current.lerp(v, k)
    camera.position.set(look.current.x + cam[0] * f, look.current.y + cam[1] * f, look.current.z + cam[2] * f); camera.lookAt(look.current)
    if (!sun.current) scene.traverse(o => { if ((o as THREE.DirectionalLight).isDirectionalLight) sun.current = o as THREE.DirectionalLight })
    if (sun.current) { const gx = Math.round(look.current.x), gz = Math.round(look.current.z); sun.current.position.set(gx + 6, 14, gz + 8); sun.current.target.position.set(gx, 0, gz); sun.current.target.updateMatrixWorld() }
  })
  return <group ref={g}>{children(mv)}</group>
}
/** Прозрачная площадка: касание = идти туда */
export function TapGround({ pl, r, y = 0.01, on }: { pl: MutableRefObject<PlayerRef>; r: number; y?: number; on?: (x: number, z: number) => void }) {
  const set = (x: number, z: number) => { pl.current.target = { x, z }; on?.(x, z) }
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} onPointerDown={e => { e.stopPropagation(); set(e.point.x, e.point.z) }} onPointerMove={e => { if (e.nativeEvent.buttons) set(e.point.x, e.point.z) }}><circleGeometry args={[r, 24]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
}
/** Прячет далёкие объекты ради скорости на телефоне */
export function Zone({ p, pl, far = 44, children }: { p: V3; pl: MutableRefObject<PlayerRef>; far?: number; children: ReactNode }) {
  const g = useRef<THREE.Group>(null!)
  useFrame(() => { g.current.visible = Math.hypot(pl.current.x - p[0], pl.current.z - p[2]) < far })
  return <group ref={g} position={p}>{children}</group>
}
/** Световой столб над важным предметом */
export function Beam({ c = '#fff3a0', h = 5 }: { c?: string; h?: number }) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(s => { ref.current.scale.x = ref.current.scale.z = 1 + Math.sin(s.clock.elapsedTime * 4) * 0.2 })
  return <mesh ref={ref} position={[0, h / 2, 0]} geometry={geo('beam' + h, () => new THREE.CylinderGeometry(0.35, 0.55, h, 18, 1, true))} material={mat(c, { op: 0.3, em: 1, side: true })} raycast={() => null} dispose={null} />
}
/** Полёт/плавание в плоскости экрана */
export interface FlyRef { x: number; y: number; vx: number; vy: number; tx: number | null; ty: number; lock: boolean }
export const newFly = (x = 0, y = 0): FlyRef => ({ x, y, vx: 0, vy: 0, tx: null, ty: 0, lock: false })
export function Flyer({ fl, dir, max = 7, bx, by, z = 11, children, onTick, rocket }: { fl: MutableRefObject<FlyRef>; dir: MutableRefObject<{ x: number; y: number }>; max?: number; bx: number; by: [number, number]; z?: number; children: ReactNode; onTick?: (f: FlyRef, d: number) => void; rocket?: boolean }) {
  const g = useRef<THREE.Group>(null!), { camera, size } = useThree()
  useFrame((s, d0) => {
    const d = Math.min(d0, 0.05), f = fl.current; let dx = dir.current.x, dy = dir.current.y
    if (dx || dy) f.tx = null
    else if (f.tx !== null) { dx = f.tx - f.x; dy = f.ty - f.y; const l = Math.hypot(dx, dy); if (l < 0.35) { f.tx = null; dx = dy = 0 } else { const k = Math.min(1, l / 2) / l; dx *= k; dy *= k } }
    if (f.lock) dx = dy = 0
    const k = 1 - Math.exp(-d * 3); f.vx += (dx * max - f.vx) * k; f.vy += (dy * max - f.vy) * k
    f.x = Math.max(-bx, Math.min(bx, f.x + f.vx * d)); f.y = Math.max(by[0], Math.min(by[1], f.y + f.vy * d))
    g.current.position.set(f.x, f.y + Math.sin(s.clock.elapsedTime * 2) * 0.08, 0)
    if (rocket) { const sp = Math.hypot(f.vx, f.vy), want = sp > 0.5 ? Math.atan2(-f.vx, f.vy) : 0; let dr = want - g.current.rotation.z; while (dr > Math.PI) dr -= 6.2832; while (dr < -Math.PI) dr += 6.2832; g.current.rotation.z += dr * Math.min(1, d * 5) }
    else { const yaw = f.vx < -0.4 ? -1.2 : f.vx > 0.4 ? 1.2 : 0; g.current.rotation.y += (yaw - g.current.rotation.y) * Math.min(1, d * 5); g.current.rotation.z += ((Math.abs(f.vx) > 0.4 ? f.vy * 0.06 * Math.sign(f.vx) : 0) - g.current.rotation.z) * Math.min(1, d * 5) }
    const zz = size.width / size.height < 0.8 ? z * 1.35 : z
    camera.position.x += (f.x - camera.position.x) * Math.min(1, d * 3.5); camera.position.y += (f.y + 0.6 - camera.position.y) * Math.min(1, d * 3.5); camera.position.z += (zz - camera.position.z) * Math.min(1, d * 2)
    camera.lookAt(camera.position.x, camera.position.y - 0.4, 0)
    onTick?.(f, d)
  })
  return <group ref={g}>{children}</group>
}
export function TapPlane({ fl, w, h, y = 0 }: { fl: MutableRefObject<FlyRef>; w: number; h: number; y?: number }) {
  const set = (p: THREE.Vector3) => { fl.current.tx = p.x; fl.current.ty = p.y }
  return <mesh position={[0, y, -0.6]} onPointerDown={e => { e.stopPropagation(); set(e.point) }} onPointerMove={e => { if (e.nativeEvent.buttons) set(e.point) }}><planeGeometry args={[w, h]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
}
