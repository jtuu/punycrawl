import { Storage } from "./components/Storage";
import { Entity } from "./entities/Entity";
import { BaseMenu, IMenu, MenuKind } from "./Menu";
import { isDefined, zip } from "./utils";

export class StorageMenu extends BaseMenu implements IMenu {
    protected static readonly containerClassName: string = "storage-menu";
    public readonly kind = MenuKind.Storage;
    private readonly items: Map<string, Entity> = new Map();

    constructor(
        title: string,
        public readonly storage: Storage
    ) {
        super(title);
    }

    public handleKeypress(keyPress: KeyboardEvent): Entity | null {
        const item = this.items.get(keyPress.key);
        if (isDefined(item)) {
            return item;
        }
        return null;
    }

    public display() {
        super.display();
        this.container = this.createContainer();
        this.container.classList.add(StorageMenu.containerClassName);
        for (const [id, entity] of zip(BaseMenu.itemIdentifiers(), this.storage)) {
            this.items.set(id, entity);
            const row = document.createElement("div");
            row.textContent = `[${id}] - ${entity.name}`;
            this.container.appendChild(row);
        }
        document.body.appendChild(this.container);
    }
}
