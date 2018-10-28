import { Entity } from "./Entity";
import { removeById } from "./Id";
import { Terrain } from "./Terrain";
import { assertDefined, isDefined, isNotNull } from "./utils";

export class DungeonLevel {
    private readonly terrainMap: Array<Terrain>;
    private readonly entityMap: Array<Array<Entity> | undefined>;
    private readonly entities_: Array<Entity> = [];

    constructor(
        public readonly width: number,
        public readonly height: number
    ) {
        this.terrainMap = new Array(width * height).fill(Terrain.Floor);
        for (let x = 0; x < width; x++) {
            this.terrainMap[this.index(x, 0)] = Terrain.Wall;
            this.terrainMap[this.index(x, height - 1)] = Terrain.Wall;
        }
        for (let y = 0; y < height; y++) {
            this.terrainMap[this.index(0, y)] = Terrain.Wall;
            this.terrainMap[this.index(this.width - 1, y)] = Terrain.Wall;
        }
        this.entityMap = new Array(width * height);
    }

    private index(x: number, y: number): number {
        return this.width * y + x;
    }

    private putEntityWithin(entity: Entity, x: number, y: number) {
        entity.x = x;
        entity.y = y;
        const idx = this.index(x, y);
        const entities = this.entityMap[idx];
        if (isDefined(entities)) {
            entities.push(entity);
        } else {
            this.entityMap[idx] = [entity];
        }
    }

    public putEntity(entity: Entity, x: number, y: number) {
        entity.dungeonLevel = this;
        this.entities_.push(entity);
        this.putEntityWithin(entity, x, y);
    }

    private removeEntityWithin(entity: Entity): boolean {
        const {x, y} = entity;
        if (isNotNull(x) && isNotNull(y)) {
            const idx = this.index(x, y);
            const entities = this.entityMap[idx];
            if (isDefined(entities) && removeById(entities, entity.id)) {
                if (entities.length === 0) {
                    delete this.entityMap[idx];
                }
                return true;
            }
            entity.x = null;
            entity.y = null;
        }
        return false;
    }

    public removeEntity(entity: Entity): boolean {
        if (removeById(this.entities_, entity.id) && this.removeEntityWithin(entity)) {
            entity.dungeonLevel = null;
            return true;
        }
        return false;
    }

    public moveEntityWithin(entity: Entity, tox: number, toy: number): boolean {
        if (this.removeEntityWithin(entity)) {
            this.putEntityWithin(entity, tox, toy);
            return true;
        }
        return false;
    }

    public entitiesAt(x: number, y: number): Array<Entity> {
        const entities = this.entityMap[this.index(x, y)];
        if (isDefined(entities)) {
            return entities.slice();
        }
        return [];
    }

    public get entities(): Array<Entity> {
        return this.entities_.slice();
    }

    public terrainAt(x: number, y: number): Terrain {
        return assertDefined(this.terrainMap[this.index(x, y)]);
    }

    public withinBounds(x: number, y: number): boolean {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
}
