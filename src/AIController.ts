import { Action } from "./actions/Action";
import { ActionFactory } from "./actions/ActionFactory";
import { IController } from "./Controller";

export class AIController extends IController {
    public async getAction(): Promise<Action> {
        return ActionFactory.createRestAction();
    }
}
