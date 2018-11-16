import { AttackAction } from "./AttackAction";
import { ClimbStairsAction } from "./ClimbStairsAction";
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
}
