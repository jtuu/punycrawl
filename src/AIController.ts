import { Action } from "./actions/Action";
import { ActionFactory } from "./actions/ActionFactory";
import { Controller } from "./Controller";

export class AIController extends Controller {
    public async getAction(): Promise<Action> {
        return ActionFactory.createRestAction();
    }
}
