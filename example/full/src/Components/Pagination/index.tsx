import * as React from 'react';
import * as PropTypes from 'prop-types';

import * as Reducer from 'reiso/Modules/Reducer';

import { Popup } from '../Popup';
import { InputForm } from '../Form';
import { Button } from '../Button';

@Reducer.Connect(state => ({
    isDesktop: state.browser.mediaType == 'large' || state.browser.mediaType == 'infinity' || state.browser.mediaType == 'medium'
}))
export class Pagination extends React.Component<{
    setPage?(page): void
    pagination?: {
        limit: number
        offset: number
    }
    count?: number
    className?: string
    isDesktop?: boolean
}, {}> {
    context: {
        trans: (query: string, ...args: string[]) => string
    }

    static contextTypes: React.ValidationMap<any> = {
        trans: PropTypes.func.isRequired
    }

    toPage: string = ''

    canGoToPage() {
        let max = Math.floor(this.props.count / this.props.pagination.limit) + 1;
        return !isNaN(Number(this.toPage)) && Number(this.toPage) > 0 && Number(this.toPage) <= max;
    }

    tryGoToPage() {
        if (this.canGoToPage()) {
            this.props.setPage(Number(this.toPage) - 1);
        }
    }

    render() {

        let pagination = null;

        if (this.props.setPage && this.props.pagination) {
            let paginations = [];

            let currentPage: number = Math.floor(this.props.pagination.offset / this.props.pagination.limit);
            let maxPage: number = Math.floor(this.props.count / this.props.pagination.limit);

            if (this.props.count > 0 && this.props.isDesktop) {
                paginations.push(<span key={'additionalStat'} className="item disabled">
                {this.context.trans("Component.Pagination.FromTo", (this.props.pagination.offset + 1).toString(), Math.min(this.props.count, this.props.pagination.limit + this.props.pagination.offset + 1).toString())}</span>);
            }

            if (currentPage > 0) {
                paginations.push(<span onClick={() => this.props.setPage(0)} key={'first'} className="item" tabIndex={0}>1</span>);
            }

            if (currentPage > 1) {
                paginations.push(<span onClick={() => this.props.setPage(1)} key={'nextfirst'} className="item" tabIndex={0}>2</span>);
            }

            if (currentPage > 2) {
                paginations.push(<Popup key={'disabledfirst'} activeClassName="active" type="select" position="top center" element={<span className="item">...</span>} openOnClick closeOnOutsideClick>
                    <div className="p-2">
                        <InputForm size="xs" errors={this.canGoToPage() ? null : [this.context.trans("Component.Pagination.PageDoesnExist")]} onEnterKey={async e => this.tryGoToPage()} label="Enter the page number" placeholder={this.context.trans("Component.Pagination.Number")} linkValue={{
                            get: () => this.toPage,
                            set: value => {
                                this.toPage = value;
                                this.forceUpdate();
                            }
                        }}/>
                        <div className="text center width-full pt-3">
                            <Button onClick={async e => this.tryGoToPage()} type="primary" size="sm">{this.context.trans("Component.Pagination.Go")}</Button>
                        </div>
                    </div>
                </Popup>);
            }

            if (currentPage > 2) {
                paginations.push(<span onClick={() => this.props.setPage(currentPage - 1)} key={currentPage - 1} className="item" tabIndex={0}>{currentPage}</span>);
            }

            if (this.props.count > this.props.pagination.limit) {
                paginations.push(<span onClick={() => this.props.setPage(currentPage)} key={currentPage} className="item active" tabIndex={0}>{currentPage + 1}</span>);
            }

            if (maxPage - currentPage > 2) {
                paginations.push(<span onClick={() => this.props.setPage(currentPage + 1)} key={currentPage + 1} className="item" tabIndex={0}>{currentPage + 2}</span>);
            }

            if (maxPage - currentPage > 2) {
                paginations.push(<Popup key={'disabledlast'} activeClassName="active" type="select" position="top center" element={<span className="item">...</span>} openOnClick closeOnOutsideClick>
                    <div className="p-2">
                        <InputForm size="xs" errors={this.canGoToPage() ? null : [this.context.trans("Component.Pagination.PageDoesnExist")]} onEnterKey={async e => this.tryGoToPage()} label="Enter the page number" placeholder={this.context.trans("Component.Pagination.Number")} linkValue={{
                            get: () => this.toPage,
                            set: value => {
                                this.toPage = value;
                                this.forceUpdate();
                            }
                        }}/>
                        <div className="text center width-full pt-1">
                            <Button onClick={async e => this.tryGoToPage()} type="primary" size="sm">{this.context.trans("Component.Pagination.Go")}</Button>
                        </div>
                    </div>
                </Popup>);
            }

            if (maxPage - currentPage > 1) {
                paginations.push(<span onClick={() => this.props.setPage(maxPage - 1)} key={'prevlast'} className="item" tabIndex={0}>{maxPage}</span>);
            }

            if (maxPage - currentPage > 0) {
                paginations.push(<span onClick={() => this.props.setPage(maxPage)} key={'last'} className="item" tabIndex={0}>{maxPage + 1}</span>);
            }

            if (this.props.count > 0 && this.props.isDesktop) {
                paginations.push(<span key={'additional'} className="item disabled">{this.context.trans("Component.Pagination.Of", Math.min(this.props.pagination.limit, this.props.count - this.props.pagination.offset).toString(), this.props.count.toString())}</span>);
            }

            pagination = (
                <div className={"pagination " + (this.props.className || '')}>
                    {paginations}
                </div>
            );
        }

        return pagination;
    }
}