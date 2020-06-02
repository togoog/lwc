/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

export {
    createContextProvider,
    register,
    api,
    track,
    wire,
    readonly,
    unwrap,
    setFeatureFlag,
    setFeatureFlagForTest,
    registerTemplate,
    registerComponent,
    registerDecorators,
    sanitizeAttribute,
    getComponentDef,
    isComponentConstructor,
    LightningElement,
} from '../../src';

// Public APIs -------------------------------------------------------------------------------------
export { renderComponent } from './apis/render-component';
