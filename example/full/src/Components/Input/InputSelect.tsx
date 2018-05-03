import * as React from 'react';

import { SelectItem } from './Select';
import { Popup, PopupScroll } from '../Popup';
import { Icon } from '../Icon';

export type InputSelectSize = 'md' | 'xs' | 'lg' | 'sm';
export type InputSelectType = 'text' | 'password' | 'email';

export class InputSelect extends React.Component<{
    className?: string
    placeholder?: string
    size?: InputSelectSize
    type?: InputSelectType
    icon?: string
    addon?: string
    disabled?: boolean
    error?: boolean
    loading?: boolean
    init?: boolean
    initOpen?: boolean
    filter?: boolean
    source: (value: string) => Promise<any[]>
    rows: (data: any[], update?: Function) => any
    linkValue: {
        set(value: string): void
        get(): string
    }
    onKeyUpEnter?: (e) => void
    onFocus: (e) => void
    onBlur: (e) => void
    onMouseEnter: (e) => void
    onMouseLeave: (e) => void
}, {
        data: any[]
    }> {
    state = {
        data: [],
        rows: []
    }

    loading: boolean = false
    needToLoad: boolean = false
    mounted: boolean = false

    componentDidMount() {
        this.mounted = true;
        if (this.props.init) {
            this.update();
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    async update() {
        if (this.mounted) {
            if (!this.loading) {
                this.loading = true;
                this.forceUpdate();
                let data = await this.props.source(this.props.linkValue.get());
                if (this.mounted) {
                    if (this.needToLoad) {
                        this.loading = false;
                        this.needToLoad = false;
                        await this.update();
                    }
                    else {
                        this.loading = false;
                        this.state.data = data;
                        this.forceUpdate();
                    }
                }
            }
            else {
                this.needToLoad = true;
            }
        }
    }

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
            init,
            initOpen,
            filter,
            source,
            rows,
            linkValue,
            onKeyUpEnter
        } = this.props;

        let rowsRender = this.props.rows(this.state.data, this.update.bind(this));

        let content = <div className={"item"}>Nothing to show</div>;
        if (this.loading) content = <div className={"item loading"}>Loading...</div>;
        if (rowsRender && rowsRender.length > 0) content = rowsRender;

        return <Popup type="select" position="bottom center" element={
            popup => <div ref={ref => popup.ref(ref)} onBlur={this.props.onBlur} onFocus={this.props.onFocus} onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.props.onMouseLeave} className={"form-row " + (this.props.className || '') + " form-row-" + (this.props.size || 'md') + (this.props.disabled ? ' disabled' : '') + (this.props.error ? ' error' : '') + (this.props.loading || this.loading ? ' loading' : '')}>
                {this.props.icon ? <Icon name={this.props.icon} className="item text subsub pl-3 pr-3" style={{ width: '1px' }} /> : null}
                <input type={this.props.type || "text"} placeholder={this.props.placeholder || ''} value={this.props.linkValue.get() || ''} onKeyUp={e => {
                    if (e.keyCode == 13 && this.props.onKeyUpEnter) {
                        this.props.onKeyUpEnter(e);
                    }
                }} onChange={e => {
                    this.props.linkValue.set(e.target.value);
                    this.forceUpdate();
                    this.update();
                }} />
                {this.props.children}
                <span className="next"/>
            </div>
        } closeOnOutClick onOpen={() => {
            if (this.props.initOpen) {
                this.update();
            }
        }}>
            <PopupScroll>
                {content}
            </PopupScroll>
        </Popup>
    }
}