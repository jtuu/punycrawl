import { ActionKind } from "./actions/Action";
import { Actor } from "./Actor";
import { DungeonLevel } from "./DungeonLevel";
import { Visibility } from "./fov";
import { Goblin } from "./Goblin";
import { Human } from "./Human";
import { Id, sortById } from "./Id";
import { SpriteManager } from "./SpriteManager";
import { assertNotNull, filterInstanceOf, isDefined, isNotNull } from "./utils";

const TilePixelSize = 32;
// size in tiles, should be odd so that the camera can be centered properly
const ViewWidth = 41;
const ViewHeight = 25;
const HalfViewW = (ViewWidth - 1) / 2;
const HalfViewH = (ViewHeight - 1) / 2;

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
            if (lastId < smallest.id || lastId >= biggest.id) {
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
    private static readonly defaultFloorWidth: number = 30;
    private static readonly defaultFloorHeight: number = 50;
    private readonly memoryCanvas: HTMLCanvasElement = document.body.appendChild(document.createElement("canvas"));
    private readonly mainCanvas: HTMLCanvasElement = document.body.appendChild(document.createElement("canvas"));
    public mainCtx: CanvasRenderingContext2D;
    private memoryCtx: CanvasRenderingContext2D;
    private readonly levels: Array<DungeonLevel> = [];
    private currentLevel: DungeonLevel;
    private readonly actors: ActorDispenser = new ActorDispenser();
    private cameraX: number = 0;
    private cameraY: number = 0;
    private trackedActor: Actor | null;
    private readonly sprites: SpriteManager<Spritesheet> = new SpriteManager("spritesheet.gif", "spritesheet.json");
    
    constructor() {
        const mainCtx = this.mainCanvas.getContext("2d");
        if (mainCtx === null) {
            throw new Error("Failed to get CanvasRenderingContext2D");
        }
        this.mainCtx = mainCtx;

        const memoryCtx = this.memoryCanvas.getContext("2d");
        if (memoryCtx === null) {
            throw new Error("Failed to get CanvasRenderingContext2D");
        }
        this.memoryCtx = memoryCtx;

        this.mainCanvas.width = TilePixelSize * ViewWidth;
        this.mainCanvas.height = TilePixelSize * ViewHeight;
        this.memoryCanvas.width = TilePixelSize * Game.defaultFloorWidth;
        this.memoryCanvas.height = TilePixelSize * Game.defaultFloorHeight;
        this.memoryCanvas.style.opacity = "0.5";

        this.currentLevel = this.appendFloor();
        const player = new Human(this);
        this.currentLevel.putEntity(player, 1, 1);
        for (let i = 0; i < 10; i++) {
            this.currentLevel.putEntity(new Goblin(this), 7, i * 2);
            this.currentLevel.putEntity(new Goblin(this), 8, 5 + i * 2);
            this.currentLevel.putEntity(new Goblin(this), 9, 10 + i * 2);
        }
        this.trackedActor = player;
        this.updateCamera();
        for (let i = 0; i < 10; i++) {
            this.appendFloor();
        }
    }

    private updateCamera() {
        if (isNotNull(this.trackedActor)) {
            this.cameraX = assertNotNull(this.trackedActor.x);
            this.cameraY = assertNotNull(this.trackedActor.y);
            this.memoryCanvas.style.left = `${(-this.cameraX + HalfViewW) * TilePixelSize}px`;
            this.memoryCanvas.style.top = `${(-this.cameraY + HalfViewH) * TilePixelSize}px`;
        }
    }

    private appendFloor(): DungeonLevel {
        const newFloor = new DungeonLevel(Game.defaultFloorWidth, Game.defaultFloorHeight);
        const head = this.levels[this.levels.length - 1];
        if (isDefined(head)) {
            head.nextLevel = newFloor;
            newFloor.previousLevel = head;
        } else {
            newFloor.previousLevel = null;
        }
        this.levels.push(newFloor);
        return newFloor;
    }

    private syncActors() {
        this.actors.clear();
        const prev = this.currentLevel.previousLevel;
        const next = this.currentLevel.nextLevel;
        if (isNotNull(prev)) {
            this.actors.add(filterInstanceOf(prev.entities, Actor));
        }
        if (isNotNull(next)) {
            this.actors.add(filterInstanceOf(next.entities, Actor));
        }
        this.actors.add(filterInstanceOf(this.currentLevel.entities, Actor));
        this.actors.sync();

    }
    
    private drawView(ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        const offsetX = this.cameraX - HalfViewW;
        const offsetY = this.cameraY - HalfViewH;

        const actor = this.trackedActor;
        if (actor === null) { return; }
        const fov = actor.fov;
        if (fov === null) { return; }

        for (let fx = 0, x = this.cameraX - actor.fovRadius; fx < fov.width; fx++, x++) {
            const col = fov.columns[fx];
            for (let fy = 0, y = this.cameraY - actor.fovRadius; fy < fov.height; fy++, y++) {
                const vis = col[fy] as Visibility;
                if (vis === Visibility.Visible) {
                    const level = this.currentLevel;
                    if (level.withinBounds(x, y)) {
                        const xpx = (x - offsetX) * TilePixelSize;
                        const ypx = (y - offsetY) * TilePixelSize;
                        const terrain = level.terrainAt(x, y);
                        ctx.fillStyle = terrain.bgColor;
                        ctx.fillRect(xpx, ypx, TilePixelSize, TilePixelSize);
                        const terrainSprite = terrain.sprite;
                        if (isNotNull(terrainSprite)) {
                            this.sprites.draw(ctx, terrainSprite, xpx, ypx);
                        }

                        const entities = level.entitiesAt(x, y);
                        for (const entity of entities) {
                            this.sprites.draw(ctx, entity.sprite, xpx, ypx);
                        }
                    }
                }
            }
        }
    }

    public draw() {
        this.drawView(this.mainCtx);
        this.memoryCtx.drawImage(this.mainCanvas,
            (this.cameraX - HalfViewW) * TilePixelSize,
            (this.cameraY - HalfViewH) * TilePixelSize);
    }

    public awaitDraw(): Promise<any> {
        return new Promise(resolve => {
            this.draw();
            requestAnimationFrame(resolve);
        });
    }

    public async run() {
        await this.sprites.load();
        this.syncActors();
        for (const actor_ of this.actors) {
            const actor = assertNotNull(actor_);
            const action = await actor.act();
            actor.invalidatePathmapCache();
            actor.invalidateFovCache();
            if (actor === this.trackedActor) {
                switch (action.kind) {
                    case ActionKind.ClimbStairs:
                        this.memoryCtx.clearRect(0, 0, this.memoryCanvas.width, this.memoryCanvas.height);
                        this.currentLevel = assertNotNull(actor.dungeonLevel);
                    case ActionKind.Move:
                        this.updateCamera();
                        break;
                }
            }
            switch (action.kind) {
                case ActionKind.ClimbStairs:
                    this.syncActors();
                    break;
            }
        }
    }
}
