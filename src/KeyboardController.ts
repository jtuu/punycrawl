import { Action, ActionKind } from "./actions/Action";
import { ActionFactory } from "./actions/ActionFactory";
import { ClimbStairsAction } from "./actions/ClimbStairsAction";
import { MoveAction } from "./actions/MoveAction";
import { Actor } from "./Actor";
import { ControllerKind, IController } from "./Controller";
import { Game } from "./Game";
import { Keyboard } from "./Keyboard";
import { StrictMap } from "./StrictMap";
import { ClimbDirection } from "./Terrain";
import { assertNotNull, isNotNull } from "./utils";

export class KeyboardController extends IController {
    public readonly kind = ControllerKind.Keyboard;
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
            ["IntlBackslash", ActionFactory.createClimbStairsAction()]
        ] as Array<[string, Action]>);
    }

    private static readonly keyboard: Keyboard = new Keyboard();

    private transformMoveAction(move: MoveAction): Action | null {
        const level = assertNotNull(this.actor.dungeonLevel);
        const x = assertNotNull(this.actor.x) + move.dx;
        const y = assertNotNull(this.actor.y) + move.dy;
        if (level.withinBounds(x, y)) {
            const terrain = level.terrainAt(x, y);
            if (terrain.blocksMovement) {
                return null;
            }
        } else {
            return null;
        }
        const entities = level.entitiesAt(x, y);
        for (const _entity of entities) {
            return ActionFactory.createAttackAction(move.dx, move.dy);
        }
        return move;
    }

    private transformClimbStairsAction(climb: ClimbStairsAction): Action | null {
        const level = assertNotNull(this.actor.dungeonLevel);
        const x = assertNotNull(this.actor.x);
        const y = assertNotNull(this.actor.y);
        if (level.withinBounds(x, y)) {
            const terrain = level.terrainAt(x, y);
            switch (terrain.climbDirection) {
                case ClimbDirection.Up:
                    if (level.previousLevel === null) { return null; }
                    break;
                case ClimbDirection.Down:
                    if (level.nextLevel === null) { return null; }
                    break;
            }
            climb.direction = terrain.climbDirection;
            return climb;
        }
        return null;
    }

    private transformAction(action: Action): Action | null {
        switch (action.kind) {
            case ActionKind.Move:
                return this.transformMoveAction(action);
            case ActionKind.ClimbStairs:
                return this.transformClimbStairsAction(action);
        }
        return action;
    }

    public async getAction(): Promise<Action> {
        for await (const keyPress of KeyboardController.keyboard.keyPresses) {
            if (this.controls.has(keyPress.code)) {
                const action = this.transformAction(this.controls.get(keyPress.code));
                if (isNotNull(action)) {
                    return action;
                }
            }
        }
        throw new Error("Keyboard broke");
    }
}
