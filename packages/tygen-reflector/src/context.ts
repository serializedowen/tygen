import ts from 'typescript'

import { Generator, GeneratorOptions } from './generator'
import { Reflection, ReflectionKind } from './reflection/reflection'
import { createLink, ExcludedFlag, ExcludedReflection, NotLinkable } from './reflection/utils'
import { TypeReflection } from './reflection/_type/reflection'
import { stringifyId } from './reflection/identifier'

function getSymbolDeclarations(symbol: ts.Symbol): ts.Declaration[] | undefined {
	while (symbol) {
		if (symbol.declarations) {
			return symbol.declarations
		}
		symbol = (symbol as any).parent
	}
}

export class Context {
	generator: Generator
	program: ts.Program
	checker: ts.TypeChecker
	options: GeneratorOptions

	visitedReflections = new Set<ts.Symbol>()

	reflectionById = new Map<string, Reflection>()

	reflectionBySymbol = new Map<ts.Symbol, Reflection>()
	symbolByReflection = new Map<Reflection, ts.Symbol>()

	reflectionByType = new Map<ts.Type, TypeReflection>()
	typeByReflection = new Map<TypeReflection, ts.Type>()

	constructor(generator: Generator) {
		this.options = generator.options
		this.generator = generator
		this.program = generator.program
		this.checker = generator.program.getTypeChecker()
	}

	registerType(type: ts.Type, reflection: TypeReflection) {
		this.reflectionByType.set(type, reflection)
		this.typeByReflection.set(reflection, type)
	}

	registerSymbol(symbol: ts.Symbol, reflection: Reflection) {
		// Exclude some reflections. This code is here because
		// we need to mark symbol as excluded BEFORE staring to
		// make links to it

		const declarations = getSymbolDeclarations(symbol)
		let excluded = declarations
			? declarations
					.map(d => d.getSourceFile())
					.every(s => !this.generator.shouldFileBeIncluded(s))
			: true

		if (excluded) {
			;(reflection as ExcludedReflection)[ExcludedFlag] = true
			if (!this.options.alwaysLink) {
				;(reflection as ExcludedReflection)[NotLinkable] = true
			}
		}

		this.reflectionBySymbol.set(symbol, reflection)
		this.symbolByReflection.set(reflection, symbol)
		this.registerReflectionWithoutSymbol(reflection, symbol)
	}

	registerReflectionWithoutSymbol(reflection: Reflection, symbol?: ts.Symbol) {
		if (reflection.id) {
			const stringId = stringifyId(reflection.id)
			const current = this.reflectionById.get(stringId)
			if (current) {
				let conflict = this.symbolByReflection.get(current)!
				if (!symbol || !areSymbolsEqual(symbol, conflict)) {
					console.error(`Duplicate ID for symbol`, reflection.id)
					return
				}
			}
			this.reflectionById.set(stringId, reflection)
		}
	}

	registerRelatedModules() {
		this.symbolByReflection.forEach((symbol, reflection) => {
			if (symbol.declarations) {
				// Push a link to our interface to all modules that declare it
				symbol.declarations.forEach(decl => {
					let sourceFile = decl.getSourceFile()
					let module = this.generator.getFile(sourceFile.fileName)!
					if (module.reflection) {
						if (!module.reflection.exports) {
							module.reflection.exports = []
						}
						module.reflection.exports.push(createLink(reflection))
					}
				})
			}
		})
	}
}

function areSymbolsEqual(a: ts.Symbol, b: ts.Symbol) {
	if (a === b) {
		return true
	}

	if (a.declarations && b.declarations && a.declarations[0] === b.declarations[0]) {
		return true
	}

	return false
}
