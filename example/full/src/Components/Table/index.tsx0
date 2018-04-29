import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as moment from 'moment';

import * as Reducer from 'reiso/Modules/Reducer';

import { Popup } from '../Popup';
import { Calendar, isDateValid } from '../Calendar';
import { Pagination } from '../Pagination';

export type TableHeader = {
    id: string
    name: string
    order?: string
    hidden?: boolean
    filter?: {
        type: 'like' | 'inner' | 'date'
        name: string
        nameTo?: string
        source?: (str: string) => Promise<any[]>
        value?: any
        valueTo?: any
        values?: any[]
        sources?: any[]
        loading?: boolean
        needToUpdate?: boolean
        inited?: boolean
    }
    filterType?: 'like' | 'inner' | 'date'
    filterSource?: (str: string) => Promise<any[]>
    filterLink?: {
        set(value: any)
        get(): any
    }
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

    update?: Function
    selectedLink?: {
        set(value: any[])
        get(): any[]
    }
    orderLink?: {
        set(value: {
            name: string
            type: 'desc' | 'asc'
        }[])
        get(): {
            name: string
            type: 'desc' | 'asc'
        }[]
    }
}, {}> {
    context: {
        trans: (query: string, ...args: string[]) => string
    }

    static contextTypes: React.ValidationMap<any> = {
        trans: PropTypes.func.isRequired
    }

    // order?: {
    //     header: TableHeader
    //     type: 'desc' | 'asc'
    // }[]

    selected: any[] = []
    onscreen: any[] = []

    isMount: boolean

    componentDidMount() {
        this.isMount = true;
    }

    componentWillUnmount() {
        this.isMount = false;
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
            let filter = null;

            if (header.filterType && header.filterLink) {
                let filterValue = header.filterLink.get();

                if (header.filterType == 'like')
                filter = (
                    <div className="input">
                        <input type="text" placeholder={this.context.trans("Component.Table.Search")} value={filterValue || ''} onKeyUp={e => {

                            if (e.keyCode == 13) this.props.update();
                        }} onChange={e => {
                            header.filterLink.set(e.target.value);
                            this.forceUpdate();
                        }}/>
                        <span className="fa fa-search"/>
                        <span className="right">{this.context.trans("Component.Table.EnterToSend")}</span>
                    </div>
                )
                else if (header.filterType == 'date') {
                    let valid = filterValue.from && moment(filterValue.from).isValid();
                    let validTo = filterValue.to && moment(filterValue.to).isValid();
                    let value = valid ? moment(filterValue.from) : null;
                    let valueTo = validTo ? moment(filterValue.to) : null;

                    filter = [
                        (
                            <div className={"input" + (!filterValue.from || valid ? '' : ' error')} key="name">
                                <Popup level={1} type="select" position="bottom center" openOnFocus openOnClick closeOnOutsideClick closeOnBlur element={
                                    <input type="text" placeholder={this.context.trans("Component.Table.From")} value={filterValue.from || ''} onKeyUp={e => {
                                        if (e.keyCode == 13) {
                                            if (valid) {
                                                filterValue.from = moment(filterValue.from).format("YYYY-MM-DD");
                                            } else {
                                                filterValue.from = null;
                                            }

                                            header.filterLink.set(filterValue);
                                            this.props.update();
                                            this.forceUpdate();
                                        }
                                    }} onChange={e => {
                                        filterValue.from = e.target.value;
                                        header.filterLink.set(filterValue);
                                        this.forceUpdate();
                                    }}/>}>
                                    <Calendar format="YYYY-MM-DD" weeksPerMonth={6} max={valueTo} valueLink={{
                                        get: () => valid && moment(filterValue.from),
                                        set: value => {
                                            filterValue.from = value.format("YYYY-MM-DD");
                                            header.filterLink.set(filterValue);
                                            this.props.update();
                                            this.forceUpdate();
                                        },
                                    }}/>
                                </Popup>
                                <span className="fa fa-calendar"/>
                                <span className="right">{this.context.trans("Component.Table.EnterToSend")}</span>
                            </div>
                        ),
                        (
                            <div className={"input" + (!filterValue.to || validTo ? '' : ' error')} key="nameTo">
                                <Popup level={1} type="select" position="bottom center" openOnFocus openOnClick closeOnOutsideClick closeOnBlur element={
                                    <input type="text" placeholder={this.context.trans("Component.Table.To")} value={filterValue.to || ''} onKeyUp={e => {
                                        if (e.keyCode == 13) {
                                            if (validTo) {
                                                filterValue.to = moment(filterValue.to).format("YYYY-MM-DD");
                                            } else {
                                                filterValue.to = null;
                                            }

                                            header.filterLink.set(filterValue);
                                            this.props.update();
                                            this.forceUpdate();
                                        }
                                    }} onChange={e => {
                                        filterValue.to = e.target.value;
                                        header.filterLink.set(filterValue);
                                        this.forceUpdate();
                                    }}/>}>
                                    <Calendar format="YYYY-MM-DD" weeksPerMonth={6} min={value} valueLink={{
                                        get: () => validTo && moment(filterValue.to),
                                        set: value => {
                                            filterValue.to = value.format("YYYY-MM-DD");
                                            header.filterLink.set(filterValue);
                                            this.props.update();
                                            this.forceUpdate();
                                        },
                                    }}/>
                                </Popup>
                                <span className="fa fa-calendar"/>
                                <span className="right">{this.context.trans("Component.Table.EnterToSend")}</span>
                            </div>
                        ),
                    ]
                }
                // else if (header.filterType == 'inner') {
                //     if (!header.filter.values) header.filter.values = [];

                //     if (!header.filter.inited) {
                //         header.filter.inited = true;
                //         this.filtering(header);
                //     }

                //     let sources = header.filter.sources ? header.filter.sources.map(value => {
                //         let active = header.filter.values.indexOf(value.id) >= 0;

                //         return (
                //             <div className={"item" + (active ? ' active' : '')} key={value.id} onClick={e => {
                //                     if (active) {
                //                         let arr = [];
                //                         header.filter.values.forEach(i => {
                //                             if (i != value.id) arr.push(i);
                //                         });
                //                         header.filter.values = arr;
                //                     }
                //                     else {
                //                         header.filter.values.push(value.id);
                //                     }
                //                     this.props.setFilter(header.filter.name, header.filter.values);
                //                     this.forceUpdate();
                //                 }}>
                //                 {value.name}
                //             </div>
                //         )}
                //     ) : [];

                //     filter = [(
                //         <div className={"input " + (header.filter.loading ? ' loading' : '')} key="filter">
                //             <input type="text" placeholder="Filter" value={header.filter.value || ''} onKeyDown={e => {
                //                 if (e.keyCode == 8 && (e.target as any).value.length < 1) {
                //                     header.filter.values = [];
                //                     this.props.setFilter(header.filter.name, header.filter.values);
                //                     this.forceUpdate();
                //                 }
                //             }} onChange={e => {
                //                 header.filter.value = e.target.value;
                //                 this.forceUpdate();
                //                 this.filtering(header);
                //             }}/>
                //             <span className="fa fa-search"/>
                //             <span className="right">{this.context.trans("Component.Table.BackspaceToClear")}</span>
                //         </div>
                //     ),
                //     (
                //         <div className="select-container" key="values">
                //             {sources}
                //         </div>
                //     )]
                // }
            }

            let order = null;
            let orderDir: string = null;

            if (header.order) {

                let orderValue = this.props.orderLink.get();

                let findAsc = orderValue.find(i => i.type == 'asc' && i.name == header.order);
                let findDesc = orderValue.find(i => i.type == 'desc' && i.name == header.order);

                if (findAsc) orderDir = 'asc';
                if (findDesc) orderDir = 'desc';

                order = (
                    <div className="select-container">
                        <div className={"item" + (findAsc ? ' active' : '')} onClick={() => {
                                if (findAsc && !findDesc) {
                                    let arr = [];
                                    orderValue.forEach(i => {
                                        if (i !== findAsc) arr.push(i);
                                    });
                                    this.props.orderLink.set(arr);
                                } else if (!findAsc && findDesc) {
                                    findDesc.type = 'asc';
                                    this.props.orderLink.set(orderValue);
                                } else {
                                    orderValue.push({
                                        name: header.order,
                                        type: 'asc'
                                    });
                                    this.props.orderLink.set(orderValue);
                                }
                                this.props.update();
                            }}>
                            <span className="fa fa-sort-amount-asc mr-2"/>
                            {this.context.trans("Component.Table.Asc")}
                        </div>
                        <div className={"item" + (findDesc ? ' active' : '')} onClick={() => {
                                if (findDesc && !findAsc) {
                                    let arr = [];
                                    orderValue.forEach(i => {
                                        if (i !== findDesc) arr.push(i);
                                    });
                                    this.props.orderLink.set(arr);
                                } else if (!findDesc && findAsc) {
                                    findAsc.type = 'desc';
                                    this.props.orderLink.set(orderValue);
                                } else {
                                    orderValue.push({
                                        name: header.order,
                                        type: 'desc'
                                    });
                                    this.props.orderLink.set(orderValue);
                                }
                                this.props.update();
                            }}>
                            <span className="fa fa-sort-amount-desc mr-2"/>
                            {this.context.trans("Component.Table.Desc")}
                        </div>
                    </div>
                )
            }

            if (filter || order) return (
                <Popup maxWidth="20rem" minWidth="15rem" key={header.id} type="select" position="bottom center" activeClassName="active focus" openOnFocus openOnClick closeOnOutsideClick closeOnBlur element={
                    <div className="table-col item">
                        {header.name}
                        <span className={"fa ml-2 fa-" + (orderDir ? ('sort-' + orderDir) : 'sort')}/>
                    </div>}>
                    {filter}
                    {filter && filter.type == 'inner' && order ? <div className="line"></div> : null}
                    {order}
                </Popup>
            )
            else return (
                <div className="table-col" key={header.id}>
                    {header.name}
                </div>
            )
        });

        // let loadMore = this.props.loadMore && this.props.pagination && this.props.pagination.offset == 0 && this.props.count > this.props.pagination.limit ? (<span className="pane-btn mt-1" onClick={() => this.props.loadMore()}>Show More</span>) : null;

        let currentSelected = [];
        let onscreen = [];

        let rows = this.props.rows.map(row => {
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
                <div className="table-row border" key={row.key}>
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
                    <div className="table-row-table">
                        {rows}
                    </div>
                </div>
                <Pagination setPage={this.props.setPage} count={this.props.count} pagination={this.props.pagination}/>
            </div>
        )
    }
}