import * as React from 'react';
import * as PropTypes from 'prop-types';

import * as Router from 'reiso/Modules/Router';

import { Consumer } from './Html';

export const NoData = () => {
    return (
        <Consumer>
            {context =>
                <div className="text center p-5">
                    <h4>No data</h4>
                    <div className="text subsub pt-1">Try another data or change paramaters</div>
                </div>
            }
        </Consumer>
    )
}