import { ActionType } from "./Action";
import { Actor } from "./Actor";
import { DungeonLevel } from "./DungeonLevel";
import { Id, sortById } from "./Id";
import { assertDefined, assertNotNull, filterInstanceOf, isDefined, isNotNull } from "./utils";

const TilePixelSize = 20;

type ActorDispenserResult = Actor | null;
class ActorDispenser implements IterableIterator<ActorDispenserResult> {
    private readonly actors: Array<Actor> = [];
    private cursor: number = 0;
    private lastId: Id | null = null;

    public clear() {
        this.actors.length = 0;
    }

    public add(actors: Array<Actor>) {
        Array.prototype.push.apply(this.actors, actors);
    }

    public rewind() {
        this.cursor = 0;
    }

    public sync() {
        sortById(this.actors);
        const lastId = this.lastId;
        if (isNotNull(lastId) && this.actors.length > 0) {
            const smallest = this.actors[0];
            const biggest = this.actors[this.actors.length - 1];
            if (lastId <= smallest.id || lastId >= biggest.id) {
                this.rewind();
            } else {
                for (let i = 1; i < this.actors.length; i++) {
                    if (this.actors[i].id > lastId) {
                        this.cursor = i;
                        break;
                    }
                }
            }
        }
    }

    public next(): IteratorResult<ActorDispenserResult> {
        const actor = this.actors[this.cursor];
        if (++this.cursor >= this.actors.length) {
            this.rewind();
        }
        if (isDefined(actor)) {
            this.lastId = actor.id;
            return {
                value: actor,
                done: false
            };
        } else {
            return {
                value: null,
                done: true
            };
        }
    }

    public [Symbol.iterator](): IterableIterator<ActorDispenserResult> {
        return this;
    }
}

export class Game {
    private static readonly defaultFloorWidth: number = 100;
    private static readonly defaultFloorHeight: number = 100;
    private readonly canvas: HTMLCanvasElement = document.body.appendChild(document.createElement("canvas"));
    private ctx: CanvasRenderingContext2D;
    private readonly levels: Array<DungeonLevel> = [];
    private currentLevelIdx: number = -1;
    private readonly actors: ActorDispenser = new ActorDispenser();
    
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

    private get previousLevel(): DungeonLevel | null {
        const level = this.levels[this.currentLevelIdx - 1];
        return isDefined(level) ? level : null;
    }

    private get nextLevel(): DungeonLevel | null {
        const level = this.levels[this.currentLevelIdx + 1];
        return isDefined(level) ? level : null;
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
        const prev = this.previousLevel;
        const next = this.nextLevel;
        if (isNotNull(prev)) {
            this.actors.add(filterInstanceOf(prev.entities, Actor));
        }
        if (isNotNull(next)) {
            this.actors.add(filterInstanceOf(next.entities, Actor));
        }
        this.actors.add(filterInstanceOf(this.currentLevel.entities, Actor));
        this.actors.sync();
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
        for (const actor_ of this.actors) {
            const actor = assertNotNull(actor_);
            const action = await actor.controller.getAction();
            action.execute(this, actor);
            switch (action.type) {
                case ActionType.ClimbStairs:
                    this.syncActors();
                    break;
            }
            this.draw(this.ctx);
        }
    }
}