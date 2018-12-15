import { Color, rgb } from "./Color";

export enum ClimbDirection {
    None,
    Up,
    Down
}

// this needs to match the enum in C
export enum TerrainKind {
    StoneWall,
    WoodWall,
    Palisade,
    NUM_VISION_BLOCKING_TERRAIN,
    StoneFloor,
    WoodFloor,
    Grass,
    Dirt,
    Upstairs,
    Downstairs
}

export class Terrain {
    private constructor(
        public readonly name: string,
        public readonly bgColor: Color | null,
        public readonly sprite: keyof Spritesheet | null,
        public readonly blocksMovement: boolean,
        public readonly opacity: number,
        public readonly climbDirection: ClimbDirection = ClimbDirection.None
    ) {}

    public get climbable(): boolean {
        return this.climbDirection !== ClimbDirection.None;
    }

    public static readonly Invalid     = new Terrain("ERROR",        rgb(255,   0, 255), null, false, 0);
    public static readonly StoneWall   = new Terrain("Stone Wall",                 null, "stonewall", true, 1);
    public static readonly WoodWall    = new Terrain("Wooden Wall",                null, "planks", true, 1);
    public static readonly Palisade    = new Terrain("Palisade",                   null, "palisade", true, 1);
    public static readonly StoneFloor  = new Terrain("Stone Floor",  rgb( 33,  33,  33), null, false, 0);
    public static readonly WoodFloor   = new Terrain("Wooden Floor", rgb( 90,  50,  20), null, false, 0);
    public static readonly Grass       = new Terrain("Grass",                      null, "grass", false, 0);
    public static readonly Dirt        = new Terrain("Dirt",                       null, "dirt", false, 0);
    public static readonly Upstairs    = new Terrain("Staircase",    rgb( 33,  33,  33), "upstairs", false, 0, ClimbDirection.Up);
    public static readonly Downstairs  = new Terrain("Staircase",    rgb( 33,  33,  33), "downstairs", false, 0, ClimbDirection.Down);

    public static readonly [TerrainKind.StoneWall] = Terrain.StoneWall;
    public static readonly [TerrainKind.WoodWall] = Terrain.WoodWall;
    public static readonly [TerrainKind.Palisade] = Terrain.Palisade;
    public static readonly [TerrainKind.NUM_VISION_BLOCKING_TERRAIN] = Terrain.Invalid;
    public static readonly [TerrainKind.StoneFloor] = Terrain.StoneFloor;
    public static readonly [TerrainKind.WoodFloor] = Terrain.WoodFloor;
    public static readonly [TerrainKind.Grass] = Terrain.Grass;
    public static readonly [TerrainKind.Dirt] = Terrain.Dirt;
    public static readonly [TerrainKind.Upstairs] = Terrain.Upstairs;
    public static readonly [TerrainKind.Downstairs] = Terrain.Downstairs;
}
