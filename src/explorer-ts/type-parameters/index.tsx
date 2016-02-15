import * as React from 'react';
import * as theme from '../../explorer/components/theme';

import {
    TypeParameterReflection
} from '../../doc/ast/type';

import Brackets from '../brackets';
import TypeParameter from '../type-parameter';

require('./index.css');
const block = theme.block('ts-type-parameters');

export interface TypeParametersProps extends React.CommonProps {
    htmlProps?: React.HTMLAttributes;
    typeParameters: TypeParameterReflection[];
}

export interface TypeParametersState {}

export default class TypeParameters extends React.Component<TypeParametersProps, TypeParametersState> {
    static contextTypes = theme.themeContext;

    getClassName() {
        return block(theme.resolveTheme(this)).mix(this.props.className);
    }

    render() {
        let typeParameters = this.props.typeParameters;
        if (!typeParameters) {
            return null;
        }

        let result: React.ReactChild[] = [];

        typeParameters.forEach((typeParam, i) => {
            result.push(<TypeParameter typeParam={ typeParam } />);
            if (i < typeParameters.length - 1) {
                result.push(', ');
            }
        });

        return <Brackets>{ result }</Brackets>;
    }
}