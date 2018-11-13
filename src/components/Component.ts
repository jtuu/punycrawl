import { Entity } from "../Entity";

type ComponentTagger = () => void;
type ComponentChecker = () => boolean;

export abstract class Component {
    private static allComponents: Set<typeof Component> = new Set();
    private static tag_: symbol | null = null;
    private static tagger_: ComponentTagger | null = null;
    private static untagger_: ComponentTagger | null = null;
    private static checker_: ComponentChecker | null = null;

    "constructor": typeof Component;
    constructor(..._args: Array<any>) {}

    private static get tag(): symbol {
        if (this.tag_ === null) {
            this.tag_ = Symbol();
            this.allComponents.add(this);
        }
        return this.tag_;
    }

    public static get tagger(): ComponentTagger {
        if (this.tagger_ === null) {
            this.tagger_ = this.createTagger(this.tag);
        }
        return this.tagger_;
    }

    public get tagger(): ComponentTagger {
        return this.constructor.tagger;
    }

    private static createTagger(tag: symbol): ComponentTagger {
        return function (this: any) {
            this[tag] = true;
        };
    }

    public static get untagger(): ComponentTagger {
        if (this.untagger_ === null) {
            this.untagger_ = this.createUntagger(this.tag);
        }
        return this.untagger_;
    }

    public get untagger(): ComponentTagger {
        return this.constructor.untagger;
    }

    private static createUntagger(tag: symbol): ComponentTagger {
        return function (this: any) {
            delete this[tag];
        };
    }

    public static get checker(): ComponentChecker {
        if (this.checker_ === null) {
            this.checker_ = this.createChecker(this.tag);
        }
        return this.checker_;
    }

    private static createChecker(tag: symbol): ComponentChecker {
        return function(this: any) {
            return Boolean(this[tag]);
        };
    }

    public abstract addToEntity(entity: Entity): void;
    public static removeFromEntity(_entity: Entity) {
        // because abstract static methods aren't allowed
        throw new Error("Unimplemented method");
    }

    public static removeAllFromEntity(entity: Entity) {
        for (const com of this.allComponents) {
            entity.removeComponent(com);
        }
    }
}

export abstract class ComponentData {
    public static readonly Component: typeof Component;

    constructor(
        public readonly owner: Entity
    ) {}

    public abstract dispose(): void;
}

export function filterEntities<T extends typeof Component>(entities: Array<Entity>, component: T): Array<Entity & T["prototype"]> {
    const result: Array<Entity & T["prototype"]> = [];
    for (const entity of entities) {
        if (entity.hasComponent(component)) {
            result.push(entity);
        }
    }
    return result;
}
