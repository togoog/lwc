/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from '@lwc/shared';

import { Renderer } from '../framework/vm';

const doc = document;

export const renderer: Renderer<Node, Element> = {
    insert(node, parent, anchor) {
        parent.insertBefore(node, anchor);
    },
    remove(node, parent) {
        parent.removeChild(node);
    },
    createElement(tagName, namespace) {
        return isUndefined(namespace)
            ? doc.createElement(tagName)
            : doc.createElementNS(namespace, tagName);
    },
    createText(content) {
        return doc.createTextNode(content);
    },
    setText(node, content) {
        node.nodeValue = content;
    },
    getAttribute(element, name, namespace) {
        return isUndefined(namespace)
            ? element.getAttribute(name)
            : element.getAttributeNS(namespace, name);
    },
    setAttribute(element, name, value, namespace) {
        if (isUndefined(namespace)) {
            element.setAttribute(name, value);
        } else {
            element.setAttributeNS(namespace, name, value);
        }
    },
    removeAttribute(element, name, namespace) {
        if (isUndefined(namespace)) {
            element.removeAttribute(name);
        } else {
            element.removeAttributeNS(namespace, name);
        }
    },
    addEventListener(target, type, callback) {
        target.addEventListener(type, callback);
    },
    removeEventListener(target, type, callback) {
        target.removeEventListener(type, callback);
    },
    dispatchEvent(target, event) {
        return target.dispatchEvent(event);
    },
    getClassList(element) {
        return element.classList;
    },
    getBoundingClientRect(element) {
        return element.getBoundingClientRect();
    },
    querySelector(element, selectors) {
        return element.querySelector(selectors);
    },
    querySelectorAll(element, selectors) {
        return element.querySelectorAll(selectors);
    },
    getElementsByTagName(element, tagNameOrWildCard) {
        return element.getElementsByTagName(tagNameOrWildCard);
    },
    getElementsByClassName(element, names) {
        return element.getElementsByClassName(names);
    },
    isConnected(node) {
        return node.isConnected;
    },
};
