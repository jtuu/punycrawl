export function isNotNull<T>(thing: T | null): thing is T {
    return thing !== null;
}

export function isDefined<T>(thing: T | undefined): thing is T {
    return thing !== undefined;
}

export function assertDefined<T>(thing: T | undefined): T {
    if (isDefined(thing)) {
        return thing;
    }
    throw new Error("Assert failed: not defined");
}

export function assertNotNull<T>(thing: T | null): T {
    if (isNotNull(thing)) {
        return thing;
    }
    throw new Error("Assert failed: is null");
}

export function filterInstanceOf<T extends Function>(array: Array<any>, t: T): Array<T["prototype"]> {
    const result: Array<T> = [];
    for (const item of array) {
        if (item instanceof t) {
            result.push(item);
        }
    }
    return result;
}

export function swap(arr: Array<any>, i: number, j: number) {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

export function unused(..._args: any[]) {}
