import { isDefined } from "./utils";

export class Queue<T> {
    protected readonly queue: Array<T> = [];

    public isEmpty(): boolean {
        return this.queue.length === 0;
    }

    public enqueue(item: T) {
        this.queue.push(item);
    }

    public dequeue(): T {
        const item = this.queue.shift();
        if (isDefined(item)) {
            return item;
        }
        throw new Error("Failed to dequeue");
    }
}
