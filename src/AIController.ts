import { Action } from "./actions/Action";
import { ActionFactory } from "./actions/ActionFactory";
import { ControllerKind, IController } from "./Controller";
import { assertNotNull, isNotNull } from "./utils";

export class AIController extends IController {
    public readonly kind = ControllerKind.AI;

    public async getAction(): Promise<Action> {
        const level = this.actor.dungeonLevel;
        if (isNotNull(level)) {
            const x = assertNotNull(this.actor.x) + 0;
            const y = assertNotNull(this.actor.y) - 1;
            if (level.withinBounds(x, y) && !level.terrainAt(x, y).blocksMovement && level.entitiesAt(x, y).length === 0) {
                return ActionFactory.createMoveAction(0, -1);
            }
        }
        return ActionFactory.createRestAction();
    }
}
