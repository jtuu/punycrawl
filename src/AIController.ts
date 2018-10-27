import { Action } from "./Action";
import { Controller } from "./Controller";

export class AIController extends Controller {
    public async getAction(): Promise<Action> {
        return this.actionFactory.createRestAction();
    }
}
