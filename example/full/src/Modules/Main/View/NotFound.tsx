import * as React from 'react';
import * as PropTypes from 'prop-types';

import * as Router from 'reiso/Modules/Router';

import { Application } from '~/Modules/Main/View/Application';

@Router.withRouter
@Router.Route(null, render => <Application><NotFound/></Application>, 999)
export class NotFound extends React.Component {
    context: {
        trans: (query: string, ...args: string[]) => string
    }

    static contextTypes: React.ValidationMap<any> = {
        trans: PropTypes.func.isRequired
    }

    render() {
        return <div className="text center p-5">
            {/* <div className="text center">
                <div className="logo3 inv upsidedown mt-2 mb-3"/>
            </div> */}
            <h1>404</h1>
            <h4>{this.context.trans('NotFound.title')}</h4>
            <div className="text subsub pt-1">{this.context.trans('NotFound.description')}</div>
        </div>
    }
}