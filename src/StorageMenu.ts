import { Equipable } from "./components/Equipable";
import { Equipment } from "./components/Equipment";
import { Storage } from "./components/Storage";
import { Entity } from "./entities/Entity";
import { BaseMenu, IMenu, MenuKind } from "./Menu";
import { isDefined, zip } from "./utils";
import { v } from "./vdom";

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
        const owner = this.storage.owner;
        const container = this.createContainer();
        container.attrs.classList.add(StorageMenu.containerClassName);
        const iter = zip(BaseMenu.itemIdentifiers(), this.storage);
        if (owner.hasComponent(Equipment.Component)) {
            for (const [id, entity] of iter) {
                this.items.set(id, entity);
                let rowText = `[${id}] - ${entity.name}`;
                if (entity.hasComponent(Equipable.Component) && owner.equipment.hasEquipped(entity)) {
                    rowText += " (equipped)";
                }
                container.children.push(v("div", rowText));
            }
        } else {
            for (const [id, entity] of iter) {
                this.items.set(id, entity);
                container.children.push(v("div", `[${id}] - ${entity.name}`));
            }
        }
        this.container = container.appendTo(document.body);
    }
}
