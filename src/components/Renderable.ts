import { Entity } from "../Entity";
import { Component, ComponentData } from "./Component";

class RenderableComponent extends Component {
    public renderable: Renderable;

    constructor(...args: ConstructorParameters<typeof Renderable>) {
        super(...args);
        this.renderable = new Renderable(...args);
    }

    public addToEntity(entity: Entity) {
        this.tagger.call(entity);
        const asComponent = entity as Entity & RenderableComponent;
        asComponent.renderable = this.renderable;
    }

    public static removeFromEntity(entity: Entity) {
        this.untagger.call(entity);
        if (entity.hasComponent(this)) {
            delete entity.renderable;
        }
    }
}

export class Renderable extends ComponentData {
    public static readonly Component = RenderableComponent;

    constructor(
        owner: Entity,
        public sprite: keyof Spritesheet
    ) {
        super(owner);
    }

    // tslint:disable-next-line
    public dispose() {}
}
