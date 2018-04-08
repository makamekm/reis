import * as React from 'react';
import * as PropTypes from 'prop-types';

import * as Router from 'reiso/Modules/Router';

import { Application } from '~/Modules/Main/View/Application';

@Router.withRouter
export class Secured extends React.Component {
    context: {
        trans: (query: string, ...args: string[]) => string
    }

    static contextTypes: React.ValidationMap<any> = {
        trans: PropTypes.func.isRequired
    }

    render() {
        return <div className="text center p-10">
            <div className="text center">
                <div className="logo3 inv upsidedown mt-5 mb-8"/>
            </div>
            <h1>401</h1>
            <h4>{this.context.trans('Secured.title')}</h4>
            <div className="text subsub pt-5">{this.context.trans('Secured.description')}</div>
        </div>
    }
}