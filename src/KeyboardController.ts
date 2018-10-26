import { Action } from "./actions/Action";
import { ActionFactory } from "./actions/ActionFactory";
import { Actor } from "./Actor";
import { Controller } from "./Controller";
import { Game } from "./Game";
import { Keyboard } from "./Keyboard";
import { StrictMap } from "./StrictMap";

export class KeyboardController extends Controller {
    private readonly controls: StrictMap<string, Action>;

    constructor(
        game: Game,
        actor: Actor
    ) {
        super(game, actor);
        this.controls = new StrictMap([
            ["Numpad1", ActionFactory.createMoveAction(-1, +1)],
            ["Numpad2", ActionFactory.createMoveAction( 0, +1)],
            ["Numpad3", ActionFactory.createMoveAction(+1, +1)],
            ["Numpad4", ActionFactory.createMoveAction(-1,  0)],
            ["Numpad5", ActionFactory.createRestAction()],
            ["Numpad6", ActionFactory.createMoveAction(+1,  0)],
            ["Numpad7", ActionFactory.createMoveAction(-1, -1)],
            ["Numpad8", ActionFactory.createMoveAction( 0, -1)],
            ["Numpad9", ActionFactory.createMoveAction(+1, -1)],
        ] as Array<[string, Action]>);
    }

    private static readonly keyboard: Keyboard;

    private validateAction(action: Action): boolean {
        return true;
    }

    public async getAction(): Promise<Action> {
        for await (const keyPress of KeyboardController.keyboard.keyPresses) {
            if (this.controls.has(keyPress.code)) {
                const action = this.controls.get(keyPress.code);
                if (this.validateAction(action)) {
                    return action;
                }
            }
        }
        throw new Error("Keyboard broke");
    }
}
