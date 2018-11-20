import { Equipment, EquipmentSlot, equipmentSlotNames } from "./components/Equipment";
import { Storage } from "./components/Storage";
import { StorageMenu } from "./StorageMenu";
import { enumValues, isDefined, zip } from "./utils";

function insertAfter<T extends Node>(newChild: T, refChild: Node): T {
    const parent = refChild.parentElement;
    if (parent === null) {
        throw new Error("Cannot insert relative to Node which does not exist in DOM.");
    }
    parent.insertBefore(newChild, refChild.nextSibling);
    return newChild;
}

export class EquipmentMenu extends StorageMenu {
    private static readonly equipmentClassName: string = "equipment";
    private static readonly slotClassName: string = "equipment-slot";
    private static readonly itemClassName: string = "equipment-item";
    private static readonly emptySlotClassName: string = "equipment-empty";
    private static readonly emptySlotName: string = "(None)";

    constructor(
        storage: Storage,
        protected readonly equipment: Equipment
    ) {
        super("Equipment", storage);
    }

    public display() {
        super.display();
        const container = this.container!;
        const titleEl = container.firstChild!;
        const equipmentContainer = document.createElement("div");
        for (const [slot, slotName] of zip(enumValues(EquipmentSlot), equipmentSlotNames)) {            
            const row = document.createElement("div");
            row.className = EquipmentMenu.equipmentClassName;
            const slotEl = document.createElement("div");
            const itemEl = document.createElement("div");
            slotEl.className = EquipmentMenu.slotClassName;
            slotEl.textContent = `${slotName}: `;
            itemEl.className = EquipmentMenu.itemClassName;
            const item = this.equipment.slots.get(slot);
            if (isDefined(item)) {
                itemEl.textContent = item.name;
            } else {
                itemEl.textContent = EquipmentMenu.emptySlotName;
                itemEl.classList.add(EquipmentMenu.emptySlotClassName);
            }
            row.appendChild(slotEl);
            row.appendChild(itemEl);
            equipmentContainer.appendChild(row);
        }
        insertAfter(equipmentContainer, titleEl);
    }
}
