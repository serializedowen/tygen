import * as ts from 'typescript'

import { visitType } from '../index'
import { TypeKind, TypeReflection } from '../reflection'
import { ReflectionKind, createLink } from '../../reflection'
import { Context } from '../../../context'
import { TypeReferenceReflection } from './reflection'
import { visitSymbol } from '../../visitor'

export function visitReference(type: ts.TypeReference, ctx: Context): TypeReferenceReflection {
	const reflection: TypeReferenceReflection = {
		kind: ReflectionKind.Type,
		typeKind: TypeKind.TypeReference,
		target: undefined as any
	}

	ctx.registerType(type, reflection)

	if (type.symbol) {
		reflection.target = createLink(visitSymbol(type.symbol, ctx)!) as TypeReflection
	} else {
		reflection.target = createLink(
			visitType(type.target, ctx, { skipReference: type.target === type })!
		) as TypeReflection
	}

	reflection.typeArguments =
		type.typeArguments && type.typeArguments.map(arg => createLink(visitType(arg, ctx)))

	return reflection
}