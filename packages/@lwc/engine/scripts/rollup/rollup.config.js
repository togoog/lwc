/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');
const typescript = require('typescript');
const rollupTypescriptPlugin = require('rollup-plugin-typescript');
const nodeResolve = require('rollup-plugin-node-resolve');
const babel = require('@babel/core');
const babelFeaturesPlugin = require('@lwc/features/src/babel-plugin');

const { version } = require('../../package.json');
const targetDirectory = path.resolve(__dirname, '../../dist/');

const banner = `/* proxy-compat-disable */`;
const footer = `/** version: ${version} */`;

function ignoreCircularDependencies({ code, message }) {
    if (code !== 'CIRCULAR_DEPENDENCY') {
        throw new Error(message);
    }
}

function rollupFeaturesPlugin() {
    return {
        name: 'rollup-plugin-lwc-features',
        transform(source) {
            return babel.transform(source, {
                plugins: [babelFeaturesPlugin],
            }).code;
        },
    };
}

function rollupConfigDom({ format = 'es' } = {}) {
    return {
        input: path.resolve(__dirname, '../../src/engine-dom/index.ts'),
        onwarn: ignoreCircularDependencies,
        output: {
            name: 'LWC',
            file: path.join(targetDirectory, `engine${format === 'cjs' ? '.cjs' : ''}.js`),
            format,
            banner: banner,
            footer: footer,
        },
        plugins: [
            nodeResolve({ only: [/^@lwc\//, 'observable-membrane'] }),
            rollupTypescriptPlugin({
                target: 'es2017',
                typescript,
                include: ['**/*.ts', '/**/node_modules/**/*.js', '*.ts', '/**/*.js'],
            }),
            rollupFeaturesPlugin(),
        ],
    };
}

function rollupConfigNode({ format = 'es' } = {}) {
    return {
        input: path.resolve(__dirname, '../../src/engine-node/index.ts'),
        onwarn: ignoreCircularDependencies,
        output: {
            name: 'LWC',
            file: path.join(targetDirectory, `engine-node${format === 'cjs' ? '.cjs' : ''}.js`),
            format,
            banner: banner,
            footer: footer,
        },
        plugins: [
            nodeResolve({ only: [/^@lwc\//, 'observable-membrane'] }),
            rollupTypescriptPlugin({
                target: 'es2017',
                typescript,
                include: ['**/*.ts', '/**/node_modules/**/*.js', '*.ts', '/**/*.js'],
            }),
            rollupFeaturesPlugin(),
        ],
    };
}

module.exports = [
    rollupConfigDom({ format: 'es' }),
    rollupConfigDom({ format: 'cjs' }),
    rollupConfigNode({ format: 'es' }),
    rollupConfigNode({ format: 'cjs' }),
];
