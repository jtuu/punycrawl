import { Id } from "../Id";
import { AttackAction } from "./AttackAction";
import { ClimbStairsAction } from "./ClimbStairsAction";
import { DropAction } from "./DropAction";
import { EquipAction } from "./EquipAction";
import { MoveAction } from "./MoveAction";
import { PickupAction } from "./PickupAction";
import { RestAction } from "./RestAction";

export class ActionFactory {
    public static createMoveAction(dx: number, dy: number): MoveAction {
        return new MoveAction(dx, dy);
    }

    public static createAttackAction(dx: number, dy: number): AttackAction {
        return new AttackAction(dx, dy);
    }

    public static createRestAction(): RestAction {
        return RestAction;
    }

    public static createClimbStairsAction(): ClimbStairsAction {
        return new ClimbStairsAction();
    }

    public static createPickupAction(): PickupAction {
        return new PickupAction();
    }

    public static createDropAction(targetId: Id): DropAction {
        return new DropAction(targetId);
    }

    public static createEquipAction(targetId: Id): EquipAction {
        return new EquipAction(targetId);
    }
}
