import * as React from 'react';
import * as PropTypes from 'prop-types';

import * as Router from 'reiso/Modules/Router';

@Router.withRouter
export class Loading extends React.Component {
    context: {
        trans: (query: string, ...args: string[]) => string
    }

    static contextTypes: React.ValidationMap<any> = {
        trans: PropTypes.func.isRequired
    }

    render() {
        return (
            <div className="text center p-5">
                {/* <div className="loading-logo mt-10">
                    <div className="img"/>
                    <div className="shadow"/>
                </div> */}
                <h4 className="pt-2">Please wait...</h4>
                <div className="text subsub pt-1">It will take some time</div>
            </div>
        )
    }
}