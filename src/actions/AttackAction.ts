import { Attribute, Attributes } from "../components/Attributes";
import { getActionCost } from "../components/Controlled";
import { Damageable } from "../components/Damageable";
import { EquipableStats } from "../components/Equipable";
import { Equipment, EquipmentSlot } from "../components/Equipment";
import { Location } from "../components/Location";
import { Entity } from "../entities/Entity";
import { Game } from "../Game";
import { isNotNull } from "../utils";
import { ActionKind, IAction } from "./Action";

export class AttackAction implements IAction {
    public readonly kind = ActionKind.Attack;

    constructor(
        public readonly dx: number,
        public readonly dy: number
    ) {}

    public execute(game: Game, actor: Entity): number {
        const {location} = actor.assertHasComponent(Location.Component);
        const level = location.dungeonLevel;
        const x = location.x + this.dx;
        const y = location.y + this.dy;
        const entities = level.entitiesAt(x, y);
        let dmg = 1;
        let acc = 1;
        let delay = 10;
        if (actor.hasComponent(Attributes.Component)) {
            dmg = 0;
            const attrs = actor.attributes.getTotalAttributes().values;
            const d1 = attrs[Attribute.AttackDice1];
            const d2 = attrs[Attribute.AttackDice2];
            for (let i = 0; i < d1; i++) {
                dmg += Math.floor(Math.random() * d2 + 1);
            }
            acc = attrs[Attribute.Accuracy];
        }
        if (actor.hasComponent(Equipment.Component)) {
            const weapon = actor.equipment.get(EquipmentSlot.MainHand);
            if (isNotNull(weapon)) {
                delay = weapon.equipable.stats[EquipableStats.MeleeDelay];
            }
        }
        for (const defender of entities) {
            if (defender.hasComponent(Damageable.Component)) {
                let eva = 0;
                let def = 0;
                if (defender.hasComponent(Attributes.Component)) {
                    const attrs = defender.attributes.getTotalAttributes().values;
                    eva = attrs[Attribute.Evasion];
                    def = attrs[Attribute.Defense];
                }
                const hit = Math.random() * eva < acc;
                if (hit) {
                    dmg -= def;
                    if (dmg > 0) {
                        defender.damageable.takeDamage(dmg);
                        game.logger.logLocal(location, `The ${actor.name} hits the ${defender.name} for ${dmg} damage.`);
                        if (!defender.damageable.alive) {
                            game.logger.logLocal(location, `${actor.name} kills ${defender.name}.`);
                        }
                    } else {
                        game.logger.logLocal(location, `The ${actor.name} hits the ${defender.name} but does no damage.`);
                    }
                } else {
                    game.logger.logLocal(location, `The ${actor.name}s attack misses the ${defender.name}.`);
                }
            }
        }
        return getActionCost(actor, this.kind) + delay;
    }
}
