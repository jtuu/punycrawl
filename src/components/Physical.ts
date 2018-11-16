import { Entity } from "../entities/Entity";
import { Component, ComponentData } from "./Component";

class PhysicalComponent extends Component {
    public physical: Physical;

    constructor(...args: ConstructorParameters<typeof Physical>) {
        super(...args);
        this.physical = new Physical(...args);
    }

    public addToEntity(entity: Entity) {
        this.tagger.call(entity);
        const asComponent = entity as Entity & PhysicalComponent;
        asComponent.physical = this.physical;
    }

    public static removeFromEntity(entity: Entity) {
        this.untagger.call(entity);
    }
}

export class Physical extends ComponentData {
    public static readonly Component = PhysicalComponent;

    constructor(
        owner: Entity,
        public blocksMovement: boolean
    ) {
        super(owner);
    }

    // tslint:disable-next-line
    public dispose() {}
}
