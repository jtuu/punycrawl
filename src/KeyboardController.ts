import { Action, ActionKind } from "./actions/Action";
import { ActionFactory } from "./actions/ActionFactory";
import { ClimbStairsAction } from "./actions/ClimbStairsAction";
import { MoveAction } from "./actions/MoveAction";
import { Actor } from "./Actor";
import { ControllerKind, IController } from "./Controller";
import { Game } from "./Game";
import { E, N, NE, NW, S, SE, SW, W } from "./geometry";
import { Keyboard } from "./Keyboard";
import { StrictMap } from "./StrictMap";
import { ClimbDirection } from "./Terrain";
import { assertNotNull, isNotNull } from "./utils";

export class KeyboardController extends IController {
    public readonly kind = ControllerKind.Keyboard;
    private static readonly controls: StrictMap<string, Action> = new StrictMap([
        ["Numpad1", ActionFactory.createMoveAction(...SW)],
        ["Numpad2", ActionFactory.createMoveAction(...S)],
        ["Numpad3", ActionFactory.createMoveAction(...SE)],
        ["Numpad4", ActionFactory.createMoveAction(...W)],
        ["Numpad5", ActionFactory.createRestAction()],
        ["Numpad6", ActionFactory.createMoveAction(...E)],
        ["Numpad7", ActionFactory.createMoveAction(...NW)],
        ["Numpad8", ActionFactory.createMoveAction(...N)],
        ["Numpad9", ActionFactory.createMoveAction(...NE)],
        ["IntlBackslash", ActionFactory.createClimbStairsAction()]
    ] as Array<[string, Action]>);

    constructor(
        game: Game,
        actor: Actor
    ) {
        super(game, actor);
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

    private sleepMode = false;

    public async getAction(): Promise<Action> {
        await this.game.awaitDraw();
        if (this.sleepMode) {
            return ActionFactory.createRestAction();
        }
        for await (const keyPress of KeyboardController.keyboard.keyPresses) {
            if (KeyboardController.controls.has(keyPress.code)) {
                const action = this.transformAction(KeyboardController.controls.get(keyPress.code));
                if (isNotNull(action)) {
                    return action;
                }
            } else {
                this.sleepMode = true;
            }
        }
        throw new Error("Keyboard broke");
    }
}
