import * as React from 'react'
import { TypePre } from '.'
import { IndexedAccessReflection } from '@tygen/reflector'
import { PrettyCode } from '../prettier'

export class IndexedAccessPre extends PrettyCode<{ reflection: IndexedAccessReflection }> {
	render() {
		const { reflection } = this.props
		return (
			<React.Fragment>
				<TypePre reflection={reflection.objectType} />
				{'['}
				<TypePre reflection={reflection.indexType} />
				{']'}
			</React.Fragment>
		)
	}
}