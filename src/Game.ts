import { ActionKind } from "./actions/Action";
import { filterEntities } from "./components/Component";
import { Controlled } from "./components/Controlled";
import { Damageable } from "./components/Damageable";
import { Location } from "./components/Location";
import { Renderable } from "./components/Renderable";
import { Vision } from "./components/Vision";
import { Bind } from "./decorators";
import { DungeonLevel } from "./DungeonLevel";
import { Entity } from "./entities/Entity";
import { Goblin } from "./entities/Goblin";
import { Human } from "./entities/Human";
import { Trinket } from "./entities/Item";
import { EventEmitter } from "./EventEmitter";
import { Visibility } from "./fov";
import { Id, sortById } from "./Id";
import { MessageLog } from "./MessageLog";
import { SpriteManager } from "./SpriteManager";
import { assertNotNull, isDefined, isNotNull } from "./utils";

const TilePixelSize = 32;
// size in tiles, should be odd so that the camera can be centered properly
const ViewWidth = 41;
const ViewHeight = 25;
const HalfViewW = (ViewWidth - 1) / 2;
const HalfViewH = (ViewHeight - 1) / 2;
const HpBarHeight = 3;
const HpBarOffset = TilePixelSize - HpBarHeight;

type Actor = Entity & typeof Controlled.Component.prototype;
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

export enum GameEventTopic {
    Death
}

type GameEventTopicMap = {
    [GameEventTopic.Death]: Entity;
};

export class Game extends EventEmitter<GameEventTopicMap> {
    private static readonly defaultFloorWidth: number = 100;
    private static readonly defaultFloorHeight: number = 100;
    private readonly memoryCanvas: HTMLCanvasElement = document.body.appendChild(document.createElement("canvas"));
    private readonly mainCanvas: HTMLCanvasElement = document.body.appendChild(document.createElement("canvas"));
    public mainCtx: CanvasRenderingContext2D;
    private memoryCtx: CanvasRenderingContext2D;
    private readonly levels: Array<DungeonLevel> = [];
    private currentLevel: DungeonLevel;
    private readonly actors: ActorDispenser = new ActorDispenser();
    private cameraX: number = 0;
    private cameraY: number = 0;
    private trackedEntity_: Entity | null;
    private readonly sprites: SpriteManager<Spritesheet> = new SpriteManager("spritesheet.gif", "spritesheet.json");
    private running: boolean = false;
    public readonly logger: MessageLog = new MessageLog(this, document.body, 6);
    
    constructor() {
        super();
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
        this.currentLevel.putEntity(new Trinket(this), 2, 4);
        for (let i = 0; i < 10; i++) {
            this.currentLevel.putEntity(new Goblin(this), 7, i * 2);
            this.currentLevel.putEntity(new Goblin(this), 8, 5 + i * 2);
            this.currentLevel.putEntity(new Goblin(this), 9, 10 + i * 2);
        }
        this.trackedEntity_ = player;
        this.updateCamera();
        for (let i = 0; i < 10; i++) {
            this.appendFloor();
        }

        this.addEventListener(GameEventTopic.Death, this.onEntityDeath);
    }

    public get trackedEntity(): Entity | null {
        return this.trackedEntity_;
    }

    @Bind
    private onEntityDeath(entity: Entity) {
        this.syncActors();
        if (entity === this.trackedEntity_) {
            this.trackedEntity_ = null;
            this.running = false;
        }
    }

    private updateCamera() {
        if (isNotNull(this.trackedEntity_) && this.trackedEntity_.hasComponent(Location.Component)) {
            this.cameraX = this.trackedEntity_.location.x;
            this.cameraY = this.trackedEntity_.location.y;
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
            this.actors.add(filterEntities(prev.entities, Controlled.Component));
        }
        if (isNotNull(next)) {
            this.actors.add(filterEntities(next.entities, Controlled.Component));
        }
        this.actors.add(filterEntities(this.currentLevel.entities, Controlled.Component));
        this.actors.sync();
    }
    
    private drawView(ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        const offsetX = this.cameraX - HalfViewW;
        const offsetY = this.cameraY - HalfViewH;

        const tracked = this.trackedEntity_;
        if (tracked === null || !tracked.hasComponent(Vision.Component)) {
            return;
        }
        const {fov, fovRadius} = tracked.vision;

        for (let fx = 0, x = this.cameraX - fovRadius; fx < fov.width; fx++, x++) {
            const col = fov.columns[fx];
            for (let fy = 0, y = this.cameraY - fovRadius; fy < fov.height; fy++, y++) {
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
                            if (entity.hasComponent(Renderable.Component)) {
                                this.sprites.draw(ctx, entity.renderable.sprite, xpx, ypx);
                                if (entity.hasComponent(Damageable.Component)) {
                                    const hpPercent = Math.max(entity.damageable.health / entity.damageable.maxHealth, 0);
                                    const barWidth = Math.floor(TilePixelSize * hpPercent);
                                    ctx.fillStyle = "green";
                                    ctx.fillRect(xpx, ypx + HpBarOffset, barWidth, HpBarHeight);
                                    ctx.fillStyle = "red";
                                    ctx.fillRect(xpx + barWidth, ypx + HpBarOffset, TilePixelSize - barWidth, HpBarHeight);
                                }
                            }
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

    public async run() {
        this.running = true;
        this.logger.logGlobal("Welcome! Press ? for help.");
        await this.sprites.load();
        this.syncActors();
        for (const actor_ of this.actors) {
            const actor = assertNotNull(actor_);
            const action = await actor.controlled.controller.getAction();
            action.execute(this, actor);
            let location: Location | null = null;
            if (actor.hasComponent(Location.Component)) {
                actor.location.invalidatePathmapCache();
                location = actor.location;
            }
            if (actor.hasComponent(Vision.Component)) {
                actor.vision.invalidateFovCache();
            }
            if (actor === this.trackedEntity_) {
                switch (action.kind) {
                    case ActionKind.ClimbStairs:
                        this.memoryCtx.clearRect(0, 0, this.memoryCanvas.width, this.memoryCanvas.height);
                        this.currentLevel = assertNotNull(location).dungeonLevel;
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
            if (!this.running) { break; }
        }
        this.logger.logGlobal("You lose.");
    }
}
