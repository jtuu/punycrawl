import { Storage } from "./components/Storage";
import { Bind } from "./decorators";
import { Entity } from "./entities/Entity";
import { EventEmitter, TopicMap } from "./EventEmitter";
import { assertNotNull, isDefined, zip } from "./utils";

export enum MenuEventTopic {
    ItemSelect
}

type MenuEventTopicMap = {
    [MenuEventTopic.ItemSelect]: Entity;
};

export abstract class Menu<T extends TopicMap = MenuEventTopicMap> extends EventEmitter<T> {
    protected displayed: boolean = false;

    constructor(public readonly parent: HTMLElement) {
        super();
    }

    protected static *itemIdentifiers(): IterableIterator<string> {
        const A = 65;
        const Z = 90;
        const a = 97;
        const z = 122;
        for (let i = a; i <= z; i++) {
            yield String.fromCharCode(i);
        }
        for (let i = A; i <= Z; i++) {
            yield String.fromCharCode(i);
        }
    }

    public abstract display(): void;
    public abstract close(): void;
}

export class StorageMenu extends Menu {
    private static readonly containerClassName: string = "menu storage-menu";
    private container: HTMLElement | null = null;
    private readonly items: Map<string, Entity> = new Map();

    constructor(
        public readonly title: string,
        public readonly storage: Storage
    ) {
        super(document.body);
    }

    @Bind
    private handleKeypress(keyPress: KeyboardEvent) {
        const item = this.items.get(keyPress.key);
        if (isDefined(item)) {
            this.emit(MenuEventTopic.ItemSelect, item);
        }
    }

    public display() {
        if (this.displayed) { return; }
        this.displayed = true;
        this.container = document.createElement("div");
        this.container.className = StorageMenu.containerClassName;
        for (const [id, entity] of zip(Menu.itemIdentifiers(), this.storage)) {
            this.items.set(id, entity);
            const row = document.createElement("div");
            row.textContent = `[${id}] - ${entity.name}`;
            this.container.appendChild(row);
        }
        this.parent.appendChild(this.container);
        window.addEventListener("keypress", this.handleKeypress);
    }

    public close() {
        if (!this.displayed) { return; }
        this.displayed = false;
        window.removeEventListener("keypress", this.handleKeypress);
        this.parent.removeChild(assertNotNull(this.container));
        this.container = null;
    }
}
