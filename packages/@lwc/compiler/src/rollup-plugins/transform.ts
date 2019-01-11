/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { getTransformer, FileTransformerResult } from '../transformers/transformer';

import { NormalizedCompilerOptions } from "../compiler/options";
import { MetadataCollector } from '../bundler/meta-collector';

export default function({ options, metadataCollector }: {
    options: NormalizedCompilerOptions;
    metadataCollector?: MetadataCollector
}) {
    return {
        name: "lwc-file-transform",
        async transform(src: string, id: string): Promise<FileTransformerResult> {
            const transform = getTransformer(id);
            return await transform(
                src,
                id,
                options,
                metadataCollector,
            );
        }
    };
}