export abstract class Grid {
    constructor(
        public readonly width: number,
        public readonly height: number
    ) {}

    protected index(x: number, y: number): number {
        return this.width * y + x;
    }

    public withinBounds(x: number, y: number): boolean {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
}
