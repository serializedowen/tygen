import * as React from 'react'

import { EnumReflection } from '@tygen/reflector'
import { PrettyCode } from './prettier'

export class EnumPre extends PrettyCode<{ reflection: EnumReflection }> {
	render() {
		const { reflection } = this.props
		return (
			<React.Fragment>
				enum {reflection.name} {'{'}
				{reflection.members &&
					reflection.members.map(member => {
						return (
							<React.Fragment>
								{member.name} = {JSON.stringify(member.value)},
							</React.Fragment>
						)
					})}
				{'}'}
			</React.Fragment>
		)
	}
}
