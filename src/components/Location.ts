import { DungeonLevel } from "../DungeonLevel";
import { Entity } from "../Entity";
import { Pathmap } from "../pathfinding";
import { Component, ComponentData } from "./Component";

class LocationComponent extends Component {
    public location: Location;

    constructor(...args: ConstructorParameters<typeof Location>) {
        super(...args);
        this.location = new Location(...args);
    }

    public addToEntity(entity: Entity) {
        this.tagger.call(entity);
        const asComponent = entity as Entity & LocationComponent;
        asComponent.location = this.location;
    }

    public static removeFromEntity(entity: Entity) {
        this.untagger.call(entity);
        if (entity.hasComponent(this)) {
            delete entity.location;
        }
    }
}

export class Location extends ComponentData {
    public static readonly Component = LocationComponent;
    private pathmap_: Pathmap | null = null;
    private pathmapIsFresh: boolean = false;

    constructor(
        owner: Entity,
        public x: number,
        public y: number,
        public dungeonLevel: DungeonLevel
    ) {
        super(owner);
    }

    public invalidatePathmapCache() {
        this.pathmapIsFresh = false;
    }

    public get pathmap(): Pathmap {
        if (this.pathmap_ === null) {
            this.pathmap_ = new Pathmap(this.dungeonLevel.width, this.dungeonLevel.height, this);
        }
        if (!this.pathmapIsFresh) {
            this.pathmap_.update();
            this.pathmapIsFresh = true;
        }
        return this.pathmap_;
    }

    // tslint:disable-next-line
    public dispose() {}
}
