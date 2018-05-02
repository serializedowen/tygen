import * as React from 'react'
import cn from 'classnames'

import { Reflection, ReflectionKind } from '@docscript/reflector/src/reflection'
import styled from 'styled-components'
import { BaseView } from './view'
import { parseId } from './helpers'

export function hrefFromId(id: string, relativeId?: string) {
	const parts = (relativeId ? id.replace(relativeId, '') : id).split(/::|->/)
	let last = parts[parts.length - 1]
	if (last[0] === '/') {
		last = last.slice(1)
	}

	const ident = parseId(id)
	let href = `/${ident.pkg}/${ident.version}`
	if (ident.module) {
		href += '/' + ident.module.join('/')
	}

	if (ident.items) {
		let itemsPart = ''
		let file = false

		for (const item of ident.items.reverse()) {
			if (!file && item.file) {
				if (itemsPart.length > 0) {
					itemsPart = '#' + itemsPart
				}
				file = true
			}

			itemsPart =
				item.name +
				(itemsPart.length > 0 && itemsPart['0'] !== '#' ? '/' + itemsPart : itemsPart)
		}

		href += '/' + itemsPart
	}

	return {
		name: last.replace(/[<>]/g, ''),
		href
	}
}

export function documentIdFromId(id: string): string | undefined {
	const ident = parseId(id)

	if (ident.items) {
		let itemsPart = ''
		for (const item of ident.items.reverse()) {
			if (item.file && itemsPart.length > 0) {
				return itemsPart
			}

			itemsPart =
				item.name +
				(itemsPart.length > 0 && itemsPart['0'] !== '#' ? '/' + itemsPart : itemsPart)
		}
	}
}

function createLink(reflection: Reflection, relativeId?: string): { name: string; href: string } {
	switch (reflection.kind) {
		case ReflectionKind.Link:
			return hrefFromId(reflection.target, relativeId)
	}

	if (reflection.id) {
		return hrefFromId(reflection.id, relativeId)
	}

	throw new Error(`Unsupported ${JSON.stringify(reflection, null, 4)}`)
}

export class RefLink extends BaseView<Reflection, { relativeId?: string; phantom?: boolean }> {
	render() {
		const { relativeId, phantom } = this.props
		const { name, href } = createLink(this.props.reflection, relativeId)
		return (
			<RefLinkBody href={href} className={cn({ phantom })}>
				{name}
			</RefLinkBody>
		)
	}
}

const RefLinkBody = styled.a`
	overflow: hidden;
	text-overflow: ellipsis;

	&.phantom {
		text-decoration: none;
	}
`