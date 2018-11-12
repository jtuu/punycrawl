import { isDefined } from "./utils";

interface TopicMap {
    [topic: number]: any;
}

export class EventEmitter<Topics extends TopicMap> {
    private handlerStore: Map<keyof Topics, Set<AsArgument<any>>> = new Map();

    public addEventListener<Topic extends keyof Topics>(topic: Topic, handler: AsArgument<Topics[Topic]>, once: boolean = false) {
        if (once) {
            this.once(topic, handler);
        } else {
            let handlers = this.handlerStore.get(topic);
            if (handlers === undefined) {
                handlers = new Set();
                this.handlerStore.set(topic, handlers);
            }
            handlers.add(handler);
        }
    }

    private once<Topic extends keyof Topics>(topic: Topic, handler: AsArgument<Topics[Topic]>) {
        let maybeHandlers = this.handlerStore.get(topic);
        if (maybeHandlers === undefined) {
            maybeHandlers = new Set();
            this.handlerStore.set(topic, maybeHandlers);
        }
        const handlers = maybeHandlers;
        maybeHandlers.add(function wrap(payload: Topics[Topic]) {
            handler(payload);
            handlers.delete(wrap);
        });
    }

    public removeEventListener<Topic extends keyof Topics>(topic: Topic, handler: AsArgument<Topics[Topic]>) {
        const handlers = this.handlerStore.get(topic);
        if (isDefined(handlers)) {
            handlers.delete(handler);
            if (handlers.size <= 0) {
                this.handlerStore.delete(topic);
            }
        }
    }

    public emit<Topic extends keyof Topics>(topic: Topic, payload: Topics[Topic]) {
        const handlers = this.handlerStore.get(topic);
        if (isDefined(handlers)) {
            for (const handler of handlers) {
                handler(payload);
            }
        }
    }
}
