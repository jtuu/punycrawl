import { Action, ActionKind } from "./actions/Action";
import { ActionFactory } from "./actions/ActionFactory";
import { ClimbStairsAction } from "./actions/ClimbStairsAction";
import { MoveAction } from "./actions/MoveAction";
import { PickupAction } from "./actions/PickupAction";
import { Damageable } from "./components/Damageable";
import { Location } from "./components/Location";
import { Physical } from "./components/Physical";
import { Storage } from "./components/Storage";
import { ControllerKind, IController } from "./Controller";
import { DungeonLevel } from "./DungeonLevel";
import { Entity } from "./entities/Entity";
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
        ["IntlBackslash", ActionFactory.createClimbStairsAction()],
        ["KeyG", ActionFactory.createPickupAction()]
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
        let blocksMovement = false;
        let damageable = false;
        for (const entity of entities) {
            if (entity.hasComponent(Physical.Component) && entity.physical.blocksMovement) {
                blocksMovement = true;
            }
            if (entity.hasComponent(Damageable.Component)) {
                damageable = true;
                break;
            }
        }
        if (damageable) {
            return ActionFactory.createAttackAction(move.dx, move.dy);
        }
        if (blocksMovement) {
            return null;
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

    private transformPickupAction(pickup: PickupAction): Action | null {
        if (!this.actor.hasComponents(Location.Component, Storage.Component)) {
            return null;
        }
        if (this.actor.storage.isFull()) {
            this.game.logger.logGlobal("Your inventory is full.");
            return null;
        }
        const {dungeonLevel, x, y} = this.actor.location;
        // pick up first thing we find
        for (const entity of dungeonLevel.entitiesAt(x, y)) {
            // but don't pick up yourself
            if (entity !== this.actor) {
                pickup.targetId = entity.id;
                return pickup;
            }
        }
        this.game.logger.logGlobal("There's nothing to pick up here.");
        return null;
    }

    private transformAction(action: Action): Action | null {
        switch (action.kind) {
            case ActionKind.Move:
                return this.transformMoveAction(action);
            case ActionKind.ClimbStairs:
                return this.transformClimbStairsAction(action);
            case ActionKind.Pickup:
                return this.transformPickupAction(action);
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
            } else if (keyPress.code === "KeyI") {
                console.log((this.actor as any).storage.contents);
            }
        }
        throw new Error("Keyboard broke");
    }

    // tslint:disable-next-line
    public dispose() {
        
    }
}
