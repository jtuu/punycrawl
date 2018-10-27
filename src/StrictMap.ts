import { isDefined } from "./utils";

export class StrictMap<K, V> extends Map<K, V> {
    constructor(entries?: ReadonlyArray<[K, V]>) {
        super(entries);
    }
  
    public get(key: K): V {
        const val = super.get(key);
        if (isDefined(val)) {
            return val;
        }
        throw new Error(`No such key "${key}".`);
    }
}
  