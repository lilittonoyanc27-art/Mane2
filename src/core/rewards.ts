export type CKind = 'crown' | 'sticker' | 'toy' | 'dress' | 'decor'
export interface Collect { id: string; kind: CKind; icon: string; color: string }
const R = (id: string, kind: CKind, icon: string, color: string): Collect => ({ id, kind, icon, color })
export const COLLECT: Collect[] = [
  R('st1', 'sticker', '🦋', '#b79bff'), R('cr1', 'crown', '👑', '#ffd257'), R('toy1', 'toy', '🧸', '#d9a06b'), R('dc1', 'decor', '🌈', '#ff9ecb'), R('dr1', 'dress', '👗', '#ff8fc5'),
  R('st2', 'sticker', '🌸', '#ff9ecb'), R('toy2', 'toy', '🪀', '#6fc8ff'), R('cr2', 'crown', '👑', '#ff9ecb'), R('dc2', 'decor', '🪔', '#ffd98a'), R('dr2', 'dress', '👗', '#a78bfa'),
  R('st3', 'sticker', '🦄', '#ffc2e2'), R('toy3', 'toy', '🚂', '#ff8a7a'), R('cr3', 'crown', '👑', '#8fd3ff'), R('dc3', 'decor', '🎈', '#ff7fae'), R('dr3', 'dress', '👗', '#ffd257'),
  R('st4', 'sticker', '🐱', '#ffcf99'), R('toy4', 'toy', '🐘', '#a9bfe8'), R('cr4', 'crown', '👑', '#c8a2ff'), R('dc4', 'decor', '🪴', '#8fdc9a'), R('dr4', 'dress', '👗', '#7fd8d0'),
  R('st5', 'sticker', '🍓', '#ff7a8a'), R('toy5', 'toy', '🦆', '#ffe06a'), R('cr5', 'crown', '👑', '#ffb07a'), R('dc5', 'decor', '⭐', '#ffe27a'), R('dr5', 'dress', '👗', '#ffffff'),
  R('st6', 'sticker', '🐳', '#7fc4ff'), R('toy6', 'toy', '🚀', '#ff9ecb'), R('dc6', 'decor', '🌙', '#ffeaa0'),
]
