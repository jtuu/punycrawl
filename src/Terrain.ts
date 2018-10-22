import { Color, rgb } from "./Color";

export class Terrain {
    private constructor(
        public readonly color: Color,
        public readonly blocksMovement: boolean,
        public readonly opacity: number
    ) {}

    public static readonly Floor = new Terrain(rgb(100, 100, 100), false, 0);
    public static readonly Wall  = new Terrain(rgb( 33,  33,  33), false, 1);
}
