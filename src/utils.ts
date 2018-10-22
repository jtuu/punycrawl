export function isNotNull<T>(thing: T | null): thing is T {
    return thing !== null;
}

export function isDefined<T>(thing: T | undefined): thing is T {
    return thing !== undefined;
}
