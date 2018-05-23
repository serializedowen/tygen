import React from 'react'
import path from 'path'
import { withContext, ViewSettings } from '../view'
import styled from 'styled-components'
import { NotScrollable } from './search'
import { hrefFromId } from '../ref-link'

import { InventoryReflection } from '@docscript/reflector/src/reflection/inventory/reflection'

export interface InventoryProviderState {
	inventory?: InventoryReflection
}

@withContext
export class InventoryProvider extends React.Component<
	{
		settings?: ViewSettings
		children: (inventory?: InventoryReflection) => React.ReactNode
	},
	InventoryProviderState
> {
	state: InventoryProviderState = {}

	componentDidMount() {
		console.log(this.props.settings!.contextRoot)
		fetch(path.join(this.props.settings!.contextRoot, 'index.json'))
			.then(res => res.json())
			.then((inventory: InventoryReflection) => {
				this.setState({ inventory })
			})
	}

	render() {
		return this.props.children(this.state.inventory)
	}
}

export interface PackagesState {
	open?: boolean
}

export class PackagesNav extends React.Component<
	{
		pkg?: string
		version?: string
		inventory?: InventoryReflection
	},
	PackagesState
> {
	state: PackagesState = {}
	render() {
		const { inventory, pkg, version } = this.props
		return (
			<InventoryBody onClick={this.onClick}>
				<Package>
					{pkg} {version}
				</Package>
				{this.state.open &&
					inventory && (
						<InventoryWindow>
							<NotScrollable />
							<PackageList inventory={inventory} />
						</InventoryWindow>
					)}
			</InventoryBody>
		)
	}

	onClick = () => {
		if (!this.props.inventory) {
			return
		}

		this.setState(state => ({
			open: !state.open
		}))
	}
}

export class PackageList extends React.Component<{ inventory: InventoryReflection }> {
	render() {
		const { inventory } = this.props
		return (
			<div>
				{inventory.packages.map(pkg => {
					return (
						<PackageRow key={pkg.name}>
							<PackageRowName
								href={hrefFromId(`${pkg.name}->${pkg.versions[0]}`).href}>
								{pkg.name}
							</PackageRowName>
							{pkg.versions.length > 1 && (
								<PackageRowVersions>
									{pkg.versions.map(ver => {
										return (
											<PackageRowVersion
												key={ver}
												href={hrefFromId(`${pkg.name}->${ver}`).href}>
												{ver}
											</PackageRowVersion>
										)
									})}
								</PackageRowVersions>
							)}
						</PackageRow>
					)
				})}
			</div>
		)
	}
}

const PackageRow = styled.div`
	padding: 5px 10px;
	&:nth-child(even) {
		background-color: #f0f0f0;
	}
`
const PackageRowName = styled.a`
	font-weight: bold;
	font-size: 14px;
	display: block;
`

const PackageRowVersions = styled.div`
	margin-top: 10px;
`

const PackageRowVersion = styled.a`
	font-size: 12px;
`

const InventoryBody = styled.div`
	display: flex;
	cursor: pointer;
	position: relative;
	&:hover {
		background-color: #eee;
	}
`

const InventoryWindow = styled.div`
	left: -1px;
	position: absolute;
	top: 40px;
	height: calc(100vh - 40px);
	min-width: 100%;
	background-color: #fff;
	z-index: 2;
	overflow: scroll;
	box-sizing: border-box;
	box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.08);
`

const Package = styled.div`
	border-right: 1px solid #ccc;
	padding: 0 10px;
	display: flex;
	align-items: center;
	font-size: 14px;
	font-weight: bold;
	color: #555;
`