import { Entity } from "../entities/Entity";
import { Id } from "../Id";
import { isDefined } from "../utils";
import { Component, ComponentData } from "./Component";

class StorageComponent extends Component {
    public storage: Storage;

    constructor(...args: ConstructorParameters<typeof Storage>) {
        super(...args);
        this.storage = new Storage(...args);
    }

    public addToEntity(entity: Entity) {
        this.tagger.call(entity);
        const asComponent = entity as Entity & StorageComponent;
        asComponent.storage = this.storage;
    }

    public static removeFromEntity(entity: Entity) {
        this.untagger.call(entity);
    }
}

export class Storage extends ComponentData {
    public static readonly Component = StorageComponent;
    private readonly contents: Map<Id, Entity> = new Map();

    constructor(
        owner: Entity,
        public maxSize: number
    ) {
        super(owner);
    }

    public get size(): number {
        return this.contents.size;
    }

    public isFull(): boolean {
        return this.size >= this.maxSize;
    }

    public add(entity: Entity) {
        if (!this.isFull()) {
            this.contents.set(entity.id, entity);
        }
    }

    public take(id: Id): Entity | null {
        const entity = this.contents.get(id);
        if (isDefined(entity)) {
            this.contents.delete(id);
            return entity;
        }
        return null;
    }

    public find(id: Id): Entity | null {
        return this.contents.get(id) || null;
    }

    public [Symbol.iterator](): IterableIterator<Entity> {
        return this.contents.values();
    }

    // tslint:disable-next-line
    public dispose() {

    }
}
