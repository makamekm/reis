import * as React from 'react';

import { Clickable } from '../Clickable';

export type TagSize = 'md' | 'xs' | 'lg' | 'sm';
export type TagType = 'bars' | 'close';

export class Tag extends React.Component<{
    className?: string
    size: TagSize
    type?: TagType
    disabled?: boolean
    unactive?: boolean
    onClick?(e?: React.MouseEvent<HTMLDivElement>): Promise<void>
} & any, {}> {

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
            <Clickable className={(this.props.className || '') + " tag tag-" + this.props.size + (this.props.unactive ? ' unactive' : '') + (this.props.onClick ? ' item' : '')} onClick={this.props.onClick} disabled={this.props.disabled} {...props}>
                <span>{this.props.children}</span>
                {this.props.type && <span className={this.props.type}/>}
            </Clickable>
        )
    }
}