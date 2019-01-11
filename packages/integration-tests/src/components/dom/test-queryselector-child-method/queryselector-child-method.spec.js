/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
describe('Issue 653: Accessing element methods via querySelector throws', () => {
    const URL = 'http://localhost:4567/queryselector-child-method';

    before(() => {
        browser.url(URL);
    });

    it('clicking force button should update value', function () {
        const button = browser.element('button');
        button.click();
        const div = browser.element('.child-div');
        assert.deepEqual(div.getText(), 'method executed successfully');
    });
});