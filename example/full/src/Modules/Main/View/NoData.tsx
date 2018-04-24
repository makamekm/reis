import * as React from 'react';
import * as PropTypes from 'prop-types';

import * as Router from 'reiso/Modules/Router';

@Router.withRouter
export class NoData extends React.Component {
    context: {
        trans: (query: string, ...args: string[]) => string
    }

    static contextTypes: React.ValidationMap<any> = {
        trans: PropTypes.func.isRequired
    }

    render() {
        return (
            <div className="text center p-5">
                <h4>No data</h4>
                <div className="text subsub pt-1">Try another data or change paramaters</div>
            </div>
        )
    }
}