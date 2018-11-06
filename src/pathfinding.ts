import { Entity } from "./Entity";
import { cardinalDirections, ordinalDirections, principalDirections, Vec2 } from "./geometry";
import { Grid } from "./Grid";
import { Queue } from "./Queue";
import { assertNotNull } from "./utils";

export class Pathmap extends Grid {
    private static readonly defaultValue: number = 255;
    private static readonly biasedDirections = ordinalDirections.concat(cardinalDirections);
    private readonly map: Uint8Array;

    constructor(
        width: number, height: number,
        private readonly target: Entity
    ) {
        super(width, height);
        this.map = new Uint8Array(width * height);
        this.map.fill(Pathmap.defaultValue);
    }

    private travelable(x: number, y: number): boolean {
        const level = assertNotNull(this.target.dungeonLevel);
        if (!level.terrainAt(x, y).blocksMovement && level.entitiesAt(x, y).length === 0) {
            return true;
        }
        return false;
    }

    public update() {
        const level = this.target.dungeonLevel;
        if (level === null) { return; }
        this.map.fill(Pathmap.defaultValue);
        const tx = assertNotNull(this.target.x);
        const ty =  assertNotNull(this.target.y);
        const start: Vec2 = [tx, ty];
        const frontier = new Queue<Vec2>();
        frontier.enqueue(start);

        while (!frontier.isEmpty()) {
            const [curx, cury] = frontier.dequeue();
            
            for (const nextDir of principalDirections) {
                const nx = curx + nextDir[0];
                const ny = cury + nextDir[1];
                if (nx === tx && ny === ty) {
                    this.map[this.index(nx, ny)] = 0;
                } else if (this.withinBounds(nx, ny) && this.travelable(nx, ny)) {
                    const nextIdx = this.index(nx, ny);
                    const nextVal = this.map[nextIdx];
                    if (nextVal === Pathmap.defaultValue) {
                        const curIdx = this.index(curx, cury);
                        const curVal = this.map[curIdx];
                        this.map[nextIdx] = curVal + 1;
                        frontier.enqueue([nx, ny]);
                    }
                }
            }
        }
    }

    public getNextDirection(x: number, y: number): Vec2 | null {
        const tx = assertNotNull(this.target.x);
        const ty =  assertNotNull(this.target.y);
        let bestVal: number = Infinity;
        let bestDir: Vec2 | null = null;
        for (const dir of Pathmap.biasedDirections) {
            const dx = x + dir[0];
            const dy = y + dir[1];
            if (dx === tx && dy === ty) {
                return dir;
            } else if (this.withinBounds(dx, dy)) {
                const val = this.map[this.index(dx, dy)];
                if (val <= bestVal && this.travelable(dx, dy)) {
                    bestVal = val;
                    bestDir = dir;
                }
            }
        }
        return bestDir;
    }
}
