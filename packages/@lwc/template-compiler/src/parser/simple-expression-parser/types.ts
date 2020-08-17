/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export interface ASTIdentifier {
    type: 'Identifier';
    name: string;
}

export interface ASTMemberExpression {
    type: 'MemberExpression';
    object: ASTExpression;
    property: ASTIdentifier;
}

export type ASTExpression = ASTIdentifier | ASTMemberExpression;
