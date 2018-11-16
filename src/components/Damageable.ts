import { Entity } from "../entities/Entity";
import { GameEventTopic } from "../Game";
import { Component, ComponentData } from "./Component";
import { Location } from "./Location";

class DamageableComponent extends Component {
    public damageable: Damageable;

    constructor(...args: ConstructorParameters<typeof Damageable>) {
        super(...args);
        this.damageable = new Damageable(...args);
    }

    public addToEntity(entity: Entity) {
        this.tagger.call(entity);
        const asComponent = entity as Entity & DamageableComponent;
        asComponent.damageable = this.damageable;
    }

    public static removeFromEntity(entity: Entity) {
        this.untagger.call(entity);
        if (entity.hasComponent(this)) {
            delete entity.damageable;
        }
    }
}

export class Damageable extends ComponentData {
    public static readonly Component = DamageableComponent;
    private maxHealth_: number;
    private health_: number;

    constructor(
        owner: Entity,
        maxHealth: number
    ) {
        super(owner);
        this.maxHealth_ = maxHealth;
        this.health_ = maxHealth;
    }

    public get maxHealth(): number {
        return this.maxHealth_;
    }

    public get health(): number {
        return this.health_;
    }

    public takeDamage(dmg: number) {
        this.health_ -= Math.abs(dmg);
        if (this.health_ <= 0) {
            this.die();
        }
    }

    public get alive(): boolean {
        return this.health_ > 0;
    }

    private die() {
        this.health_ = 0;
        this.owner.game.emit(GameEventTopic.Death, this.owner);
        if (this.owner.hasComponent(Location.Component)) {
            this.owner.location.dungeonLevel.removeEntity(this.owner);
        }
    }

    // tslint:disable-next-line
    public dispose() {}
}
