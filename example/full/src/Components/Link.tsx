import * as React from 'react';
import * as PropTypes from 'prop-types';

import { Button } from './Button';

export class Link extends React.Component<{
  to: string
  activeClassName?: string
  className?: string
  history?: any
  component?: string
  children?: any
  relative?: boolean
  style?: React.CSSProperties
}> {
  context: {
    getPath: Function
    go: Function
    isPath: Function
  }

  static contextTypes: React.ValidationMap<any> = {
    getPath: PropTypes.func.isRequired,
    go: PropTypes.func.isRequired,
    isPath: PropTypes.func.isRequired
  }

  render() {
    let active = this.context.isPath(this.props.to, this.props.relative);

    if (this.props.component == 'Button') {
      return (
        <Button elementType="a" style={this.props.style} href={this.context.getPath(this.props.to)} disabled={active} className={this.props.className + (active ? (' ' + this.props.activeClassName) : '')} onClick={async e => {
          e.preventDefault();
          this.context.go(this.props.to);
        }}>
          {this.props.children}
        </Button>
      )
    }
    else {
      const Component = this.props.component || 'a';

      return (
        <Component href={this.context.getPath(this.props.to)} style={this.props.style} className={active ? (this.props.className + ' ' + this.props.activeClassName) : this.props.className} onClick={e => {
          e.preventDefault()
          this.context.go(this.props.to);
        }}>
          {this.props.children}
        </Component>
      )
    }
  }
}