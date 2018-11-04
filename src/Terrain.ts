import { Color, rgb } from "./Color";

export enum ClimbDirection {
    None,
    Up,
    Down
}

// this needs to match the enum in C
export enum TerrainKind {
    Wall,
    NUM_VISION_BLOCKING_TERRAIN,
    Floor,
    Upstairs,
    Downstairs
}

export class Terrain {
    private constructor(
        public readonly bgColor: Color,
        public readonly sprite: keyof Spritesheet | null,
        public readonly blocksMovement: boolean,
        public readonly opacity: number,
        public readonly climbDirection: ClimbDirection = ClimbDirection.None
    ) {}

    public get climbable(): boolean {
        return this.climbDirection !== ClimbDirection.None;
    }

    public static readonly Invalid     = new Terrain(rgb(255,   0, 255), null, false, 0);
    public static readonly Wall        = new Terrain(rgb( 33,  33,  33), null, true, 1);
    public static readonly Floor       = new Terrain(rgb(100, 100, 100), null, false, 0);
    public static readonly Upstairs    = new Terrain(rgb(100, 100, 100), "upstairs", false, 0, ClimbDirection.Up);
    public static readonly Downstairs  = new Terrain(rgb(100, 100, 100), "downstairs", false, 0, ClimbDirection.Down);

    public static readonly [TerrainKind.Wall] = Terrain.Wall;
    public static readonly [TerrainKind.NUM_VISION_BLOCKING_TERRAIN] = Terrain.Invalid;
    public static readonly [TerrainKind.Floor] = Terrain.Floor;
    public static readonly [TerrainKind.Upstairs] = Terrain.Upstairs;
    public static readonly [TerrainKind.Downstairs] = Terrain.Downstairs;
}
