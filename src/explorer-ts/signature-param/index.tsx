import * as React from 'react';
import * as theme from '../../explorer/components/theme';

import {
    ParameterReflection
} from '../../doc/ast/type';

import Type from '../type';

require('./index.css');
const block = theme.block('ts-signature-param');

export interface SignatureParamProps extends React.CommonProps {
    htmlProps?: React.HTMLAttributes;
    param: ParameterReflection;
}

export interface SignatureParamState {}

export default class SignatureParam extends React.Component<SignatureParamProps, SignatureParamState> {
    static contextTypes = theme.themeContext;

    getClassName() {
        return block(theme.resolveTheme(this)).mix(this.props.className);
    }

    render() {
        let param = this.props.param;
        return (
            <span className={ this.getClassName() }>
                { param.spread ? '...' : '' }
                { param.name }
                { param.optional ? '?' : '' }
                :
                <Type className={ block('type') } type={ param.type }/>
            </span>
        );
    }
}
