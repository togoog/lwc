import { isUndefined } from '@lwc/shared';

import { Renderer } from '../framework/vm';

const doc = document;

function insert(node: Node, parent: Node, anchor: Node | null): void {
    parent.insertBefore(node, anchor);
}

function remove(node: Node, parent: Node): void {
    parent.removeChild(node);
}

function createElement(tagName: string): HTMLElement;
function createElement(tagName: string, namespace?: string): Element {
    return isUndefined(namespace)
        ? doc.createElement(tagName)
        : doc.createElementNS(namespace, tagName);
}

function createText(content: string): Text {
    return doc.createTextNode(content);
}

function setText(node: Node, content: string): void {
    node.nodeValue = content;
}

function setAttribute(element: Element, name: string, value: string, namespace?: string): void {
    if (isUndefined(namespace)) {
        element.setAttribute(name, value);
    } else {
        element.setAttributeNS(namespace, name, value);
    }
}

function removeAttribute(element: Element, name: string, namespace?: string): void {
    if (isUndefined(namespace)) {
        element.removeAttribute(name);
    } else {
        element.removeAttributeNS(namespace, name);
    }
}

function addEventListener(target: Node, type: string, callback: (event: Event) => any): void {
    target.addEventListener(type, callback);
}

function removeEventListener(target: Node, type: string, callback: (event: Event) => any): void {
    target.removeEventListener(type, callback);
}

function dispatchEvent(target: Node, event: Event): void {
    target.dispatchEvent(event);
}

function getClassList(element: Element): DOMTokenList {
    return element.classList;
}

export const renderer: Renderer<Node, Element> = {
    insert,
    remove,
    createElement,
    createText,
    setText,
    setAttribute,
    removeAttribute,
    addEventListener,
    removeEventListener,
    dispatchEvent,
    getClassList,
};
