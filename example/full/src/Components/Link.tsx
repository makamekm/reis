import * as React from 'react';
import * as PropTypes from 'prop-types';

import { Consumer } from '../Modules/Main/View/Html';
import { Button } from './Button';

export const Link = (props: {
  id?: string
  to: string
  activeClassName?: string
  className?: string
  history?: any
  component?: string
  children?: any
  relative?: boolean
  style?: React.CSSProperties
}) => <Consumer>
  {context => {
    const active = context.isPath(props.to, props.relative);
    const doAction = e => {
      e.preventDefault()
      context.go(props.to);
    }

    if (props.component == 'Button') {
      return (
        <Button id={props.id} elementType="a" style={props.style} href={context.getPath(props.to)} disabled={active} className={props.className + (active ? ' ' + props.activeClassName : '')} onClick={async e => doAction(e)}>
          {props.children}
        </Button>
      )
    }
    else {
      const Component = props.component || 'a';

      return (
        <Component id={props.id} tabIndex={0} href={context.getPath(props.to)} style={props.style} className={props.className + (active ? ' ' + props.activeClassName : '')} onKeyDown={e => {
          if (e.keyCode == 13) {
            doAction(e);
          }
        }} onClick={e => doAction(e)}>
          {props.children}
        </Component>
      )
    }
  }}
</Consumer>