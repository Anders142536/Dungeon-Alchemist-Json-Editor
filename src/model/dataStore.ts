import { writable, Writable } from 'svelte/store'
import type { Light, Wall } from './model'

/*  Semi-smart container for the imported data or saved edits. Should be able to
    import based on a given JSON object and should be able to create the
    necessary export string without the roll20-prefix. */
class DataStore {
  private _walls: Writable<Map<number, Wall>> = writable(new Map())
  private _lights: Writable<Map<number, Light>> = writable(new Map())

  // walls and lights are mapped id -> object
  private _wallIndex: number = 0
  private _lightIndex: number = 0
  private _pixelsPerTile: number = 0
  private _grid: Object = {}

  /* ASSUMPTION: given data is valid json object! Has to be checked by import
     component! This WILL fail otherwise! */
  loadData(data: Object) {
    // TODO: load data into member variables
  }

  deleteWall(index: number) {
    // TODO: this
  }

  deleteLight(index: number) {
    // TODO: this
  }

  editWalls(index: number[]) {
    // TODO: this
  }

  editLights(index: number[]) {
    // TODO: this
  }

  addWall(wall: Wall) {
    // TODO: this
  }

  addLight(light: Light) {
    // TODO: this
  }

  get exportString() {
    // TODO: this, should return the correct string for the given data
    return ''
  }

}

export const data: DataStore = new DataStore()