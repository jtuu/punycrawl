import { Array2d } from "../Array2d";
import { Entity } from "../Entity";
import { assertNotNull, isNotNull } from "../utils";
import { Component, ComponentData } from "./Component";
import { Location } from "./Location";

class VisionComponent extends Component {
    public vision: Vision;

    constructor(...args: ConstructorParameters<typeof Vision>) {
        super(...args);
        this.vision = new Vision(...args);
    }

    public addToEntity(entity: Entity) {
        this.tagger.call(entity);
        const asComponent = entity as Entity & VisionComponent;
        asComponent.vision = this.vision;
    }

    public static removeFromEntity(entity: Entity) {
        this.untagger.call(entity);
        if (entity.hasComponent(this)) {
            entity.vision.dispose();
            delete entity.vision;
        }
    }
}

export class Vision extends ComponentData {
    public static readonly Component = VisionComponent;
    private static readonly defaultFovRadius = 10;
    protected fovRadius_: number = Vision.defaultFovRadius;
    private fov_: Array2d | null = null;
    private fovIsFresh: boolean = false;

    constructor(owner: Entity) {
        super(owner);
    }

    public get fovRadius(): number {
        return this.fovRadius_;
    }

    public invalidateFovCache() {
        this.fovIsFresh = false;
    }

    public get fov(): Array2d {
        if (!this.owner.hasComponent(Location.Component)) {
            throw new Error("Can't get FOV for actor that has no location");
        }
        const {location} = this.owner;
        const x = assertNotNull(location.x);
        const y = assertNotNull(location.y);
        if (this.fov_ === null) {
            this.fov_ = location.dungeonLevel.getFieldOfViewAt(x, y, this.fovRadius_);
        }
        if (!this.fovIsFresh) {
            location.dungeonLevel.updateFieldOfViewAt(this.fov_, x, y, this.fovRadius_);
            this.fovIsFresh = true;
        }
        return this.fov_;
    }

    public dispose() {
        if (isNotNull(this.fov_)) {
            this.fov_.dispose();
        }
    }
}
