import { isNotNull, swap } from "./utils";

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

function partitionById<T extends HasId>(arr: Array<T>, lo: number, hi: number): number {
    const pivot = arr[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) {
        if (arr[j].id < pivot.id) {
            if (i !== j) {
                swap(arr, i, j);
            }
            i++;
        }
    }
    swap(arr, i, hi);
    return i;
}

function quicksortById<T extends HasId>(arr: Array<T>, lo: number = 0, hi: number = arr.length - 1) {
    if (lo < hi) {
        const part = partitionById(arr, lo, hi);
        quicksortById(arr, lo, part - 1);
        quicksortById(arr, part + 1, hi);
    }
}

export function sortById<T extends HasId>(arr: Array<T>) {
    quicksortById(arr);
}
