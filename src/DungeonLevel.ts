import { Array2d } from "./Array2d";
import { Entity } from "./Entity";
import { getFieldOfView, updateFieldOfView } from "./fov";
import { removeById } from "./Id";
import { Terrain, TerrainKind } from "./Terrain";
import { isDefined, isNotNull } from "./utils";

export class DungeonLevel {
    private readonly terrainMap: Array2d;
    private readonly entityMap: Array<Array<Entity> | undefined>;
    private readonly entities_: Array<Entity> = [];

    constructor(
        public readonly width: number,
        public readonly height: number
    ) {
        this.terrainMap = new Array2d(width, height);
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const col = this.terrainMap.columns[x];
                if (Math.random() < 0.05) {
                    col[y] = TerrainKind.Wall;
                }
            }
        }
        this.terrainMap.columns[1][1] = TerrainKind.Floor;
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
        const kind = this.terrainMap.columns[x][y] as TerrainKind;
        return Terrain[kind];
    }

    public withinBounds(x: number, y: number): boolean {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    public getFieldOfViewAt(x: number, y: number, r: number): Array2d {
        return getFieldOfView(this.terrainMap, x, y, r);
    }

    public updateFieldOfViewAt(fov: Array2d, x: number, y: number, r: number) {
        updateFieldOfView(this.terrainMap, fov, x, y, r);
    }
}
