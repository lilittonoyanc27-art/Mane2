import { useEffect, useState } from 'react'
import * as THREE from 'three'
export function useTexture2(src: string) { const [t, set] = useState<THREE.Texture | null>(null); useEffect(() => { let tx: THREE.Texture | null = null; new THREE.TextureLoader().load(src, x => { x.colorSpace = THREE.SRGBColorSpace; tx = x; set(x) }); return () => tx?.dispose() }, [src]); return t }
