import { Action } from "./actions/Action";
import { ActionFactory } from "./actions/ActionFactory";
import { ControllerKind, IController } from "./Controller";
import { Entity } from "./Entity";
import { Visibility } from "./fov";
import { Human } from "./Human";
import { assertNotNull, isNotNull } from "./utils";

export class AIController extends IController {
    public readonly kind = ControllerKind.AI;

    private findAttackTarget(): Entity | null {
        const level = this.actor.dungeonLevel;
        const fov = this.actor.fov;
        if (isNotNull(level) && isNotNull(fov)) {
            const x = assertNotNull(this.actor.x);
            const y = assertNotNull(this.actor.y);
            const r = this.actor.fovRadius;
            for (let fx = 0; fx < fov.width; fx++) {
                const col = fov.columns[fx];
                for (let fy = 0; fy < fov.height; fy++) {
                    const vis = col[fy] as Visibility;
                    if (vis === Visibility.Visible) {
                        const dx = x + fx - r;
                        const dy = y + fy - r;
                        const entities = level.entitiesAt(dx, dy);
                        for (const entity of entities) {
                            if (entity instanceof Human) {
                                return entity;
                            }
                        }
                    }
                }
            }
        }
        return null;
    }

    public basicAI(): Action | null {
        const level = this.actor.dungeonLevel;
        if (level === null) { return null; }
        const target = this.findAttackTarget();
        if (target === null) { return null; }
        const x = assertNotNull(this.actor.x);
        const y = assertNotNull(this.actor.y);
        const dir = target.pathmap.getNextDirection(x, y);
        if (dir === null) { return null; }
        const [dx, dy] = dir;
        if (level.entitiesAt(x + dx, y + dy).includes(target)) {
            return ActionFactory.createAttackAction(dx, dy);
        } else {
            return ActionFactory.createMoveAction(dx, dy);
        }
    }

    public async getAction(): Promise<Action> {
        return this.basicAI() || ActionFactory.createRestAction();
    }
}
