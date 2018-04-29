import * as React from 'react';
import * as PropTypes from 'prop-types';

import * as Router from 'reiso/Modules/Router';

import { Consumer } from './Html';

export const Secured = () => {
    return (
        <Consumer>
            {context =>
                <div className="text center p-10">
                    <div className="text center">
                        <div className="logo3 inv upsidedown mt-5 mb-8"/>
                    </div>
                    <h1>401</h1>
                    <h4>{context.trans('Secured.title')}</h4>
                    <div className="text subsub pt-5">{context.trans('Secured.description')}</div>
                </div>
            }
        </Consumer>
    )
}