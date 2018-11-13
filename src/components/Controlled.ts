import { Controller, IController } from "../Controller";
import { Entity } from "../Entity";
import { Component, ComponentData } from "./Component";

class ControlledComponent extends Component {
    public controlled: Controlled;

    constructor(...args: ConstructorParameters<typeof Controlled>) {
        super(...args);
        this.controlled = new Controlled(...args);
    }

    public addToEntity(entity: Entity) {
        this.tagger.call(entity);
        const asComponent = entity as Entity & ControlledComponent;
        asComponent.controlled = this.controlled;
    }

    public static removeFromEntity(entity: Entity) {
        this.untagger.call(entity);
        if (entity.hasComponent(this)) {
            entity.controlled.dispose();
            delete entity.controlled;
        }
    }
}

export class Controlled extends ComponentData {
    public static readonly Component = ControlledComponent;
    public controller: IController;

    constructor(
        owner: Entity,
        controllerCtor: new (...args: ConstructorParameters<Controller>) => IController
    ) {
        super(owner);
        this.controller = new controllerCtor(owner.game, owner as any);
    }

    public dispose() {
        this.controller.dispose();
    }
}
