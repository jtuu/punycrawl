import { StrictMap } from "./StrictMap";

// Kind of like a queue.
// Implements Symbol.asyncIterator and can be conveniently used with
// infinite for-await-of loops.
// One stream can be used by multiple loops and every loop will
// receive every item.
export class AsyncStream<T = any> {
    // the underlying main data store of this class
    private items: T[] = [];
    // tracks how many times each item has been consumed
    private itemConsumptionCounts: number[] = [];
    // tracks the current index of each consumer (in the items array)
    private consumerIndices: StrictMap<Symbol, number> = new StrictMap();
    // contains the resolve functions for the itemAdded method
    private locks: Function[] = [];
    // contains the corresponding reject functions
    private rejects: Function[] = [];

    private terminated = false;

    constructor(private buffered: boolean) {}

    // the main use of this class
    // each invocation of this function is a new "consumer"
    public async *[Symbol.asyncIterator](): AsyncIterableIterator<T> {
        if (this.terminated) {
            return;
        }

        const id = Symbol();
        this.consumerIndices.set(id, 0);

        try {
            // yield items forever
            // wait for items to be added if there are none
            while (true) {
                if (this.items.length === 0 || this.consumerIndices.get(id) >= this.items.length) {
                    try {
                        await this.itemAdded();
                    } catch (err) {
                        break;
                    }
                }
                yield this.take(id);
            }
        } finally {
            // this will always be ran when the iterator ends
            this.consumerIndices.delete(id);
        }
    }

    // add a new item and make it ready to be consumed
    public add(item: T) {
        if (this.buffered || this.consumerCount > 0 && !this.terminated) {
            this.items.push(item);
            this.itemConsumptionCounts.push(0);
            this.unlock();
        }
    }

    // returns the next item for the given consumer
    protected take(consumerId: Symbol): T {
        const index = this.consumerIndices.get(consumerId);

        // select this consumers next item
        const item = this.items[index];
        // add 1 to the amount of times this item has been consumed
        const consumptionCount = ++this.itemConsumptionCounts[index];

        // move this consumers index to the next next item
        this.consumerIndices.set(consumerId, index + 1);

        // item has been consumed by all consumers and can be disposed
        if (consumptionCount >= this.consumerCount) {
            // remove item
            this.items.shift();
            this.itemConsumptionCounts.shift();
            // move all consumers' indices back by one
            for (const [k, i] of this.consumerIndices) {
                this.consumerIndices.set(k, i - 1);
            }
        }

        return item;
    }

    // call all of the stored resolve functions
    private unlock() {
        let lock: Function | undefined;
        while (((lock = this.locks.pop()) !== undefined) && this.rejects.pop()) {
            lock();
        }
    }

    public get consumerCount() {
        return this.consumerIndices.size;
    }

    public get size() {
        return this.items.length;
    }

    // returns a promise that will resolve when a new item is added
    private itemAdded(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.locks.push(resolve);
            this.rejects.push(reject);
        });
    }

    public terminate() {
        this.terminated = true;

        let reject: Function | undefined;
        while ((reject = this.rejects.pop()) !== undefined) {
            reject();
        }
    }
}
