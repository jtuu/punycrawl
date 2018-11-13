import { Component } from "./components/Component";
import { Game } from "./Game";
import { HasId, Id } from "./Id";

export abstract class Entity implements HasId {
    private static idCounter: number = 0;
    public readonly id: Id;
    
    constructor(
        public game: Game,
        public name: string,
    ) {
        this.id = Entity.idCounter++;
    }

    public hasComponent<T extends typeof Component>(component: T): this is this & T["prototype"] {
        return component.checker.call(this);
    }

    public hasComponents<T extends Array<typeof Component>>(...components: T): this is this & UnionToIntersection<TuplePrototypes<T>> {
        if (components.length === 1) {
            return components[0].checker.call(this);
        } else {
            for (const com of components) {
                if (!com.checker.call(this)) {
                    return false;
                }
            }
            return true;
        }
    }

    public assertHasComponent<T extends typeof Component>(component: T): this & T["prototype"] {
        if (this.hasComponent(component)) {
            return this;
        }
        throw new Error("Entity is missing component");
    }

    public assertHasComponents<T extends Array<typeof Component>>(...components: T): this & UnionToIntersection<TuplePrototypes<T>>  {
        if (this.hasComponents(...components)) {
            return this;
        }
        throw new Error("Entity is missing a component");
    }

    public addComponent<T extends Component>(component: T): this is this & T {
        if (this.hasComponent(component.constructor)) {
            throw new Error("Entity already has component");
        }
        component.addToEntity(this);
        return true;
    }

    public removeComponent<T extends typeof Component>(component: T) {
        component.removeFromEntity(this);
    }

    public dispose() {
        Component.removeAllFromEntity(this);
    }
}
