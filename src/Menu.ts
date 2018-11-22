import { HelpMenu } from "./HelpMenu";
import { StorageMenu } from "./StorageMenu";
import { assertNotNull } from "./utils";
import { v, VirtualNode } from "./vdom";

export enum MenuKind {
    NonInteractive,
    Storage
}

export type Menu = StorageMenu | HelpMenu;

export interface IMenu {
    readonly kind: MenuKind;
    display(): void;
    handleKeypress(keyPress: KeyboardEvent): any;
    close(): void;
}

export abstract class BaseMenu {
    protected static readonly containerClassName: string = "menu";
    protected static readonly titleClassName: string = "menu-title";
    protected displayed: boolean = false;
    protected container: HTMLDivElement | null = null;

    constructor (
        public readonly title: string
    ) {}

    protected createContainer(): VirtualNode<"div"> {
        return v("div", {class: BaseMenu.containerClassName}, [
            v("div", {class: BaseMenu.titleClassName}, this.title)
        ]);
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

    public display() {
        if (this.displayed) { return; }
        this.displayed = true;
    }

    public close() {
        if (!this.displayed) { return; }
        this.displayed = false;
        document.body.removeChild(assertNotNull(this.container));
        this.container = null;
    }
}
