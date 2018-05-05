import * as React from 'react';

export type ClickableProps = {
    id?: string
    className?: string
    disabled?: boolean
    style?: React.CSSProperties
    onClick?(e?: React.MouseEvent<HTMLElement>): Promise<void>
    type?: any
    href?: string
    onMount?(): void
    onUnmount?(): void
    onMouseEnter?(e): void
    onMouseLeave?(e): void
}

export class Clickable extends React.Component<ClickableProps> {

    loading: boolean = false
    mounted: boolean = false

    componentDidMount() {
        this.mounted = true;
        this.props.onMount && this.props.onMount();
    }

    componentWillUnmount() {
        this.mounted = false;
        this.props.onUnmount && this.props.onUnmount();
    }

    render() {
        const {
            className,
            disabled,
            onClick,
            onMount,
            onUnmount,
            ...props
        } = this.props;

        const doAction = async e => {
            e.preventDefault();
            if (!this.loading && !this.props.disabled) {
                this.loading = true;
                if (this.mounted) this.forceUpdate();
                if (this.props.onClick) await this.props.onClick(e);
                this.loading = false;
                if (this.mounted) this.forceUpdate();
            }
        }

        return React.createElement(this.props.type || 'div', {
            className: (this.props.className || '') + (this.loading ? ' loading' : '') + (this.props.disabled ? ' disabled' : ''),
            tabIndex: 0,
            onKeyDown: async (e) => {
                if (e.keyCode == 13) {
                    await doAction(e);
                }
            },
            onClick: async e => await doAction(e),
            ...props
        }, this.props.children);
    }
}