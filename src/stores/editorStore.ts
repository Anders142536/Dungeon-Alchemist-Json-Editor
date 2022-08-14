import { writable, Writable } from 'svelte/store'

class editorStore {
  public color: Writable<string>
  public intensity: Writable<number>
  public range: Writable<number>
  public wallType: Writable<number>

  constructor(color: string, intensity: number, range: number, wallType: number) {
    this.color = writable(color)
    this.intensity = writable(intensity)
    this.range = writable(range)
    this.wallType = writable(wallType)
  }
}