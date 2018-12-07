
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
    console.trace();
    throw new Error("Assert failed: not defined");
}

export function assertNotNull<T>(thing: T | null): T {
    if (isNotNull(thing)) {
        return thing;
    }
    console.trace();
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

export interface CssValue {
    value: number;
    unit: string;
}

const cssValuePattern = "^([0-9]+)([A-z]+)";

export function parseCssValue(css?: string | null): CssValue | null {
    if (!css) { return null; }
    const regex = new RegExp(cssValuePattern);
    const match = regex.exec(css);
    if (isNotNull(match)) {
        const value = parseFloat(match[1]);
        const unit = match[2];
        return { value, unit };
    }
    return null;
}

export function* zip<A, B>(iterableA: Iterable<A>, iterableB: Iterable<B>): IterableIterator<[A, B]> {
    const iA = iterableA[Symbol.iterator]();
    const iB = iterableB[Symbol.iterator]();
    let a;
    let b;
    while (!(a = iA.next()).done && !(b = iB.next()).done) {
        yield [a.value, b.value];
    }
}

export function enumValues<T>(e: T): Array<T[keyof T]> {
    return Object.values(e).filter(v => !isNaN(v));
}

export function enumSize(e: Object): number {
    let count = 0;
    for (const key of Object.keys(e)) {
        if (isNaN(Number(key))) {
            count++;
        }
    }
    return count;
}
