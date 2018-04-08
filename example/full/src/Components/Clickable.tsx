import * as React from 'react';

export type ClickableProps = {
    className?: string
    disabled?: boolean
    style?: React.CSSProperties
    onClick?(e?: React.MouseEvent<HTMLElement>): Promise<void>
    type?: any
    href?: string
}

export class Clickable extends React.Component<ClickableProps> {

    loading: boolean = false
    mounted: boolean = false

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    render() {
        const {
            className,
            disabled,
            onClick,
            ...props
        } = this.props;

        return React.createElement(this.props.type || 'div', {
            className: (this.props.className || '') + (this.loading ? ' loading' : '') + (this.props.disabled ? ' disabled' : ''),
            tabIndex: 0,
            onClick: async e => {
                e.preventDefault();
                if (!this.loading && !this.props.disabled) {
                    this.loading = true;
                    if (this.mounted) this.forceUpdate();
                    if (this.props.onClick) await this.props.onClick(e);
                    this.loading = false;
                    if (this.mounted) this.forceUpdate();
                }
            },
            ...props
        }, this.props.children);
    }
}