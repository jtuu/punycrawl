import { Array2d } from "./Array2d";
import { Location } from "./components/Location";
import { Entity } from "./Entity";
import { getFieldOfView, updateFieldOfView } from "./fov";
import { Grid } from "./Grid";
import { removeById } from "./Id";
import { Terrain, TerrainKind } from "./Terrain";
import { isDefined } from "./utils";

export class DungeonLevel extends Grid {
    private readonly terrainMap: Array2d;
    private readonly entityMap: Array<Array<Entity> | undefined>;
    private readonly entities_: Array<Entity> = [];
    public previousLevel: DungeonLevel | null = null;
    public nextLevel: DungeonLevel | null = null;

    constructor(
        width: number,
        height: number
    ) {
        super(width, height);
        this.terrainMap = new Array2d(width, height);
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const col = this.terrainMap.columns[x];
                if (Math.random() < 0.05) {
                    col[y] = TerrainKind.Wall;
                } else {
                    col[y] = TerrainKind.Floor;
                }
            }
        }
        this.terrainMap.columns[1][1] = TerrainKind.Floor;
        this.terrainMap.columns[7].fill(TerrainKind.Floor);
        this.terrainMap.columns[8].fill(TerrainKind.Floor);
        this.terrainMap.columns[9].fill(TerrainKind.Floor);
        this.terrainMap.columns[2][2] = TerrainKind.Downstairs;
        this.terrainMap.columns[3][2] = TerrainKind.Upstairs;
        this.entityMap = new Array(width * height);
    }

    private putEntityWithin(entity: Entity & typeof Location.Component.prototype, x: number, y: number) {
        entity.location.x = x;
        entity.location.y = y;
        const idx = this.index(x, y);
        const entities = this.entityMap[idx];
        if (isDefined(entities)) {
            entities.push(entity);
        } else {
            this.entityMap[idx] = [entity];
        }
    }

    public putEntity(entity: Entity, x: number, y: number) {
        if (entity.addComponent(new Location.Component(entity, x, y, this))) {
            this.entities_.push(entity);
            this.putEntityWithin(entity, x, y);
        }
    }

    private removeEntityWithin(entity: Entity): boolean {
        if (entity.hasComponent(Location.Component)) {
            const {x, y} = entity.location;
            const idx = this.index(x, y);
            const entities = this.entityMap[idx];
            if (isDefined(entities) && removeById(entities, entity.id)) {
                if (entities.length === 0) {
                    delete this.entityMap[idx];
                }
                return true;
            }
        }
        return false;
    }

    public removeEntity(entity: Entity): boolean {
        if (removeById(this.entities_, entity.id) && this.removeEntityWithin(entity)) {
            entity.removeComponent(Location.Component);
            return true;
        }
        return false;
    }

    public moveEntityWithin(entity: Entity & typeof Location.Component.prototype, tox: number, toy: number): boolean {
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

    public getFieldOfViewAt(x: number, y: number, r: number): Array2d {
        return getFieldOfView(this.terrainMap, x, y, r);
    }

    public updateFieldOfViewAt(fov: Array2d, x: number, y: number, r: number) {
        updateFieldOfView(this.terrainMap, fov, x, y, r);
    }
}
