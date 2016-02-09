export enum ItemType {
    Interface = 'Interface' as any,
    UnionType = 'UnionType' as any,
    IntersectionType = 'IntersectionType' as any,
    TypeLiteral = 'TypeLiteral' as any,
    PropertySignature = 'PropertySignature' as any,
    PropertyDeclaration = 'PropertyDeclaration' as any,
    TypeParameter = 'TypeParameter' as any,
    HeritageClause = 'HeritageClause' as any,
    ExpressionWithTypeArguments = 'ExpressionWithTypeArguments' as any,
    LeftHandSideExpression = 'LeftHandSideExpression' as any,
    IndexSignature = 'IndexSignature' as any,
    Parameter = 'Parameter' as any,
    CallSignature = 'CallSignature' as any,
    Signature = 'Signature' as any,
    TypeReference = 'TypeReference' as any,
    MethodSignature = 'MethodSignature' as any,
    FunctionType = 'FunctionType' as any,
    Class = 'Class' as any,
    MethodDeclaration = 'MethodDeclaration' as any,
    ConstructorDeclaration = 'ConstructorDeclaration' as any,
    GetAccessorDeclaration = 'GetAccessorDeclaration' as any,
    SetAccessorDeclaration = 'SetAccessorDeclaration' as any,
}

export interface Item {
    id?: string;
    name?: string;
    comment?: string;
    itemType?: ItemType;
}
