import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Context } from 'create-react-context';
import * as createContext from 'create-react-context';
import * as ReactDOM from 'react-dom';

import { Portal } from '~/Components/Private/Portal';

export * from './Prove';

export type ConsumerType = {
  close: () => void
  open: () => void
}

export const { Provider, Consumer }: Context<ConsumerType> = (createContext as any)({
  close: () => {},
  open: () => {}
});

export type ModalSize = "small" | "medium" | "large";
export type ModalType = "std" | "empty" | "page";

export class ModalProps {
  closeOnEsc?: boolean
  closeOnOutClick?: boolean
  handleEscKeydown?: boolean
  onOpen?: (node: HTMLElement) => void
  onClose?: (node: HTMLElement, callback: () => void) => void
  size?: ModalSize
  type?: ModalType
  children?: any
  content?: any
}

export class Modal extends React.Component<ModalProps> {
  public static defaultProps: ModalProps = new ModalProps()
  open: boolean = false
  modalContainer: Element

  componentDidMount() {
    this.handleEscKeydown = this.handleEscKeydown.bind(this);
    this.handleOutMouseClick = this.handleOutMouseClick.bind(this);

    if (this.props.closeOnEsc) {
      document.addEventListener('keydown', this.handleEscKeydown);
    }

    if (this.props.closeOnOutClick) {
      document.addEventListener('mousedown', this.handleOutMouseClick);
      document.addEventListener('touchstart', this.handleOutMouseClick);
    }
  }

  componentWillUnmount() {
    if (this.props.closeOnEsc) {
      document.removeEventListener('keydown', this.handleEscKeydown);
    }

    if (this.props.closeOnOutClick) {
      document.removeEventListener('mousedown', this.handleOutMouseClick);
      document.removeEventListener('touchstart', this.handleOutMouseClick);
    }
  }

  handleEscKeydown(e) {
    if (e.keyCode === 27) {
      if (!this.open) return;      
      if (this.modalContainer.parentElement === $(document.body).children().filter('div').last()[0]) {
        e.preventDefault();
        this.open = false;
        this.forceUpdate();
      }
    }
  }

  handleOutMouseClick(e) {
    if (!this.open) return;
    if (!this.modalContainer) return;
    if (this.modalContainer === e.target || $(this.modalContainer).find(e.target)[0]) return;
    if ($(e.modalContainer).parents().index(this.modalContainer.parentElement) < 0 && this.modalContainer.parentElement === $(document.body).children().filter('div').last()[0]) {
      this.open = false;
      this.forceUpdate();
    }
  }

  render() {
    return <Provider value={{
      close: () => {
        this.open = false;
        this.forceUpdate();
      },
      open: () => {
        this.open = true;
        this.forceUpdate();
      }
    }}>
      <Portal isFixedBody isFocusable isOpen={this.open} onOpen={node => {
          $(node).find('.modal-container').addClass('show');
          let elem = $(node).find('.modal');

          // if (elem) {
          //   let pseudo = $('<div></div>');
          //   pseudo.css('opacity', 0);
          //   pseudo.css('position', 'fixed');
          //   pseudo.css('background-color', 'rgba(0, 0, 0, 0.1)');
          //   $('body').append(pseudo);
          //   let el = $(elem);
          //   pseudo.velocity({
          //     opacity: [0, 1],
          //     left: [0, el.offset().left - $(window).scrollLeft()],
          //     right: [0, $(window).width() - (el.offset().left + el.outerWidth()) - $(window).scrollLeft()],
          //     top: [0, $(elem).offset().top - $(window).scrollTop()],
          //     bottom: [0, $(window).height() - (el.offset().top + el.outerHeight()) - $(window).scrollTop()]
          //   },
          //   {
          //     duration: 400,
          //     complete: function() {
          //       pseudo.remove();
          //     }
          //   });
          // }
        }}
        onClose={(node, callback) => {
          $(node).find('.modal-container').removeClass("show");
          setTimeout(callback, 400);
        }}>
        <div ref={ref => this.modalContainer = ReactDOM.findDOMNode(ref) as Element} className={"modal-container" + (this.props.type || " std")}>
          <div className={"modal" + (this.props.size ? (" modal-" + this.props.size) : "")}>
            {this.props.children}
          </div>
        </div>
      </Portal>
      {this.props.content}
    </Provider>
  }
}
