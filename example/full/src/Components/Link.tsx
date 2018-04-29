import * as React from 'react';
import * as PropTypes from 'prop-types';

import { Consumer } from '~/Modules/Main/View/Html';
import { Button } from './Button';

export const Link = (props: {
  to: string
  activeClassName?: string
  className?: string
  history?: any
  component?: string
  children?: any
  relative?: boolean
  style?: React.CSSProperties
}) => {
  return <Consumer>
    {context => {
      let active = context.isPath(props.to, props.relative);

      if (props.component == 'Button') {
        return (
          <Button elementType="a" style={props.style} href={context.getPath(props.to)} disabled={active} className={props.className + (active ? (' ' + props.activeClassName) : '')} onClick={async e => {
            e.preventDefault();
            context.go(props.to);
          }}>
            {props.children}
          </Button>
        )
      }
      else {
        const Component = props.component || 'a';

        return (
          <Component href={context.getPath(props.to)} style={props.style} className={active ? (props.className + ' ' + props.activeClassName) : props.className} onClick={e => {
            e.preventDefault()
            context.go(props.to);
          }}>
            {props.children}
          </Component>
        )
      }
    }}
  </Consumer>
}