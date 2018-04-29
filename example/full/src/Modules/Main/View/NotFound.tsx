import * as React from 'react';
import * as PropTypes from 'prop-types';

import * as Router from 'reiso/Modules/Router';

import { Application } from '~/Modules/Main/View/Application';

import { Consumer } from './Html';

export const NotFound = Router.Route(null, render => <Application><NotFound/></Application>, 999)(() => {
    return (
        <Consumer>
            {context =>
                <div className="text center p-5">
                    <h1>404</h1>
                    <h4>{context.trans('NotFound.title')}</h4>
                    <div className="text subsub pt-1">{context.trans('NotFound.description')}</div>
                </div>
            }
        </Consumer>
    )
})