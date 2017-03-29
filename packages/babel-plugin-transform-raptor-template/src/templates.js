import {API_PARAM , CMP_INSTANCE, SLOT_SET, TMPL_FUNCTION_NAME, CONTEXT } from './constants';
import { template } from 'babel-core';

 export const moduleExports = template(`
export default function ${TMPL_FUNCTION_NAME}(${API_PARAM}, ${CMP_INSTANCE}, ${SLOT_SET}, ${CONTEXT}) {
    HOISTED_IDS
    const m = ${CONTEXT}.memoized || (${CONTEXT}.memoized = {});
    return STATEMENT;
}`, { sourceType: 'module' });

export const memoizeLookup = template(`m.ID || (m.ID = ID(${API_PARAM}, ${CMP_INSTANCE}))`);
export const memoizeFunction = template(`const ID = function (${API_PARAM}, ${CMP_INSTANCE}) { return STATEMENT; }`);
