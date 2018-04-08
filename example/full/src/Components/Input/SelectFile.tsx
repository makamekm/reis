import * as React from 'react';

import { Modal } from '../Modal';
import { Popup } from '../Popup';
import { Icon } from '../Icon';

export type SelectFileSize = 'md' | 'xs' | 'lg' | 'sm';

export interface SelectFileProps {
    className?: string
    placeholder?: string
    size: SelectFileSize
    icon?: string
    addon?: string
    disabled?: boolean
    error?: boolean
    loading?: boolean
    accept?: string
    linkValue: {
        set(value: File): void
        get(): File
    }
}

export class SelectFile extends React.Component<SelectFileProps, {}> {

    loading: boolean = false

    render() {
        const {
            className,
            placeholder,
            size,
            icon,
            addon,
            disabled,
            error,
            loading,
            linkValue,
            ...props
        } = this.props;

        return (
            <div className={"form-row " + (this.props.className || '') + " form-row-" + this.props.size + (this.props.disabled ? ' disabled' : '') + (this.props.error ? ' error' : '')}>
                {this.props.icon ? <Icon name={this.props.icon} className="item text subsub pl-3 pr-3" style={{width: '1px'}}/> : null}
                {this.props.addon ? <span className="item text subsub pl-3 pr-3" style={{width: '1px'}}>{this.props.addon}</span> : null}
                <label className="file">
                    <Icon name="paperclip mr-d1"/>
                    <span className="placeholder">{this.props.placeholder || ''}</span>
                    {this.props.children}
                    <input disabled={this.props.disabled} accept={this.props.accept || 'image/jpeg,image/png'} type="file" onChange={({ target }) => {
                        if (!this.props.disabled) this.props.linkValue.set(target.files[0]);
                    }}/>
                </label>
                <span className="next"/>
            </div>
        )
    }
}