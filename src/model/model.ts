export enum WallType {
  WALL = 0,
  DOOR = 1,
  WINDOW = 2,
}


export class Wall {
  // @Hinotori:
  // this constructor equals the commented out code below.
  // syntax sugar weeeeeeeeeee

  /*
  private wallSection: string
  private wall3D: Object
  private type: WallType

  constructor(wallSection: string, wall3D: Object, type: WallType) {
    this.wallSection = wallSection
    this.wall3D = wall3D
    this.type = type
  }
  */
  constructor(
    // @Hinotori:
    // _ marks a class member as private. This is just a convention, not syntax.
    // although it could also be enforced, idk.

    // directly take the string in wallSection and keep it, as we won't edit it
    private _wallSection: string,

    // directly take the json of wall3D and keep it, as we won't edit it
    private _wall3D: Object,

    // `type` is not nullable here as only the editor itself can clear the
    // wallType. When importing and not finding a wallType an import error
    // should be shown instead
    private _type: WallType
  ) { }


  /*
    @Hinotori:
    `get` and `set` are keywords in typescript for methods that are used when
    accessing the related member. Imagine this:

    let foo: Wall = new Wall("fooWall", {}, WallType.WALL)

    We can access foo's members like this:

    foo.type = WallType.DOOR

    But it ACTUALLY calls the setter below. This is NOT the same as making _type
    public, because then it would just directly write into the member.

    god damn black magic, i'm conviced.
  */
  set type(type: WallType) {
    this._type = type
  }

  get type() {
    return this._type
  }

  get wallSection() {
    return this._wallSection
  }

  get wall3D() {
    return this._wall3D
  }

}


export class Light {
  constructor(
    private _color: string,
    private _intensity: number,
    private _range: number,
    private _position: Object
  ) { }

  set color(color: string) {
    this._color = color
  }

  set intensity(intensity: number) {
    this._intensity = intensity
  }

  set range(range: number) {
    this._range = range
  }

  get color() {
    return this._color
  }

  get intensity() {
    return this._intensity
  }

  get range() {
    return this._range
  }

  get position() {
    return this._position
  }

}
