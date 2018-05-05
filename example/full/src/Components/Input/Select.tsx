import * as React from 'react';

import { Clickable } from '../Clickable';
import { Popup, PopupItem, PopupInput, PopupScroll } from '../Popup';
import { Icon } from '../Icon';

export type SelectSize = 'md' | 'xs' | 'lg' | 'sm';
export type SelectType = 'text' | 'password' | 'email';

export class Select extends React.Component<{
    className?: string
    placeholder?: string
    size?: SelectSize
    icon?: string
    addon?: string
    disabled?: boolean
    error?: boolean
    loading?: boolean
    init?: boolean
    initOpen?: boolean
    filter?: boolean
    testing?: boolean
    onInit?: () => void
    source: (value: string) => Promise<any[]>
    rows: (data: any[], update?: Function) => any
    onFocus?: (e) => void
    onBlur?: (e) => void
    onMouseEnter?: (e) => void
    onMouseLeave?: (e) => void
}, {
        data: any[]
        value: string
    }> {
    state = {
        data: [],
        value: ''
    }

    loading: boolean = false
    needToLoad: boolean = false
    mounted: boolean = false
    inited: boolean = false

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
                let data = await this.props.source(this.state.value);
                if (this.mounted) {
                    if (this.needToLoad) {
                        this.loading = false;
                        this.needToLoad = false;
                        await this.update();
                    }
                    else {
                        this.loading = false;
                        this.state.data = data;
                        this.forceUpdate(() => {
                            if (!this.inited) {
                                this.inited = true;
                                this.props.onInit && this.props.onInit();
                            }
                        });
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
            icon,
            addon,
            disabled,
            error,
            loading,
            init,
            filter,
            source,
            rows,
            initOpen,
            testing
        } = this.props;

        let rowsRender = this.props.rows(this.state.data, this.update.bind(this));

        let content = <div className={"item"}>Nothing to show</div>;
        if (this.loading) content = <div className={"item loading"}>Loading...</div>;
        if (rowsRender && rowsRender.length > 0) content = rowsRender;

        return <Popup testing={testing} type="select" position="bottom center" isHidden={this.props.disabled} element={
            popup => <div ref={ref => popup.ref(ref)} onClick={() => popup.open()} onBlur={this.props.onBlur} onFocus={this.props.onFocus} onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.props.onMouseLeave} className={"form-row pointer" + (this.props.className ? '' + this.props.className : '') + " form-row-" + (this.props.size || 'md') + (this.props.disabled ? " disabled" : '') + (this.props.error ? ' error' : '') + (popup.isOpen() ? " form-row-parent-open" : '')}>
                {this.props.icon ? <Icon name={this.props.icon} className="item text subsub pl-3 pr-3" style={{ width: '1px' }} /> : null}
                <span className="selecting">
                    <span className="placeholder">{this.props.placeholder || ''}</span>
                    {this.props.children}
                </span>
                <span className="next" />
            </div>
        } closeOnOutClick onOpen={() => {
            if (this.props.initOpen) {
                this.update();
            }
        }}>
            <PopupInput help="Type to find" className={this.props.loading || this.loading ? ' loading' : ''} placeholder="Search" value={this.state.value || ''} onChange={e => {
                this.state.value = e.target.value;
                this.forceUpdate();
                this.update();
            }} />
            <PopupScroll>
                {content}
            </PopupScroll>
        </Popup>
    }
}