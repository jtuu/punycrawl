export class CircularArray<T> extends Array<T> {
    *[Symbol.iterator](): IterableIterator<T> {
        const gen = super[Symbol.iterator];
        let it = gen();
        while (this.length) {
            const next = it.next();
            if (next.done) {
                it = gen();
            } else {
                yield next.value;
            }
        }
    }

    public clear() {
        this.length = 0;
    }
}
