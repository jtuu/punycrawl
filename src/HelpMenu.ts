import { BaseMenu, IMenu, MenuKind } from "./Menu";
import { v } from "./vdom";

export class HelpMenu extends BaseMenu implements IMenu {
    protected static readonly containerClassName: string = "help-menu";
    private static readonly helpText: string = String.raw
`,---,
|Esc|
|---,---,---,---,---,---,---,---,---,---,---,---,---,-------,,---,---,---,,---,---,---,---,
|   | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0 |   |   | <-    ||   |   |   ||   |   |   |   |
|---'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-----||---|---|---||---|---|---|---|
| ->| | Q | W | E | R | T | Y | U | I | O | P |   |   |Enter||   |   |   || 7 | 8 | 9 |   |
|-----',--',--',--',--',--',--',--',--',--',--',--',--'|    |'---'---'---'|---|---|---|---|
|      | A | S | D | F | G | H | J | K | L |   |   |   |    |             | 4 | 5 | 6 |   |
|----,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'-,-'---'----|    ,---,    |---|---|---|---|
|    | \ | Z | X | C | V | B | N | M | , | . |   |          |    |   |    | 1 | 2 | 3 |   |
|----'-,-',--'--,'---'---'---'---'---'---'-,-'---|---,------|,---|---|---,|---'---|---|---|
| ctrl |  | alt |                          | alt |   | ctrl ||   |   |   ||       |   |   |
'------'  '-----'--------------------------'-----'   '------''---'---'---''-------'---'---'
This manual assumes your keyboard looks something like this.

Movement:
This game uses 8-directional movement.
Use the numpad to move or attack in a direction.
Alternatively you can use vi-keys.
    7 8 9        y k u
     \|/          \|/
    4- -6   or   h- -l
     /|\          /|\
    1 2 3        b j n
<    : Climb up or down a staircase
Num5 : Rest for a turn
.    : Rest for a turn

Menu navigation:
Esc : Close menu

Inventory management:
i : Show inventory
g : Pick up an item
d : Drop an item
w : Equip or unequip items
`;

    public readonly kind = MenuKind.NonInteractive;

    constructor() {
        super("Help");
    }

    // tslint:disable-next-line
    public handleKeypress(_keyPress: KeyboardEvent): null {
        return null;
    }

    public display() {
        super.display();
        const container = this.createContainer();
        container.attrs.classList.add(HelpMenu.containerClassName);
        container.children.push(v("div", HelpMenu.helpText));
        this.container = container.appendTo(document.body);
    }
}
