import * as React from 'react';

import { Clickable, ClickableProps } from '../Clickable';

export type ButtonSize = 'md' | 'xxs' | 'xs' | 'lg' | 'sm';
export type ButtonType = 'default' | 'primary' | 'danger' | 'empty' | 'border' | 'white';

export class Button extends React.Component<{
    className?: string
    size?: ButtonSize
    type?: ButtonType
    disabled?: boolean
    unactive?: boolean
    onClick?(e?: React.MouseEvent<HTMLDivElement>): (Promise<void> | void)
    elementType?: any
    style?: React.CSSProperties
} & ClickableProps, {}> {

    loading: boolean = false

    render() {
        const {
            className,
            size,
            type,
            disabled,
            unactive,
            onClick,
            ...props
        } = this.props;

        return (
            <Clickable type={this.props.elementType} className={(this.props.className || '') + " btn btn-" + this.props.type + " btn-" + this.props.size + (this.props.unactive ? ' unactive' : '')} onClick={this.props.onClick} disabled={this.props.disabled} {...props}>
                {this.props.children}
            </Clickable>
        )
    }
}