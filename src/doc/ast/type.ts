import {
    SyntaxKind,
    NodeArray,
    TypeNode,
    TypeLiteralNode,
    UnionTypeNode,
    IntersectionTypeNode,
    Type,
    UnionType,
    IntersectionType,
    TypeElement,
    PropertySignature,
    TypeParameterDeclaration,
    ExpressionWithTypeArguments,
    LeftHandSideExpression,
    IndexSignatureDeclaration,
    ParameterDeclaration,
    CallSignatureDeclaration,
    TypeReferenceNode,
    TypeReference,
    MethodSignature,
    SignatureDeclaration
} from 'typescript';

import {
    CoreType,
    getCoreType
} from '../tools';

import { Context } from '../index';
import { Item, RefType } from '../items';

export interface PropertySignatureReflection extends Item {
    name: string;
    optional: boolean;
    type: TypeReflection;
}

export function isPropertySignatureReflection(item: Item): item is PropertySignatureReflection {
    return item.refType == RefType.PropertySignature;
}

export function isPropertySignature(node: TypeElement): node is PropertySignature {
    return node.kind == SyntaxKind.PropertySignature;
}

export function isCallSignature(node: TypeElement): node is CallSignatureDeclaration {
    return node.kind == SyntaxKind.CallSignature;
}

export function isTypeReferenceNode(node: TypeNode): node is TypeReferenceNode {
    return node.kind == SyntaxKind.TypeReference;
}

export function isMethodSignature(node: TypeElement): node is MethodSignature {
    return node.kind == SyntaxKind.MethodSignature;
}

export function visitTypeElements(
    members: NodeArray<TypeElement>,
    ctx: Context
): Item[] {
    let reflections: Item[] = [];

    for (let [, member] of members.entries()) {
        if (isPropertySignature(member)) {
            reflections.push({
                refType: RefType.PropertySignature,
                name: member.name.getText(),
                optional: !!member.questionToken,
                type: visitTypeNode(member.type, ctx)
            } as PropertySignatureReflection);
        } else if (isIndexSignatureDeclaration(member)) {
            reflections.push(
                visitIndexSignature(member, ctx)
            );
        } else if (isCallSignature(member)) {
            reflections.push(
                visitCallSignature(member, ctx)
            );
        } else if (isMethodSignature(member)) {
            reflections.push(
                visitMethodSignature(member, ctx)
            );
        }
     }

    return reflections;
}

export function isIndexSignatureDeclaration(node: TypeElement): node is IndexSignatureDeclaration {
    return node.kind == SyntaxKind.IndexSignature;
}

export interface TypeReflection extends Item {
    coreType: CoreType;
}

export interface TypeLiteralReflection extends TypeReflection {
    members: Item[];
}

export function isTypeLiteralReflection(item: Item): item is TypeLiteralReflection {
    return  item.refType == RefType.TypeLiteral;
}

export function isTypeLiteral(node: TypeNode): node is TypeLiteralNode {
    return node.kind == SyntaxKind.TypeLiteral;
}

export function isUnionTypeNode(node: TypeNode): node is UnionTypeNode {
    return node.kind == SyntaxKind.UnionType;
}

export function isIntersectionTypeNode(node: TypeNode): node is IntersectionTypeNode {
    return node.kind == SyntaxKind.IntersectionType;
}

export function visitTypeNode(node: TypeNode, ctx: Context): TypeReflection {
    let type = ctx.checker.getTypeAtLocation(node);

    if (isTypeLiteral(node)) {
        return visitTypeLiteral(node, type, ctx);
    }

    if (isUnionTypeNode(node)) {
        return visitUnionType(node, type as UnionType, ctx);
    }

    if (isIntersectionTypeNode(node)) {
        return visitIntersectionType(node, type as IntersectionType, ctx);
    }

    if (isTypeReferenceNode(node)) {
        return visitTypeReference(node, type as TypeReference, ctx);
    }

    return visitType(type, ctx);
}

export function visitType(type: Type, ctx: Context): TypeReflection {
    return {
        id: ctx.id(type),
        coreType: getCoreType(type)
    };
}

export function visitTypeLiteral(node: TypeLiteralNode, type: Type, ctx: Context): TypeLiteralReflection {
    // TODO regiser inline types globally?

    let reflection = visitType(type, ctx);
    return Object.assign(reflection, {
        refType: RefType.TypeLiteral,
        members: visitTypeElements(
            node.members,
            ctx
        )
    });
}

export interface IntersectionTypeReflection extends TypeReflection {
    types: TypeReflection[];
}

export function isIntersectionTypeReflection(item: Item): item is IntersectionTypeReflection {
    return item.refType == RefType.IntersectionType;
}

export interface UnionTypeReflection extends IntersectionTypeReflection {
    // The same as intersection
}

export function isUnionTypeReflection(item: Item): item is UnionTypeReflection {
    return item.refType == RefType.UnionType;
}

export function visitIntersectionType(
    node: IntersectionTypeNode,
    type: IntersectionType,
    ctx: Context
): IntersectionTypeReflection {
    // TODO regiser inline types globally?

    let reflection = visitType(type, ctx);

    return Object.assign(reflection, {
        refType: RefType.IntersectionType,
        types: node.types.map((type) => visitTypeNode(type, ctx))
    });
}

