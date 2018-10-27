import { ActionType } from "./Action";
import { Actor } from "./Actor";
import { CircularArray } from "./CircularArray";
import { DungeonLevel } from "./DungeonLevel";
import { Id, sortById } from "./Id";
import { assertDefined, filterType, isDefined, isNotNull } from "./utils";

const TilePixelSize = 20;

export class Game {
    private static readonly defaultFloorWidth: number = 100;
    private static readonly defaultFloorHeight: number = 100;
    private readonly canvas: HTMLCanvasElement = document.body.appendChild(document.createElement("canvas"));
    private ctx: CanvasRenderingContext2D;
    private readonly levels: Array<DungeonLevel> = [];
    private currentLevelIdx: number = -1;
    private readonly actors: CircularArray<Actor> = new CircularArray();
    private readonly actorIter: IterableIterator<Actor> = this.actors.values();
    private lastActorId: Id | null = null;
    
    constructor() {
        const ctx = this.canvas.getContext("2d");
        if (ctx === null) {
            throw new Error("Failed to get CanvasRenderingContext2D");
        }
        this.ctx = ctx;
        this.changeLevel(this.addFloor());
    }

    private changeLevel(levelIdx: number) {
        assertDefined(this.levels[levelIdx]);
        this.currentLevelIdx = levelIdx;
        this.syncActors();
    }

    private get currentLevel(): DungeonLevel {
        return assertDefined(this.levels[this.currentLevelIdx]);
    }

    private addFloor(): number {
        const floor = new DungeonLevel(Game.defaultFloorWidth, Game.defaultFloorHeight);
        return this.levels.push(floor) - 1;
    }

    private syncActors() {
        this.actors.clear();
        const prevLevel = this.levels[this.currentLevelIdx - 1];
        const nextLevel = this.levels[this.currentLevelIdx + 1];
        if (isDefined(prevLevel)) {
            Array.prototype.push.apply(this.actors, filterType(prevLevel.entities, Actor));
        }
        if (isDefined(nextLevel)) {
            Array.prototype.push.apply(this.actors, filterType(nextLevel.entities, Actor));
        }
        Array.prototype.push.apply(this.actors, filterType(this.currentLevel.entities, Actor));
        sortById(this.actors);

        const lastActorId = this.lastActorId;
        if (isNotNull(lastActorId)) {
            let prev = this.actorIter.next();
            let cur: IteratorResult<Actor>;
            while (!(cur = this.actorIter.next()).done) {
                if (cur.value.id <= lastActorId && prev.value.id >= lastActorId) {
                    this.actorIter.next();
                    break;
                }
                prev = cur;
            }
        }
    }
    
    private draw(ctx: CanvasRenderingContext2D) {
        const level = this.currentLevel;
        for (let x = 0, xpx = 0; x < this.currentLevel.width; x++, xpx += TilePixelSize) {
            for (let y = 0, ypx = 0; y < this.currentLevel.height; y++, ypx += TilePixelSize) {
                const terrain = level.terrainAt(x, y);
                ctx.fillStyle = terrain.color;
                ctx.fillRect(xpx, ypx, TilePixelSize, TilePixelSize);

                const entities = level.entitiesAt(x, y);
                for (const entity of entities) {
                    ctx.fillStyle = entity.color;
                    ctx.fillText(entity.glyph[0], xpx, ypx);
                }
            }
        }
    }

    public async run() {
        for (const actor of this.actorIter) {
            const action = await actor.controller.getAction();
            action.execute(this, actor);
            switch (action.type) {
                case ActionType.ClimbStairs:
                    this.syncActors();
                    break;
            }
            this.draw(this.ctx);
            this.lastActorId = actor.id;
        }
    }
}
