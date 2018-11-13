import { Damageable } from "../components/Damageable";
import { Location } from "../components/Location";
import { Entity } from "../Entity";
import { Game } from "../Game";
import { ActionKind, IAction } from "./Action";

export class AttackAction implements IAction {
    public readonly kind = ActionKind.Attack;

    constructor(
        public readonly dx: number,
        public readonly dy: number
    ) {}

    public execute(game: Game, actor: Entity) {
        const {location} = actor.assertHasComponent(Location.Component);
        const level = location.dungeonLevel;
        const x = location.x + this.dx;
        const y = location.y + this.dy;
        const entities = level.entitiesAt(x, y);
        for (const entity of entities) {
            if (entity.hasComponent(Damageable.Component)) {
                const dmg = 1;
                entity.damageable.takeDamage(dmg);
                game.logger.log(`The ${actor.name} hits the ${entity.name} for ${dmg} damage.`);
                if (!entity.damageable.alive) {
                    game.logger.log(`${actor.name} kills ${entity.name}.`);
                }
            }
        }
    }
}
