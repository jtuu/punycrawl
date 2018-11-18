import { Entity } from "../entities/Entity";
import { Id } from "../Id";
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
    private readonly contents: Set<Entity> = new Set();

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
            this.contents.add(entity);
        }
    }

    public take(id: Id): Entity | null {
        let found = null;
        for (const entity of this.contents) {
            if (entity.id === id) {
                found = entity;
                break;
            }
        }
        if (found === null) { return null; }
        this.contents.delete(found);
        return found;
    }

    public [Symbol.iterator](): IterableIterator<Entity> {
        return this.contents.values();
    }

    // tslint:disable-next-line
    public dispose() {

    }
}