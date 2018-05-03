import * as React from 'react';

import { Icon } from '../Icon';

export type InputSize = 'md' | 'xs' | 'lg' | 'sm';
export type InputType = 'text' | 'password' | 'email';

export interface InputProps {
    className?: string
    placeholder?: string
    size?: InputSize
    type?: InputType
    icon?: string
    addon?: string
    disabled?: boolean
    error?: boolean
    loading?: boolean
    inverted?: boolean
    linkValue: {
        set(value: string): void
        get(): string
    }
    // onKeyUp?: React.KeyboardEventHandler<HTMLInputElement>
    onEnterKey?: (e: React.KeyboardEvent<HTMLInputElement>) => Promise<void>
    onBlur?: (e) => void
    onFocus?: (e) => void
    onMouseEnter?: (e) => void
    onMouseLeave?: (e) => void
}

export class Input extends React.Component<InputProps, {}> {

    loading: boolean = false

    render() {
        const {
            className,
            placeholder,
            size,
            type,
            icon,
            addon,
            disabled,
            error,
            loading,
            linkValue,
            inverted,
            onEnterKey,
            onBlur,
            onFocus,
            onMouseEnter,
            onMouseLeave
        } = this.props;

        return (
            <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} className={"form-row " + (this.props.className || '') + " form-row-" + this.props.size + (this.props.disabled ? ' disabled' : '') + (this.loading || this.props.loading ? ' loading' : '') + (this.props.error ? ' error' : '')}>
                {this.props.icon ? <Icon name={this.props.icon} className="item text subsub pl-3 pr-3" style={{width: '1px'}}/> : null}
                {this.props.addon ? <span className="item text subsub pl-3 pr-3" style={{width: '1px'}}>{this.props.addon}</span> : null}
                <input onBlur={onBlur} onFocus={onFocus} disabled={this.props.disabled} type={this.props.type} placeholder={this.props.placeholder || ''} value={this.props.linkValue.get() || ''} onChange={e => !this.props.disabled && this.props.linkValue.set(e.target.value)} onKeyUp={async e => {
                    if (onEnterKey && e.keyCode == 13 && !this.loading) {
                        this.loading = true;
                        this.forceUpdate();

                        await onEnterKey(e);

                        this.loading = false;
                        this.forceUpdate();
                    }
                }}/>
                {this.props.children}
                <div className="next"></div>
            </div>
        )
    }
}