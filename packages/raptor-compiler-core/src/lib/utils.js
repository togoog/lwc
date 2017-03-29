import { extname, normalize, join, sep, basename, dirname } from 'path';
import { MODES } from './constants';
import fs from 'fs';

export { basename, dirname, join, extname };

export const ltng_format = 'aura';
export const DEFAULT_NS = 'x';

export function normalizeEntryPath(path: string) {
    path = normalize(path.replace(/\/$/, ''));
    return extname(path) ? path : join(path, path.split(sep).pop() + '.js' );
}

export function fileParts(filePath: string) {
    const filename = basename(filePath);
    const rawExt = extname(filename);
    const ext = rawExt.substring(1);
    const name = basename(filename, rawExt);
    return { name: name, ext: ext };
}

export function getSource(path: string, sources: any) {
    sources = sources || {};
    const filename = basename(path);
    const src = sources[filename] || sources[path];
    if (src) {
        return src;
    }
    return fs.readFileSync(path, 'utf8').toString();
}

/*
* Names and namespace mapping:
* 'foo.js' => ns: default, name: foo
* '.../foo/foo.js' => ns: default, name: foo
* '.../myns/foo/foo.js' => ns: myns, name: foo
* '.../myns/components/foo/foo.js' => ns: myns, name: foo
*/
export function getQualifiedName(path: string, mapNamespaceFromPath: boolean) {
    const parts = path.split('/');
    const name = basename(parts.pop(), '.js');
    let ns = name.indexOf('-') === -1 ? DEFAULT_NS : null;
    let tmpNs = parts.pop();

    if (tmpNs === name) {
        tmpNs = parts.pop();
    }
    // If mapping folder structure override namespace
    if (tmpNs && mapNamespaceFromPath) {
        ns = tmpNs === 'components' ? parts.pop() : tmpNs;
    }

    return {
        componentName : name,
        componentNamespace : ns
    };
}

export function normalizeOptions(options: any) {
    const entry = options.entry;
    const qName = getQualifiedName(entry, options.mapNamespaceFromPath);

    options.componentNamespace = options.componentNamespace || qName.componentNamespace;
    options.componentName = options.componentName || qName.componentName;
    options.bundle = options.bundle !== undefined ? options.bundle : true;
    options.mode = options.mode || MODES.DEV;
    options.sources = options.sources || {};

    options.$metadata = {};

    return options;
}

export function mergeMetadata (metadata: any) {
    const templateUsedIds = [];
    const templateDependencies = [];
    const classDependencies = [];
    const definedSlots = [];
    for (let i in metadata) {
        templateUsedIds.push(...metadata[i].templateUsedIds || []);
        templateDependencies.push(...metadata[i].templateDependencies || []);
        classDependencies.push(...metadata[i].classDependencies || []);
        definedSlots.push(...metadata[i].definedSlots || []);
    }

    return { bundleDependencies: classDependencies.concat(templateDependencies) };
}

export function transformAmdToLtng (code: string) {
    return code.replace('define', '$A.componentService.addModule');
}
