/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { isUndefined, isNull } from '@lwc/shared';

import { Renderer } from '../framework/vm';

export enum HostNodeType {
    Text = 'text',
    Element = 'element',
    ShadowRoot = 'shadow-root',
}

export interface HostText {
    type: HostNodeType.Text;
    parent: HostElement | null;
    value: string;
}

export interface HostAttribute {
    name: string;
    namespace?: string;
    value: string;
}

export interface HostShadowRoot {
    type: HostNodeType.ShadowRoot;
    children: HostChildNode[];
}

export interface HostElement {
    type: HostNodeType.Element;
    name: string;
    parent: HostElement | null;
    shadowRoot: HostShadowRoot | null;
    namespace?: string;
    children: HostChildNode[];
    attributes: HostAttribute[];
    eventListeners: Record<string, Function[]>;
}

export type HostNode = HostText;
export type HostChildNode = HostElement | HostText;

function unsupportedMethod(name: string): () => never {
    return function() {
        throw new TypeError(`"${name}" is not supported in this environment`);
    }
}

export const renderer: Renderer<HostNode, HostElement> = {
    useSyntheticShadow: false,
    insert(node, parent, anchor) {
        if (node.parent !== null && node.parent !== parent) {
            const nodeIndex = node.parent.children.indexOf(node);
            node.parent.children.splice(nodeIndex, 1);
        }

        node.parent = parent;

        const anchorIndex = isNull(anchor) ? -1 : parent.children.indexOf(anchor);
        if (anchorIndex === -1) {
            parent.children.push(node);
        } else {
            parent.children.splice(anchorIndex, 0, node);
        }
    },
    remove(node, parent) {
        const nodeIndex = parent.children.indexOf(node);
        parent.children.splice(nodeIndex, 1);
    },
    createElement(name, namespace) {
        return {
            type: HostNodeType.Element,
            name,
            namespace,
            parent: null,
            shadowRoot: null,
            children: [],
            attributes: [],
            eventListeners: {},
        };
    },
    createText(content) {
        return {
            type: HostNodeType.Text,
            value: content,
            parent: null,
        };
    },
    attachShadow(element) {
        element.shadowRoot = {
            type: HostNodeType.ShadowRoot,
            children: [],
        };

        // TODO: Fix the typings here.
        return (element.shadowRoot as unknown) as HostNode;
    },
    setText(node, content) {
        node.value = content;
    },
    getAttribute(element, name, namespace) {
        const attribute = element.attributes.find(
            attr => attr.name === name && attr.namespace === namespace
        );
        return attribute ? attribute.name : null;
    },
    setAttribute(element, name, value, namespace) {
        const attribute = element.attributes.find(
            attr => attr.name === name && attr.namespace === namespace
        );

        if (isUndefined(attribute)) {
            element.attributes.push({
                name,
                namespace,
                value,
            });
        } else {
            attribute.value = value;
        }
    },
    removeAttribute(element, name, namespace) {
        element.attributes = element.attributes.filter(
            attr => attr.name !== name && attr.namespace !== namespace
        );
    },
    addEventListener(target, type, callback) {
        const listeners = target.eventListeners[type] || [];
        listeners.push(callback);
    },
    removeEventListener(target, type, callback) {
        const listeners = target.eventListeners[type] || [];

        const listenerIndex = listeners.indexOf(callback);
        if (listenerIndex !== -1) {
            listeners.splice(listenerIndex, 1);
        }
    },
    dispatchEvent(_target, _event) {
        throw new Error('"dispatchEvent" is not yet available.');
    },
    getClassList(element) {
        function getClassAttribute(): HostAttribute | undefined {
            return element.attributes.find(
                attr => attr.name === 'class' && isUndefined(attr.namespace)
            );
        }

        function tokenizeClasses(value: string): Set<string> {
            return new Set(value.trim().split(/\W+/g));
        }

        function serializeClasses(values: Set<string>): string {
            return Array.from(values).join(' ');
        }

        return {
            add(...names: string[]): void {
                const classAttribute = getClassAttribute();
                if (isUndefined(classAttribute)) {
                    return;
                }

                const classes = tokenizeClasses(classAttribute.value);
                names.forEach(name => classes.add(name));
                classAttribute.value = serializeClasses(classes);
            },
            remove(...names: string[]): void {
                const classAttribute = getClassAttribute();
                if (isUndefined(classAttribute)) {
                    return;
                }

                const classes = tokenizeClasses(classAttribute.value);
                names.forEach(name => classes.delete(name));
                classAttribute.value = serializeClasses(classes);
            },
        } as DOMTokenList;
    },
    isConnected() {
        return true;
    },

    getBoundingClientRect: unsupportedMethod('getBoundingClientRect'),
    querySelector: unsupportedMethod('querySelector'),
    querySelectorAll: unsupportedMethod('querySelectorAll'),
    getElementsByTagName: unsupportedMethod('getElementsByTagName'),
    getElementsByClassName: unsupportedMethod('getElementsByClassName'),
};
