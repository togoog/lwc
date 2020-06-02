/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, isNull } from '@lwc/shared';

import { Renderer } from '../../src';

import { HostNodeType, HostNode, HostElement, HostParentNode } from './types';

function unsupportedMethod(name: string): () => never {
    return function () {
        throw new TypeError(`"${name}" is not supported in this environment.`);
    };
}

function notImplementedMethod(name: string): () => any {
    return function () {
        // eslint-disable-next-line no-console
        console.warn(`"${name}" is not implemented yet.`);
    };
}

function removeNode(node: HostNode, parent: HostParentNode): void {
    const nodeIndex = parent.children.indexOf(node);

    if (nodeIndex === -1) {
        throw new Error('Unexpected node removal. The node is not a child of the parent node.');
    }

    parent.children.splice(nodeIndex, 1);
    node.parent = null;
}

export const renderer: Renderer<HostNode, HostElement> = {
    syntheticShadow: true,

    createElement(tagName: string, namespace?: string): HostElement {
        return {
            type: HostNodeType.Element,
            name: tagName,
            namespace: namespace,
            attributes: [],
            parent: null,
            children: [],
            shadowRoot: null,
        };
    },

    createText(content: string): HostNode {
        return {
            type: HostNodeType.Text,
            parent: null,
            value: content,
        };
    },

    insert(node: HostNode, parent: HostParentNode, anchor: HostNode): void {
        if (node.parent !== null) {
            removeNode(node, node.parent);
        }

        node.parent = parent;

        const anchorIndex = isNull(anchor) ? -1 : parent.children.indexOf(anchor);
        if (anchorIndex === -1) {
            parent.children.push(node);
        } else {
            parent.children.splice(anchorIndex, 0, node);
        }
    },

    remove(node: HostNode, parent: HostParentNode): void {
        removeNode(node, parent);
    },

    firstChild(node: HostNode): HostNode | null {
        if (node.type === HostNodeType.Text) {
            throw new Error('Unexpected firstChild lookup on a text node.');
        }

        return node.children[0] || null;
    },

    nextSibling(node: HostNode): HostNode | null {
        if (node.type === HostNodeType.Text) {
            throw new Error('Unexpected nextSibling lookup on a text node.');
        }

        if (isNull(node.parent)) {
            return null;
        }

        const nodeIndex = node.parent.children.indexOf(node);
        return node.parent.children[nodeIndex + 1] || null;
    },

    attachShadow(element: HostElement): HostNode {
        const shadowRoot = (element.shadowRoot = {
            type: HostNodeType.ShadowRoot,
            children: [],
        });

        // TODO [#0]: We should define a better typing mechanism to represent the ShadowRoot
        // interface properly.
        return (shadowRoot as any) as HostNode;
    },

    setText(node: HostNode, content: string): void {
        if (node.type === HostNodeType.Text) {
            node.value = content;
        } else if (node.type === HostNodeType.Element) {
            node.children = [
                {
                    type: HostNodeType.Text,
                    parent: node,
                    value: content,
                },
            ];
        }
    },

    getAttribute(element: HostElement, name: string, namespace?: string): string | null {
        const attribute = element.attributes.find(
            (attr) => attr.name === name && attr.namespace === namespace
        );

        return attribute ? attribute.value : null;
    },

    setAttribute(element: HostElement, name: string, value: string, namespace?: string): void {
        const attribute = element.attributes.find(
            (attr) => attr.name === name && attr.namespace === namespace
        );

        if (isUndefined(attribute)) {
            element.attributes.push({
                name,
                namespace: namespace || null,
                value: String(value),
            });
        } else {
            attribute.value = value;
        }
    },

    removeAttribute(element: HostElement, name: string, namespace?: string): void {
        const attributeIndex = element.attributes.findIndex(
            (attr) => attr.name === name && attr.namespace === namespace
        );

        if (attributeIndex !== -1) {
            element.attributes.splice(attributeIndex, 1);
        }
    },

    isConnected(): boolean {
        return true;
    },

    addEventListener: notImplementedMethod('addEventListener'),
    removeEventListener: notImplementedMethod('removeEventListener'),
    dispatchEvent: notImplementedMethod('dispatchEvent'),
    getClassList: notImplementedMethod('getClassList'),
    getStyleDeclaration: notImplementedMethod('getStyleDeclaration'),

    getBoundingClientRect: unsupportedMethod('getBoundingClientRect'),
    querySelector: unsupportedMethod('querySelector'),
    querySelectorAll: unsupportedMethod('querySelectorAll'),
    getElementsByTagName: unsupportedMethod('getElementsByTagName'),
    getElementsByClassName: unsupportedMethod('getElementsByClassName'),
};