export function visitUnionType(
    node: UnionTypeNode,
    type: Type,
    ctx: Context
): UnionTypeReflection {
    // TODO regiser inline types globally?

    let reflection = visitType(type, ctx);

    return Object.assign(reflection, {
        refType: RefType.UnionType,
        types: node.types.map((type) => visitTypeNode(type, ctx))
    });
}

interface TypeReferenceReflection extends TypeReflection {
    typeName: string;
    targetType: TypeReflection;
    typeArguments: TypeReflection[];
}

export function isTypeReferenceReflection(item: Item): item is TypeReferenceReflection {
    return item.refType == RefType.TypeReference;
}

export function visitTypeReference(
    node: TypeReferenceNode,
    type: TypeReference,
    ctx: Context
): TypeReferenceReflection {
    let targetType = type.target && visitType(type.target, ctx);
    let reflection = visitType(type, ctx);

    return Object.assign(reflection, {
        refType: RefType.TypeReference,
        typeName: node.typeName.getText(),
        targetType,
        typeArguments: type.typeArguments &&
            node.typeArguments.map(ta => visitTypeNode(ta, ctx))
    });
}

export interface TypeParameterReflection extends Item {
    constraint: TypeReflection;
}

export function isTypeParameterReflection(item: Item): item is TypeParameterReflection {
    return item.refType == RefType.TypeParameter;
}

export function visitTypeParameter(decl: TypeParameterDeclaration, ctx: Context): TypeParameterReflection {
    let type = ctx.checker.getTypeAtLocation(decl);

    return {
        id: ctx.id(type),
        refType: RefType.TypeParameter,
        name: decl.name.text,
        constraint: decl.constraint && visitTypeNode(decl.constraint, ctx)
    };
}

export interface ExpressionWithTypeArgumentsReflection extends Item {
    expression: LeftHandSideExpressionReflection;
    typeArguments: TypeReflection[];
}

export function visitExpressionWithTypeArguments(expr: ExpressionWithTypeArguments, ctx: Context) {
    return {
        refType: RefType.ExpressionWithTypeArguments,
        typeArguments: expr.typeArguments &&
            expr.typeArguments.map(ta => visitTypeNode(ta, ctx)),
        expression: visitLeftHandSideExpression(expr.expression, ctx)
    };
}

export interface LeftHandSideExpressionReflection extends Item {
    type: TypeReflection;
}

export function visitLeftHandSideExpression(
    expr: LeftHandSideExpression,
    ctx: Context
): LeftHandSideExpressionReflection {
    let type = ctx.checker.getTypeAtLocation(expr);
    return {
        refType: RefType.LeftHandSideExpression,
        type: visitType(type, ctx)
    };
}

export interface ParameterReflection extends Item {
    name: string;
    optional: boolean;
    spread: boolean;
    type: TypeReflection;
}

export function isParameterReflection(item: Item): item is ParameterReflection {
    return item.refType == RefType.Parameter;
}

export function visitParameter(
    param: ParameterDeclaration,
    ctx: Context
): ParameterReflection {
    return {
        refType: RefType.Parameter,
        name: param.name.getText(),
        optional: !!param.questionToken,
        spread: !!param.dotDotDotToken,
        type: visitTypeNode(param.type, ctx)
    } as ParameterReflection;
}

export interface IndexSignatureReflection extends SignatureReflection {

}

export function isIndexSignatureReflection(item: Item): item is IndexSignatureReflection {
    return item.refType == RefType.IndexSignature;
}

export function visitIndexSignature(
    sig: IndexSignatureDeclaration,
    ctx: Context
): IndexSignatureReflection {
    return {
        refType: RefType.IndexSignature,
        parameters: sig.parameters &&
            sig.parameters.map(p => visitParameter(p, ctx)),
        typeParameters: null,
        type: visitTypeNode(sig.type, ctx)
    } as IndexSignatureReflection;
}

export interface SignatureReflection extends Item {
    typeParameters: TypeParameterReflection[];
    parameters: ParameterReflection[];
    type: TypeReflection;
}

export function visitSignature(sig: SignatureDeclaration, ctx: Context): SignatureReflection {
    return {
        refType: RefType.Signature,
        name: sig.name && sig.name.getText(),
        typeParameters: sig.typeParameters &&
            sig.typeParameters.map(tp => visitTypeParameter(tp, ctx)),
        parameters: sig.parameters &&
            sig.parameters.map(p => visitParameter(p, ctx)),
        type: sig.type &&
            visitTypeNode(sig.type, ctx)
    } as SignatureReflection;
}

export interface CallSignatureReflection extends SignatureReflection {
}

export function isCallSignatureReflection(item: Item): item is IndexSignatureReflection {
    return item.refType == RefType.CallSignature;
}

export function visitCallSignature(
    sig: CallSignatureDeclaration,
    ctx: Context
): CallSignatureReflection {
    return Object.assign(visitSignature(sig, ctx), {
        refType: RefType.CallSignature
    });
}

export interface MethodSignatureReflection extends SignatureReflection {

}

export function isMethodSignatureReflection(item: Item): item is MethodSignatureReflection {
    return item.refType == RefType.MethodSignature;
}

export function visitMethodSignature(
    sig: MethodSignature,
    ctx: Context
): MethodSignatureReflection {
    return Object.assign(visitSignature(sig, ctx), {
        refType: RefType.MethodSignature
    });
}