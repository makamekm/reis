import * as React from 'react'
import * as PropTypes from 'prop-types';
import * as ReactDOM from 'react-dom';

import { Portal, PortalProps, ConnectionPortal } from '../Private/Portal';

export class LoadingBarProps {
  key?: any
  onMount?: boolean = true
}

export class LoadingBar extends React.Component<LoadingBarProps, {}> {

	constructor(props, context){
		super(props, context);
	}

  public static defaultProps = new LoadingBarProps()

  refs: {
    [key: string]: any;
    portal: Portal;
  }

  closePortal() {
    if (this.refs.portal) {
      this.refs.portal.closePortal();
    }
  }

  openPortal() {
    if (this.refs.portal) {
      if (this.mounted) this.refs.portal.openPortal();
    }
  }

  mounted: boolean = false

  componentWillUnmount() {
    this.closePortal();

    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;

    if (this.props.onMount && this.mounted) {
      this.open();
    }
  }

  modal: any = null
  key: number = Math.random()

  open() {
    this.openPortal();
  }

  close() {
    this.closePortal();
  }

  render() {
    const { children } = this.props

    const {
      ...propsPass
    } = this.props;

    return (
        <Portal ref="portal" {...propsPass} level={-2} className={"loading-container std"} isGhost
          onOpen={(node, elem) => {
            setTimeout(() => {
              $(node).children().addClass('show');
            }, 0);
          }}
          beforeClose={(node, callback)=>{
            $(node).children().removeClass('show');
            setTimeout(callback, 400);
          }}>
          <div className={"loading-bar"}/>
        </Portal>
    )
  }
}
