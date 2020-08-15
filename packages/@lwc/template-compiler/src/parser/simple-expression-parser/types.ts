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