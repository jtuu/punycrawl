export function Bind<T extends Function>(_target: object, propName: string | symbol, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> {
    return {
        get(this: T): T {
            const bound = descriptor.value!.bind(this);
            Object.defineProperty(this, propName, Object.assign({}, descriptor, {
                value: bound
            }));
            return bound;
        }
    };
}
