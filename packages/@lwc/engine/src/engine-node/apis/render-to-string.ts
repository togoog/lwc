/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { HostNodeType, HostText, HostElement, HostChildNode } from '../renderer';

function serializeChildren(nodes: HostChildNode[]): string {
    return nodes
        .map(node => {
            switch (node.type) {
                case HostNodeType.Text:
                    return serializeText(node);

                case HostNodeType.Element:
                    return serializeElement(node);
            }
        })
        .join('');
}

function serializeText(node: HostText): string {
    return node.value;
}

function serializeElement(element: HostElement): string {
    const attributes = element.attributes
        .map(attr => (attr.value === '' ? attr.name : `${attr.name}=${JSON.stringify(attr.value)}`))
        .join(' ');
    const children = serializeChildren(element.children);

    return `<${element.name} ${attributes}>${children}</${element.name}>`;
}

export function renderToString(element: HostElement): string {
    return serializeElement(element);
}
