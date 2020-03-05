/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isFunction, isNull, isObject, isUndefined, toString } from '@lwc/shared';

import { LightningElement, getComponentDef } from '../../framework/main';

import { createVM, appendRootVM, removeRootVM, getAssociatedVMIfPresent } from '../../framework/vm';
import { setElementProto } from '../../framework/def';

import { nodeConnected, nodeDisconnected } from '../node-reactions';
import { renderer } from '../renderer';

/**
 * EXPERIMENTAL: This function is almost identical to document.createElement with the slightly
 * difference that in the options, you can pass the `is` property set to a Constructor instead of
 * just a string value. The intent is to allow the creation of an element controlled by LWC without
 * having to register the element as a custom element.
 *
 * @example
 * ```
 * const el = createElement('x-foo', { is: FooCtor });
 * ```
 */
export function createElement(
    tagName: string,
    options: {
        is: typeof LightningElement;
        mode?: 'open' | 'closed';
    }
): HTMLElement {
    if (!isObject(options) || isNull(options)) {
        throw new TypeError(
            `"createElement" function expects an object as second parameter but received "${toString(
                options
            )}".`
        );
    }

    const Ctor = options.is;
    if (!isFunction(Ctor)) {
        throw new TypeError(
            `"createElement" function expects a "is" option with a valid component constructor.`
        );
    }

    // TODO: Find a better way to do avoid the type guard here.
    const element = renderer.createElement(tagName) as HTMLElement;

    // There is a possibility that a custom element is registered under tagName, in which case, the
    // initialization is already carry on, and there is nothing else to do here.
    if (!isUndefined(getAssociatedVMIfPresent(element))) {
        return element;
    }

    const def = getComponentDef(Ctor);
    setElementProto(element, def);

    const vm = createVM(element, def.ctor, {
        mode: options.mode !== 'closed' ? 'open' : 'closed',
        isRoot: true,
        owner: null,
        renderer,
    });

    nodeConnected(element, () => appendRootVM(vm));
    nodeDisconnected(element, () => removeRootVM(vm));

    return element;
}
