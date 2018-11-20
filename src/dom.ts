import { isDefined } from "./utils";

export function insertAfter<T extends Node>(newChild: T, refChild: Node): T {
    const parent = refChild.parentElement;
    if (parent === null) {
        throw new Error("Cannot insert relative to Node which does not exist in DOM.");
    }
    parent.insertBefore(newChild, refChild.nextSibling);
    return newChild;
}

interface BaseVirtualNodeAttributes {

}

type TagName = keyof HTMLElementTagNameMap;
type VirtualNodeAttributes = Partial<BaseVirtualNodeAttributes>;
type VirtualNodeChildren = Array<VirtualNode>;
type VirtualNodeOptionalArg = VirtualNodeAttributes | VirtualNode;

class VirtualNode {
    protected readonly tagName: TagName;
    protected readonly attrs: Partial<VirtualNodeAttributes>;
    protected readonly children: Array<VirtualNode>;

    constructor(
        tagName: TagName,
        attrsOrChildren?: VirtualNodeOptionalArg,
        children: VirtualNodeChildren = []
    ) {
        this.tagName = tagName;
        if (isDefined(attrsOrChildren)) {
            if (attrsOrChildren instanceof VirtualNode) {
                children.unshift(attrsOrChildren);
                this.attrs = {};
            } else {
                this.attrs = attrsOrChildren;
            }
        } else {
            this.attrs = {};
        }
        this.children = children;
    }

    public toDOM(): HTMLElement {

    }
}

export function doc(...args: ConstructorParameters<typeof VirtualNode>): VirtualNode {
    return new VirtualNode(...args);
}

doc("div", {}, [doc("div")]);
