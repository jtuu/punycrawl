import { Storage } from "./components/Storage";
import { Entity } from "./entities/Entity";
import { assertNotNull, isDefined, zip } from "./utils";

export enum MenuKind {
    Storage
}

export type Menu = StorageMenu;

export interface IMenu {
    readonly kind: MenuKind;
    display(): void;
    handleKeypress(keyPress: KeyboardEvent): any;
    close(): void;
}

function* itemIdentifiers(): IterableIterator<string> {
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

export class StorageMenu implements IMenu {
    public readonly kind = MenuKind.Storage;
    private displayed: boolean = false;
    private static readonly containerClassName: string = "menu storage-menu";
    private static readonly titleClassName: string = "menu-title";
    private container: HTMLElement | null = null;
    private readonly items: Map<string, Entity> = new Map();

    constructor(
        public readonly title: string,
        public readonly storage: Storage
    ) {}

    public handleKeypress(keyPress: KeyboardEvent): Entity | null {
        const item = this.items.get(keyPress.key);
        if (isDefined(item)) {
            return item;
        }
        return null;
    }

    public display() {
        if (this.displayed) { return; }
        this.displayed = true;
        this.container = document.createElement("div");
        this.container.className = StorageMenu.containerClassName;
        const title = document.createElement("div");
        title.className = StorageMenu.titleClassName;
        title.textContent = this.title;
        this.container.appendChild(title);
        for (const [id, entity] of zip(itemIdentifiers(), this.storage)) {
            this.items.set(id, entity);
            const row = document.createElement("div");
            row.textContent = `[${id}] - ${entity.name}`;
            this.container.appendChild(row);
        }
        document.body.appendChild(this.container);
    }

    public close() {
        if (!this.displayed) { return; }
        this.displayed = false;
        document.body.removeChild(assertNotNull(this.container));
        this.container = null;
    }
}
