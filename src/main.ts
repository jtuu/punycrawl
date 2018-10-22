import { Id, removeById } from "./Id";
import { isDefined } from "./utils";
import { Color } from "./Color";
import { Terrain } from "./Terrain";

const TilePixelSize = 20;

class Entity {
    private static idCounter: number = 0;
    public readonly id: Id;
    
    constructor(
        public glyph: string,
        public color: Color
    ) {
        this.id = Entity.idCounter++;
    }
}

class DungeonLevel {
    private readonly terrainMap: Array<Terrain>;
    private readonly entityMap: Array<Array<Entity> | undefined>;

    constructor(
        public readonly width: number,
        public readonly height: number
    ) {
        this.terrainMap = new Array(width * height);
        this.entityMap = new Array(width * height);
    }

    private index(x: number, y: number): number {
        return this.width * y + x;
    }

    public putEntity(entity: Entity, x: number, y: number) {
        const idx = this.index(x, y);
        const entities = this.entityMap[idx];
        if (isDefined(entities)) {
            entities.push(entity);
        } else {
            this.entityMap[idx] = [entity];
        }
    }

    public removeEntity(entity: Entity, x: number, y: number): boolean {
        const idx = this.index(x, y);
        const entities = this.entityMap[idx];
        if (isDefined(entities) && removeById(entities, entity.id)) {
            if (entities.length === 0) {
                delete this.entityMap[idx];
            }
            return true;
        }
        return false;
    }

    public getEntities(x: number, y: number): Array<Entity> {
        return this.entityMap[this.index(x, y)] || [];
    }

    public getTerrain(x: number, y: number): Terrain {
        return this.terrainMap[this.index(x, y)];
    }
}

class Game {
    private static readonly defaultFloorWidth: number = 20;
    private static readonly defaultFloorHeight: number = 20;
    private readonly levels: Array<DungeonLevel> = [];
    private currentLevel: DungeonLevel;
    private readonly canvas: HTMLCanvasElement = document.body.appendChild(document.createElement("canvas"));
    private ctx: CanvasRenderingContext2D;

    constructor() {
        const ctx = this.canvas.getContext("2d");
        if (ctx === null) {
            throw new Error("Failed to get CanvasRenderingContext2D");
        }
        this.ctx = ctx;
        this.currentLevel = this.addFloor();
    }

    public addFloor(): DungeonLevel {
        const floor = new DungeonLevel(Game.defaultFloorWidth, Game.defaultFloorHeight);
        this.levels.push(floor);
        return floor;
    }
    
    public draw(ctx: CanvasRenderingContext2D) {
        const level = this.currentLevel;
        for (let x = 0, xpx = 0; x < this.currentLevel.width; x++, xpx += TilePixelSize) {
            for (let y = 0, ypx = 0; y < this.currentLevel.height; y++, ypx += TilePixelSize) {
                const terrain = level.getTerrain(x, y);
                ctx.fillStyle = terrain.color;
                ctx.fillRect(xpx, ypx, TilePixelSize, TilePixelSize);

                const entities = level.getEntities(x, y);
                for (const entity of entities) {
                    ctx.fillStyle = entity.color;
                    ctx.fillText(entity.glyph[0], xpx, ypx);
                }
            }
        }
    }

    public run() {
        this.draw(this.ctx);
    }
}

function main() {
    const game = new Game();
    game.run();
}

main();
