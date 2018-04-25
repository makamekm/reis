import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as ReactDOM from 'react-dom';
import * as $ from 'jquery';

import * as Reducer from 'reiso/Modules/Reducer';

export type TableHeader = {
    id: string
    name: string
    orderLink?: {
        get: () => boolean
        set: (value: boolean) => void
    }
    hidden?: boolean
}

@Reducer.Connect(state => ({
    isDesktop: state.browser.mediaType == 'large' || state.browser.mediaType == 'infinity' || state.browser.mediaType == 'medium'
}))
export class Table extends React.Component<{
    headers: TableHeader[]
    selected?: {
        set(value: any[])
        get(): any[]
    }
    setOrder?(value): void
    setFilter?(name, value): void
    setPage?(page): void
    loadMore?(): void
    pagination?: {
        limit: number
        offset: number
    }
    count?: number
    rows: any[]
    className?: string
    isDesktop?: boolean
}, {}> {
    context: {
        trans: (query: string, ...args: string[]) => string
    }

    static contextTypes: React.ValidationMap<any> = {
        trans: PropTypes.func.isRequired
    }

    selected: any[] = []
    onscreen: any[] = []

    rowsHeight: {
        [ index: number ]: number
    } = {}

    rowsRefs: {
        [ index: number ]: any
    } = {}
    body: any

    topHeight: number = 0
    bottomHeight: number = 0

    firstRow: number = 0
    lastRow: number = 10

    viewportInterval: number
    viewportEvent: any
    viewportEventTimeout: any
    isMount: boolean = false

    updateScroll(offset = 1000) {
        if (!this || !this.isMount) return;

        if (!this.body) {
            this.forceUpdate();
            return;
        }

        const bodyElem = ReactDOM.findDOMNode(this.body);

        if (!bodyElem) {
            this.forceUpdate();
            return;
        }

        const allKeyRefs = Object.keys(this.rowsRefs);

        let etalonHeight = Object.keys(this.rowsRefs).map(name => this.rowsHeight[name]).filter(i => !!i)[0];

        if (!etalonHeight) {
            const etalonElements = allKeyRefs.map(name => ReactDOM.findDOMNode(this.rowsRefs[name])).filter(i => !!i);

            if (etalonElements.length == 0) {
                this.forceUpdate();
                return;
            }

            etalonHeight = $(etalonElements[0]).outerHeight();
        }

        if (!etalonHeight) {
            this.forceUpdate();
            return;
        }

        const top = (bodyElem as Element).getBoundingClientRect().top;
        // const height = bodyElem.getBoundingClientRect().height;
        // const bottom = bodyElem.getBoundingClientRect().top + height;

        let accumulatorTop = 0;
        let accumulatorBottom = 0;

        let topElem = null;
        let bottomElem = null;

        let topHeight = 0;
        let middleHeight = 0;
        let bottomHeight = 0;

        for (let i = 0; i < this.props.rows.length; i++) {
            const rowElement = ReactDOM.findDOMNode(this.rowsRefs[i]);

            const rowHeight = (rowElement && !!$(rowElement).outerHeight()) ? $(rowElement).outerHeight() : (!!this.rowsHeight[i] ? this.rowsHeight[i] : etalonHeight);

            if (rowHeight) this.rowsHeight[i] = rowHeight;

            if (top + topHeight + rowHeight < -offset) {
                topHeight += rowHeight;
            } else if (middleHeight < window.innerHeight + offset) {
                middleHeight += rowHeight;
                if (topElem == null) topElem = i;
            } else {
                if (bottomElem == null) {
                    bottomElem = i;
                }
                bottomHeight += rowHeight;
            }
        }

        if (topElem == null) topElem = 0;
        if (bottomElem == null) bottomElem = this.props.rows.length - 1;

        if (this.firstRow != topElem || this.lastRow != bottomElem || this.topHeight != topHeight || this.bottomHeight != bottomHeight) {
            this.firstRow = topElem;
            this.lastRow = bottomElem;
            this.topHeight = topHeight;
            this.bottomHeight = bottomHeight;
            this.forceUpdate();
        }
    }

    viewportCheck() {
        if (!this.isMount) return;
        if (this.viewportEventTimeout) window.clearTimeout(this.viewportEventTimeout);
        this.viewportEventTimeout = window.setTimeout(this.updateScroll.bind(this), 50);
    }

    componentDidMount() {
        this.isMount = true;

        this.viewportEvent = this.viewportCheck.bind(this);
        // this.viewportInterval = window.setInterval(this.viewportEvent, 1000);
        window.addEventListener('scroll', this.viewportEvent);
        this.viewportCheck();
    }

    componentWillUnmount() {
        this.isMount = false;

        // if (this.viewportInterval) {
        //     window.clearInterval(this.viewportInterval);
        // }

        if (this.viewportEvent) {
            window.removeEventListener('scroll', this.viewportEvent);
        }
    }

    async filtering(header) {
        if (!header.filter.loading) {
            header.filter.loading = true;
            if (this.isMount) this.forceUpdate();
            let data = await header.filter.source(header.filter.value);
            header.filter.sources = data;
            header.filter.loading = false;
            if (header.filter.needToUpdate) {
                header.filter.needToUpdate = false;
                this.filtering(header);
            }
            if (this.isMount) this.forceUpdate();
        }
        else {
            header.filter.needToUpdate = true;
        }
    }

    render() {
        let headers = this.props.headers.filter(header => !header.hidden).map(header => {
            if (header.orderLink)
            return (
                <div className="table-col item" key={header.id} onClick={e => {
                    header.orderLink.set(!header.orderLink.get());
                }}>
                    {header.name}
                    <span className={"fa ml-d1 fa-" + (header.orderLink.get() == null ? 'unsorted' : (header.orderLink.get() == true ? 'sort-asc' : 'sort-desc'))}/>
                </div>
            )
            else
            return (
                <div className="table-col" key={header.id}>
                    {header.name}
                </div>
            )
        });

        // let loadMore = this.props.loadMore && this.props.pagination && this.props.pagination.offset == 0 && this.props.count > this.props.pagination.limit ? (<span className="pane-btn mt-1" onClick={() => this.props.loadMore()}>Show More</span>) : null;

        let currentSelected = [];
        let onscreen = [];

        let rows = this.props.rows.filter((item, index) => index >= this.firstRow && index <= this.lastRow).map((row, index) => {
            let selected = this.selected.indexOf(row.key) >= 0;

            if (selected) currentSelected.push(row.key);
            onscreen.push(row.key);

            let cols = [];

            if (this.props.selected) cols.push(
                <div className="table-col py-1 border-right item middle center" style={{'width': '2rem'}} key={'select'} onClick={e => {
                    if (selected) {
                        let arr = [];
                        this.selected.forEach(i => {
                            if (i != row.key) arr.push(i);
                        })
                        this.selected = arr;
                    }
                    else {
                        this.selected.push(row.key);
                    }

                    this.forceUpdate();
                }}>
                    {selected ? <span className="fa fa-check-square text medium blue"/> : <span className="fa fa-square text medium subsubsub"/>}
                </div>
            );

            this.props.headers.forEach(header => {
                if (!header.hidden) {
                    let col = row[header.id];
                    if (typeof col === 'function') {
                        cols.push(col(header, this.props.isDesktop));
                    } else {
                        cols.push(col);
                    }
                };
            });

            return (
                <div className="table-row border" key={row.key} ref={ref => this.rowsRefs[index + this.firstRow] = ref}>
                    {cols}
                </div>
            );
        });

        this.selected = currentSelected;
        this.onscreen = onscreen;

        let selected = true;

        this.onscreen.forEach(i => {
            if (this.selected.indexOf(i) < 0) selected = false;
        });

        if (this.props.selected) {
            let selectedEqual = true;

            if (this.props.selected.get().length != this.selected.length) {
                selectedEqual = false;
            }
            else {
                this.selected.forEach(i => {
                    if (this.props.selected.get().indexOf(i) < 0) selectedEqual = false;
                });
            }

            if (!selectedEqual) {
                setTimeout(() => this.props.selected.set(this.selected), 0);
            }
        }

        return (
            <div className={this.props.className || ''}>
                <div className={"table" + (this.props.isDesktop ? '' : ' mobile')}>
                    <div className="table-row header">
                        {!this.props.selected ? null : <div className="table-col ellipsis center item" style={{'width': '2rem'}} onClick={e => {
                            if (selected) {
                                this.selected = [];
                            }
                            else {
                                this.selected = this.onscreen;
                            }
                            this.forceUpdate();
                        }}>
                            {selected ? <span className="fa fa-check-square text blue"/> : <span className="fa fa-square text subsubsub"/>}
                        </div>}
                        {headers}
                    </div>
                    <div className="table-row-table" ref={ref => this.body = ref}>
                        {this.topHeight > 0 && <div className="table-row border" style={{ height: this.topHeight, content: '' }}/>}
                        {rows}
                        {this.bottomHeight > 0 && <div className="table-row border" style={{ height: this.bottomHeight, content: '' }}/>}
                    </div>
                </div>
            </div>
        )
    }
}