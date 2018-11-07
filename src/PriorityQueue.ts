export type PriorityQueueEntry<T> = [number, T];
export class PriorityQueue<T> {
    private readonly heap: Array<PriorityQueueEntry<T>> = [];

    private siftDown(startPos: number, pos: number) {
        const heap = this.heap;
        let newItem = heap[pos];
        while (pos > startPos) {
            const parentPos = (pos - 1) >> 1;
            const parent = heap[parentPos];
            const cmp = newItem[0] < parent[0];
            if (!cmp) { return; }
            newItem = heap[pos];
            heap[parentPos] = newItem;
            heap[pos] = parent;
            pos = parentPos;
        }
    }

    private siftUp(pos: number) {
        const heap = this.heap;
        const endPos = heap.length;
        const startPos = pos;
        const limit = endPos >> 1;
        while (pos < limit) {
            let childPos = 2 * pos + 1;
            if (childPos + 1 < endPos) {
                const cmp = heap[childPos][0] < heap[childPos + 1][0];
                if (!cmp) {
                    childPos++;
                }
            }
            const tmp1 = heap[childPos];
            const tmp2 = heap[pos];
            heap[childPos] = tmp2;
            heap[pos] = tmp1;
            pos = childPos;
        }
        this.siftDown(startPos, pos);
    }

    public isEmpty(): boolean {
        return this.heap.length === 0;
    }

    public put(item: T, priority: number) {
        this.heap.push([priority, item]);
        this.siftDown(0, this.heap.length - 1);
    }

    public pop(): T {
        const heap = this.heap;
        const n = heap.length;
        if (n === 0) {
            throw new Error("Queue is empty");
        }
        const last = heap[n - 1];
        heap.pop();
        if (n === 1) {
            return last[1];
        }
        const item = heap[0];
        heap[0] = last;
        this.siftUp(0);
        return item[1];
    }
}
