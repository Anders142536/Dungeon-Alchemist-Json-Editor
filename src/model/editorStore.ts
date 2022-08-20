import { writable, Writable } from 'svelte/store'
import type { WallType, Light, Wall } from './model'

class EditorStore {
  public color: Writable<string | null> = writable(null)
  public intensity: Writable<number | null> = writable(null)
  public range: Writable<number | null> = writable(null)
  public wallType: Writable<WallType | null> = writable(null)



  reset() {
    this.color.set(null)
    this.intensity.set(null)
    this.range.set(null)
    this.wallType.set(null)
  }

  loadLight(l: Light) {

  }

  loadWall(w: Wall) {

  }
}

export const editorStore: EditorStore = new EditorStore()

