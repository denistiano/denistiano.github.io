import * as THREE from 'three'
import { palette } from '../theme'

/** Shared GPU programs — same look, far fewer material instances. */
export const mats = {
  graphite: new THREE.MeshStandardMaterial({ color: palette.graphite, roughness: 0.6 }),
  graphiteDull: new THREE.MeshStandardMaterial({ color: palette.graphite, roughness: 0.7 }),
  metal: new THREE.MeshStandardMaterial({ color: '#9aa0a6', metalness: 0.55, roughness: 0.35 }),
  fabric: new THREE.MeshStandardMaterial({ color: '#343a44', roughness: 0.85 }),
  wood: new THREE.MeshStandardMaterial({ color: palette.deskWood, roughness: 0.75 }),
  woodDark: new THREE.MeshStandardMaterial({ color: palette.deskWoodDark, roughness: 0.7 }),
  cream: new THREE.MeshStandardMaterial({ color: palette.cream, roughness: 0.85 }),
  clay: new THREE.MeshStandardMaterial({ color: palette.mugClay, roughness: 0.75, side: THREE.DoubleSide }),
  claySolid: new THREE.MeshStandardMaterial({ color: palette.mugClay, roughness: 0.75 }),
  terracotta: new THREE.MeshStandardMaterial({ color: palette.potTerracotta, roughness: 0.8 }),
  plant: new THREE.MeshStandardMaterial({ color: palette.plantGreen, roughness: 0.85, flatShading: true }),
  plantDark: new THREE.MeshStandardMaterial({
    color: palette.plantGreenDark,
    roughness: 0.85,
    flatShading: true,
  }),
  soil: new THREE.MeshStandardMaterial({ color: '#4a3826', roughness: 1 }),
  trunk: new THREE.MeshStandardMaterial({ color: '#7a5b3a', roughness: 0.9 }),
  coffee: new THREE.MeshStandardMaterial({ color: '#3d2417', roughness: 0.25 }),
  platform: new THREE.MeshStandardMaterial({ color: palette.platform, roughness: 0.95 }),
  floor: new THREE.MeshStandardMaterial({ color: palette.floor, roughness: 1 }),
  accent: new THREE.MeshStandardMaterial({ color: palette.accent, roughness: 0.55 }),
  accentShade: new THREE.MeshStandardMaterial({
    color: palette.accent,
    roughness: 0.55,
    side: THREE.DoubleSide,
  }),
}
