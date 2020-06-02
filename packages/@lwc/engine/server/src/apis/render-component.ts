/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {
    LightningElement,
    getComponentInternalDef,
    setElementProto,
    createVM,
    connectRootElement,
} from '../../../src';

import { renderer } from '../renderer';
import { serializeElement } from '../serializer';

export function renderComponent(
    name: string,
    Ctor: typeof LightningElement,
    props: Record<string, any>
): string {
    const element = renderer.createElement(name);

    const def = getComponentInternalDef(Ctor);
    setElementProto(element, def);

    createVM(element, def, {
        tagName: name,
        mode: 'open',
        isRoot: true,
        owner: null,
        renderer,
    });

    for (const [key, value] of Object.entries(props)) {
        (element as any)[key] = value;
    }

    connectRootElement(element);

    return serializeElement(element);
}
