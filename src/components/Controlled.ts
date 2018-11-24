import { ActionKind } from "../actions/Action";
import { Controller, IController } from "../Controller";
import { Entity } from "../entities/Entity";
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

export const energyTreshold = 100;
export const baseEnergyCosts = {
    [ActionKind.Attack]: 100,
    [ActionKind.ClimbStairs]: 150,
    [ActionKind.Move]: 100,
    [ActionKind.Rest]: 100,
    [ActionKind.Pickup]: 100,
    [ActionKind.Drop]: 100,
    [ActionKind.Equip]: 150,
    [ActionKind.Unequip]: 150
};

export function getActionCost(_actor: Entity, kind: ActionKind): number {
    return baseEnergyCosts[kind];
}

export class Controlled extends ComponentData {
    public static readonly Component = ControlledComponent;
    public controller: IController;
    public energy: number = 0;

    constructor(
        owner: Entity,
        controllerCtor: new (...args: ConstructorParameters<Controller>) => IController
    ) {
        super(owner);
        this.controller = new controllerCtor(owner.game, owner as any);
    }

    public gainEnergy() {
        this.energy += 10;
    }

    public dispose() {
        this.controller.dispose();
    }
}
