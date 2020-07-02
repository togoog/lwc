/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import fs from 'fs';
import path from 'path';

import { Plugin } from 'rollup';
import { createFilter, addExtension, FilterPattern } from '@rollup/pluginutils';
import { resolveModule, ModuleRecord } from '@lwc/module-resolver';
import { transform, StylesheetConfig, DynamicComponentConfig } from '@lwc/compiler';

export interface RollupLwcOptions {
    include?: FilterPattern;
    exclude?: FilterPattern;
    rootDir?: string;
    modules?: ModuleRecord[];
    stylesheetConfig?: StylesheetConfig;
    experimentalDynamicComponent?: DynamicComponentConfig;
    sourcemap?: boolean;
}

export const DEFAULT_MODULES = [
    { npm: '@lwc/engine' },
    { npm: '@lwc/synthetic-shadow' },
    { npm: '@lwc/wire-service' },
];

export const IMPLICIT_DEFAULT_HTML_PATH = '@lwc/resources/empty_html.js';
export const EMPTY_IMPLICIT_HTML_CONTENT = 'export default void 0';

function isImplicitHTMLImport(importee: string, importer: string): boolean {
    return (
        path.extname(importer) === '.js' &&
        path.extname(importee) === '.html' &&
        path.dirname(importer) === path.dirname(importee) &&
        path.basename(importer, '.js') === path.basename(importee, '.html')
    );
}

function isMixingJsAndTs(importerExt: string, importeeExt: string): boolean {
    return (
        (importerExt === '.js' && importeeExt === '.ts') ||
        (importerExt === '.ts' && importeeExt === '.js')
    );
}

function extractModuleInfo(id: string): { name: string; namespace: string } {
    const parts = path.dirname(id).split(path.sep);

    return {
        name: parts[parts.length - 1],
        namespace: parts[parts.length - 2],
    };
}

export default function rollupLwcCompiler(options: RollupLwcOptions = {}): Plugin {
    let { rootDir, modules = [] } = options;
    const filter = createFilter(options.include, options.exclude);

    return {
        name: '@lwc/rollup-plugin',

        buildStart({ input }) {
            if (!rootDir) {
                if (typeof input === 'string') {
                    rootDir = path.dirname(input);
                } else {
                    throw new Error(
                        `@lwc/rollup-plugin: options.rootDir can't be implicitly resolved based because multiple inputs are passed to rollup.`
                    );
                }
            }

            modules = [...modules, ...DEFAULT_MODULES, { dir: rootDir }];
        },

        resolveId(importee, importer) {
            // Normalize relative import to absolute import
            if (importee.startsWith('.') && importer) {
                const importerExt = path.extname(importer);
                const ext = path.extname(importee) || importerExt;

                // we don't currently support mixing .js and .ts
                if (isMixingJsAndTs(importerExt, ext)) {
                    throw new Error(
                        `@lwc/rollup-plugin: Importing a ${ext} file into a ${importerExt} is not supported.`
                    );
                }

                const normalizedPath = path.resolve(path.dirname(importer), importee);
                const absPath = addExtension(normalizedPath, ext);

                if (isImplicitHTMLImport(normalizedPath, importer) && !fs.existsSync(absPath)) {
                    return IMPLICIT_DEFAULT_HTML_PATH;
                }

                return addExtension(normalizedPath, ext);
            } else if (importer) {
                try {
                    return resolveModule(importee, importer, {
                        modules: modules!,
                        rootDir: rootDir!,
                    }).entry;
                } catch (err) {
                    if (err.code !== 'NO_LWC_MODULE_FOUND') {
                        throw err;
                    }
                }
            }
        },

        load(id) {
            if (id === IMPLICIT_DEFAULT_HTML_PATH) {
                return EMPTY_IMPLICIT_HTML_CONTENT;
            }

            const exists = fs.existsSync(id);
            const isCSS = path.extname(id) === '.css';

            if (!exists && isCSS) {
                return '';
            }
        },

        async transform(src, id) {
            if (!filter(id)) {
                return;
            }

            const { name, namespace } = extractModuleInfo(id);
            const { code, map } = await transform(src, id, {
                name,
                namespace,
                outputConfig: {
                    sourcemap: options.sourcemap,
                },
                stylesheetConfig: options.stylesheetConfig,
                experimentalDynamicComponent: options.experimentalDynamicComponent,
            });

            return { code, map };
        },
    };
}
