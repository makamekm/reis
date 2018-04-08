import * as React from 'react'
import * as PropTypes from 'prop-types';
import * as ReactDOM from 'react-dom';

import { Portal, PortalProps, ConnectionPortal } from '~/Components/Private/Portal';

export class ModalProps {
  key?: any
  level?: number = -1

  closeOnEsc?: boolean
  closeOnOutsideClick?: boolean

  connectionPortal?: ConnectionPortal = {}

  onOpen?: () => void | boolean
  onClose?: () => void | boolean
  children?: any

  size?: ModalSize
}

export type ModalSize = "small" | "medium" | "large";

export class Modal extends React.Component<ModalProps, {}> {
  context: {
    modals: {
      push: (modal: ModalProps) => void
      remove: (modal: ModalProps) => void
      update: (modal?: ModalProps) => void
    }
  }

  static contextTypes: React.ValidationMap<any> = {
    modals: PropTypes.object.isRequired,
  }

	static childContextTypes: React.ValidationMap<any> = {
		modal: PropTypes.object,
	}

	constructor(props, context){
		super(props, context);
	}

	getChildContext(){
		return {
			modal: {
        close: () => this.close()
      }
		}
	}

  public static defaultProps = new ModalProps()

  refs: {
    [key: string]: any;
    portal: Portal;
  }

  closePortal() {
    if (this.props.onClose) {
      if (this.props.onClose() !== false) this.refs.portal.closePortal();
    }
    else {
      this.refs.portal.closePortal();
    }
  }

  openPortal() {
    if (this.props.onOpen) {
      if (this.props.onOpen() !== false && this.mounted) this.refs.portal.openPortal();
    }
    else {
      if (this.mounted) this.refs.portal.openPortal();
    }
  }

  mounted: boolean = false

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;

    if (this.mounted) {
      this.open();
    }
  }

  handleOutsideClick(e) {
    if (this.props.closeOnOutsideClick && this.refs.portal.state.active) {
      e.preventDefault();
      e.stopPropagation();
      this.close();
    }
  }

  handleWrapperClick(e) {
    if (!this.refs.portal.state.active && !this.refs.portal.props.isHidden) {
      e.preventDefault();
      e.stopPropagation();
      $(e.target).blur();
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
    const { children, level, connectionPortal, closeOnOutsideClick, closeOnEsc } = this.props

    const props = {
      level,
      connectionPortal
    }

    return (
      <Portal ref="portal" {...props} className="modal-container std" isModal={true}
        onOpen={(node, elem)=>{
          setTimeout(() => {
            $(node).children().addClass('show');
          }, 0);
        }}
        beforeClose={(node, callback)=>{
          $(node).children().removeClass('show');
          setTimeout(callback, 400);
        }}
        onOutsideClick={this.handleOutsideClick.bind(this)}
        onEsc={closeOnEsc ? this.handleWrapperClick.bind(this) : null}>
        <div className={"modal" + (this.props.size ? (' modal-' + this.props.size) : '')}>
          {this.props.children}
        </div>
      </Portal>
    )
  }
}
