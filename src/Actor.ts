import { Action } from "./actions/Action";
import { Array2d } from "./Array2d";
import { Controller, IController } from "./Controller";
import { Entity } from "./Entity";
import { Game } from "./Game";
import { assertNotNull, isNotNull } from "./utils";

export abstract class Actor extends Entity {
    private static readonly defaultFovRadius = 10;
    public readonly controller: IController;
    private fovRadius_: number = Actor.defaultFovRadius;
    private fov_: Array2d | null = null;

    constructor(
        game: Game,
        sprite: keyof Spritesheet,
        maxHealth: number,
        controllerCtor: new (...args: ConstructorParameters<Controller>) => IController
    ) {
        super(game, sprite, maxHealth);
        this.controller = new controllerCtor(game, this);
        this.updateFieldOfView();
    }

    public get fovRadius(): number {
        return this.fovRadius_;
    }

    public get fov(): Array2d | null {
        return this.fov_;
    }

    public updateFieldOfView() {
        const level = this.dungeonLevel;
        if (isNotNull(level)) {
            const x = assertNotNull(this.x);
            const y = assertNotNull(this.y);
            const fov = this.fov_;
            if (isNotNull(fov)) {
                level.updateFieldOfViewAt(fov, x, y, Actor.defaultFovRadius);
            } else {
                this.fov_ = level.getFieldOfViewAt(x, y, Actor.defaultFovRadius);
            }
        }
    }

    public async act(): Promise<Action> {
        this.updateFieldOfView();
        const action = await this.controller.getAction();
        action.execute(this.game, this);
        return action;
    }
}
