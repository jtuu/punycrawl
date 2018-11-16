import { Array2d } from "../Array2d";
import { Entity } from "../entities/Entity";
import { Visibility } from "../fov";
import { isNotNull } from "../utils";
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
        const {dungeonLevel, x, y} = this.owner.location;
        if (this.fov_ === null) {
            this.fov_ = dungeonLevel.getFieldOfViewAt(x, y, this.fovRadius_);
        }
        if (!this.fovIsFresh) {
            dungeonLevel.updateFieldOfViewAt(this.fov_, x, y, this.fovRadius_);
            this.fovIsFresh = true;
        }
        return this.fov_;
    }

    public canSee(x: number, y: number): boolean {
        if (this.owner.hasComponent(Location.Component)) {
            const {x: cx, y: cy} = this.owner.location;
            const r = this.fovRadius;
            const d = r * 2;
            const fx = x - cx + r;
            const fy = y - cy + r;
            if (fx < 0 || fx > d || fy < 0 || fy > d) {
                return false;
            }
            if (this.fovIsFresh) {
                return this.fov.columns[fx][fy] === Visibility.Visible;
            } else {
                return this.owner.location.dungeonLevel.lineOfSight(cx, cy, x, y);
            }

        }
        return false;
    }

    public dispose() {
        if (isNotNull(this.fov_)) {
            this.fov_.dispose();
        }
    }
}
