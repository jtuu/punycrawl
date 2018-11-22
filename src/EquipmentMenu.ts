import { Equipment, EquipmentSlot, equipmentSlotNames } from "./components/Equipment";
import { Storage } from "./components/Storage";
import { StorageMenu } from "./StorageMenu";
import { enumValues, zip } from "./utils";
import { v } from "./vdom";

export class EquipmentMenu extends StorageMenu {
    private static readonly equipmentClassName: string = "equipment";
    private static readonly slotClassName: string = "equipment-slot";
    private static readonly itemClassName: string = "equipment-item";
    private static readonly emptySlotClassName: string = "equipment-empty";
    private static readonly emptySlotText: string = "(None)";

    constructor(
        storage: Storage,
        protected readonly equipment: Equipment
    ) {
        super("Equipment", storage);
    }

    public display() {
        super.display();
        const {
            equipmentClassName,
            slotClassName,
            itemClassName,
            emptySlotClassName,
            emptySlotText
        } = EquipmentMenu;
        const container = this.container!;
        const titleEl = container.firstChild!;
        const equipmentContainer = v("div");
        for (const [slot, slotName] of zip(enumValues(EquipmentSlot), equipmentSlotNames)) {
            const item = this.equipment.slots.get(slot);
            const itemNode = v("div", {class: itemClassName});
            if (item === undefined) {
                itemNode.attrs.classList.add(emptySlotClassName);
                itemNode.text = emptySlotText;
            } else {
                itemNode.text = item.name;
            }
            const row = v("div", {class: equipmentClassName}, [
                v("div", {class: slotClassName}, `${slotName}:`),
                itemNode
            ]);
            equipmentContainer.children.push(row);
        }
        equipmentContainer.insertAfter(titleEl);
    }
}
