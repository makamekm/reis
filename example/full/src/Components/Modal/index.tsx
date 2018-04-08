import * as React from 'react'
import * as PropTypes from 'prop-types';
import * as ReactDOM from 'react-dom';

import { Portal, PortalProps, ConnectionPortal } from '~/Components/Private/Portal';

export * from './Prove';

export class ModalProps {
  key?: any
  level?: number

  openOnClick?: boolean
  closeOnEsc?: boolean
  closeOnOutsideClick?: boolean

  connectionPortal?: ConnectionPortal = {}
  element?: React.ReactElement<any>

  onOpen?: () => void | boolean
  onClose?: () => void | boolean
  onMount?: boolean
  children?: any

  size?: ModalSize
  type?: ModalType
  isService?: boolean
}

export type ModalSize = "small" | "medium" | "large";

export type ModalType = "std" | "empty" | "page";

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

  componentWillUpdate() {
    if (this.props.isService) {
      this.modal = Object.assign({
        key: this.key,
      }, this.props);
      this.context.modals.update(this.modal);
    }
  }

  closePortal() {
    if (this.refs.portal) {
      if (this.props.onClose) {
        if (this.props.onClose() !== false) this.refs.portal.closePortal();
      }
      else {
        this.refs.portal.closePortal();
      }
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
    if (!this.props.isService) this.closePortal();

    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;

    if (this.props.onMount && this.mounted) {
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
    if (this.props.openOnClick && !this.refs.portal.state.active && !this.refs.portal.props.isHidden) {
      e.preventDefault();
      e.stopPropagation();
      $(e.target).blur();
      this.open();
    }
  }

  modal: any = null
  key: number = Math.random()

  open() {
    if (this.props.isService) {
      this.modal = {
        key: this.key,
        ...this.props
      };
      this.context.modals.push(this.modal);
    }
    else {
      this.openPortal();
    }
  }

  close() {
    if (this.props.isService) {
      if (this.modal) this.context.modals.remove(this.modal);
      this.modal = null;
    }
    else {
      this.closePortal();
    }
  }

  render() {
    const { children, level, connectionPortal, element, closeOnOutsideClick, closeOnEsc } = this.props

    const props = {
      level,
      connectionPortal,
      element
    }

    const {
      type,
      ...propsPass
    } = this.props;

    return (
        <Portal ref="portal" {...propsPass} outsideLevel={1} className={"modal-container " + (this.props.type || 'std')} isModal={true}
          onOpen={(node, elem) => {
            setTimeout(() => {
              $(node).children().addClass('show');

              if (elem) {
                let pseudo = $('<div></div>');
                pseudo.css('opacity', 0);
                pseudo.css('position', 'fixed');
                pseudo.css('background-color', 'rgba(0, 0, 0, 0.1)');
                $('body').append(pseudo);
                let el = $(elem);
                pseudo.velocity({
                  opacity: [0, 1],
                  left: [0, el.offset().left - $(window).scrollLeft()],
                  right: [0, $(window).width() - (el.offset().left + el.outerWidth()) - $(window).scrollLeft()],
                  top: [0, $(elem).offset().top - $(window).scrollTop()],
                  bottom: [0, $(window).height() - (el.offset().top + el.outerHeight()) - $(window).scrollTop()]
                },
                {
                  duration: 400,
                  complete: function() {
                    pseudo.remove();
                  }
                });
              }
            }, 0);
          }}
          beforeClose={(node, callback)=>{
            $(node).children().removeClass('show');
            setTimeout(callback, 400);
          }}
          onElementClick={this.handleWrapperClick.bind(this)}
          onOutsideClick={this.handleOutsideClick.bind(this)}
          onEsc={closeOnEsc ? this.handleWrapperClick.bind(this) : null}>
          <div className={"modal" + (this.props.size ? (' modal-' + this.props.size) : '')}>
            {this.props.children}
          </div>
        </Portal>
    )
  }
}
