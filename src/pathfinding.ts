import { DungeonLevel } from "./DungeonLevel";
import { Entity } from "./Entity";
import { cardinalDirections, manhattanDistance, ordinalDirections, principalDirections, Vec2 } from "./geometry";
import { Grid } from "./Grid";
import { PriorityQueue } from "./PriorityQueue";
import { Queue } from "./Queue";
import { assertDefined, assertNotNull } from "./utils";
import { Vec2HashMap } from "./Vec2HashMap";

function travelable(level: DungeonLevel, x: number, y: number): boolean {
    if (!level.terrainAt(x, y).blocksMovement && level.entitiesAt(x, y).length === 0) {
        return true;
    }
    return false;
}

export class Pathmap extends Grid {
    private static readonly defaultValue: number = 255;
    private static readonly biasedDirections = ordinalDirections.concat(cardinalDirections, [0, 0]);
    private readonly map: Uint8Array;
    private reachesTarget_: boolean = false;

    constructor(
        width: number, height: number,
        private readonly target: Entity
    ) {
        super(width, height);
        this.map = new Uint8Array(width * height);
        this.map.fill(Pathmap.defaultValue);
    }

    public get reachesTarget(): boolean {
        return this.reachesTarget_;
    }

    public update() {
        this.reachesTarget_ = false;
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
                    this.reachesTarget_ = true;
                    this.map[this.index(nx, ny)] = 0;
                } else if (this.withinBounds(nx, ny) && travelable(level, nx, ny)) {
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
        const level = assertNotNull(this.target.dungeonLevel);
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
                if (val <= bestVal && travelable(level, dx, dy)) {
                    bestVal = val;
                    bestDir = dir;
                }
            }
        }
        return bestDir;
    }

    public distanceAt(x: number, y: number): number {
        return this.map[this.index(x, y)];
    }
}

function reconstructPath(cameFrom: Vec2HashMap<Vec2>, fromx: number, fromy: number, tox: number, toy: number): Array<Vec2> {
    const path = [];
    let cur: Vec2 = [tox, toy];
    while (!(cur[0] === fromx && cur[1] === fromy)) {
        path.push(cur);
        const next = cameFrom.get(cur);
        if (next === undefined) { break; }
        cur = next;
    }
    return path.reverse();
}

function aStar(level: DungeonLevel, fromx: number, fromy: number, tox: number, toy: number): Vec2HashMap<Vec2> {
    const frontier = new PriorityQueue<Vec2>();
    const cameFrom = new Vec2HashMap<Vec2>();
    const costs = new Vec2HashMap<number>();
    const start: Vec2 = [fromx, fromy];
    frontier.put(start, 0);
    costs.set(start, 0);
    while (!frontier.isEmpty()) {
        const cur = frontier.pop();
        const [curx, cury] = cur;
        const curCost = assertDefined(costs.get(cur));
        const newCost = curCost + 1;
        if (curx === tox && cury === toy) {
            break;
        }
        for (const nextDir of principalDirections) {
            const nx = curx + nextDir[0];
            const ny = cury + nextDir[1];
            if (level.withinBounds(nx, ny) && travelable(level, nx, ny)) {
                const next: Vec2 = [nx, ny];
                if (!costs.has(next) || newCost < assertDefined(costs.get(next))) {
                    costs.set(next, newCost);
                    const priority = newCost + manhattanDistance(tox, toy, nx, ny);
                    frontier.put(next, priority);
                    cameFrom.set(next, cur);
                }
            }
        }
    }
    return cameFrom;
}

// recalculates if bumps into something
export function* blindPath(level: DungeonLevel, fromx: number, fromy: number, tox: number, toy: number): IterableIterator<Vec2> {
    let curx = fromx;
    let cury = fromy;
    // regenerate paths until at target
    do {
        const cameFrom = aStar(level, curx, cury, tox, toy);
        const path = reconstructPath(cameFrom, curx, cury, tox, toy);
        const last = path[path.length - 1];
        const reachesTarget = path.length > 0 && last[0] === tox && last[1] === toy;
        // standing next to target but it's blocked
        if (reachesTarget && path.length === 1 && !travelable(level, tox, toy)) {
            break;
        }
        // go through the path even if it doesn't reach target
        for (const next of path) {
            const [nx, ny] = next;
            // bumped, recalculate
            if (!travelable(level, nx, ny)) { break; }
            curx = nx;
            cury = ny;
            yield next;
        }
        // could not find path to target
        if (!reachesTarget) { break; }
    } while (curx !== tox && cury !== toy);
}
