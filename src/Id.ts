import { isNotNull } from "./utils";

export type Id = number;

interface HasId {
    id: Id;
}

export function findIndexById<T extends HasId>(haystack: Array<T>, needle: Id): number | null {
    for (let i = 0; i < haystack.length; i++) {
        const item = haystack[i];
        if (item.id === needle) {
            return i;
        }
    }
    return null;
}

export function findById<T extends HasId>(haystack: Array<T>, needle: Id): T | null {
    const idx = findIndexById(haystack, needle);
    if (isNotNull(idx)) {
        return haystack[idx];
    } else {
        return null;
    }
}

export function removeById<T extends HasId>(haystack: Array<T>, needle: Id): boolean {
    const idx = findIndexById(haystack, needle);
    if (isNotNull(idx)) {
        haystack.splice(idx, 1);
        return true;
    } else {
        return false;
    }
}
