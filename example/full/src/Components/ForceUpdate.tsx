import * as React from 'react';
import { Context } from 'create-react-context';
import * as createContext from 'create-react-context';

export const { Provider, Consumer }: Context<Function> = (createContext as any)(() => {});

export class ForceUpdate extends React.Component {
  render() {
    return <Provider value={this.forceUpdate.bind(this)}>
      {this.props.children}
    </Provider>
  }
}
