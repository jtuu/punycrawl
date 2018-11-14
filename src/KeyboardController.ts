import { Action, ActionKind } from "./actions/Action";
import { ActionFactory } from "./actions/ActionFactory";
import { ClimbStairsAction } from "./actions/ClimbStairsAction";
import { MoveAction } from "./actions/MoveAction";
import { Location } from "./components/Location";
import { ControllerKind, IController } from "./Controller";
import { DungeonLevel } from "./DungeonLevel";
import { Entity } from "./Entity";
import { Game } from "./Game";
import { E, N, NE, NW, S, SE, SW, W } from "./geometry";
import { Keyboard } from "./Keyboard";
import { StrictMap } from "./StrictMap";
import { ClimbDirection } from "./Terrain";
import { isNotNull } from "./utils";

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
        actor: Entity
    ) {
        super(game, actor);
    }

    private static readonly keyboard: Keyboard = new Keyboard();

    private transformMoveAction(move: MoveAction): Action | null {
        if (!this.actor.hasComponent(Location.Component)) {
            return null;
        }
        const level = this.actor.location.dungeonLevel;
        const x = this.actor.location.x + move.dx;
        const y = this.actor.location.y + move.dy;
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
        if (!this.actor.hasComponent(Location.Component)) {
            return null;
        }
        const {dungeonLevel: level, x, y} = this.actor.location;
        if (level.withinBounds(x, y)) {
            const terrain = level.terrainAt(x, y);
            if (terrain.climbDirection === ClimbDirection.None) {
                this.game.logger.logGlobal("There's nothing to climb here.");
                return null;
            }
            let destinationLevel: DungeonLevel | null = null;
            if (terrain.climbDirection === ClimbDirection.Up) {
                destinationLevel = level.previousLevel;
            } else if (terrain.climbDirection === ClimbDirection.Down) {
                destinationLevel = level.nextLevel;
            }
            if (destinationLevel === null) {
                this.game.logger.logGlobal(`The ${terrain.name} appears to be blocked by something.`);
                return null;
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
        this.game.draw();
        for await (const keyPress of KeyboardController.keyboard.keyPresses) {
            if (KeyboardController.controls.has(keyPress.code)) {
                const action = this.transformAction(KeyboardController.controls.get(keyPress.code));
                if (isNotNull(action)) {
                    return action;
                }
            }
        }
        throw new Error("Keyboard broke");
    }

    // tslint:disable-next-line
    public dispose() {
        
    }
}
