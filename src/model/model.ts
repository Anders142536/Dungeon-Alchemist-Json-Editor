export enum WallType {
  WALL = 0,
  DOOR = 1,
  WINDOW = 2,
}


export class Wall {
  constructor(
    // directly take the string in wallSection and keep it, as we won't edit it
    private _wallSection: string,

    // directly take the json of wall3D and keep it, as we won't edit it
    private _wall3D: Object,

    // `type` is not nullable here as only the editor itself can clear the
    // wallType. When importing and not finding a wallType an import error
    // should be shown instead
    public type: WallType
  ) { }

  get wallSection() {
    return this._wallSection
  }

  get wall3D() {
    return this._wall3D
  }
}



export class Light {
  constructor(
    public color: string,
    public intensity: number,
    public range: number,

    private _position: Object
  ) { }

  get position() {
    return this._position
  }
}
