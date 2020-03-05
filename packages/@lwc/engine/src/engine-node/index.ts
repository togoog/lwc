/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// APIs from the core engine
export {
    LightningElement,
    register,
    registerTemplate,
    registerComponent,
    registerDecorators,
    sanitizeAttribute,
    readonly,
    getComponentDef,
    isComponentConstructor,
    getComponentConstructor,
    unwrap,
    setFeatureFlag,
    setFeatureFlagForTest,
} from '../framework/main';

// APIs from the DOM engine
export { createElement } from './apis/create-element';
export { renderToString } from './apis/render-to-string';
