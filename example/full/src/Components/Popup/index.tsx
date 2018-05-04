import * as React from 'react'
import * as ReactDOM from 'react-dom';
import * as PropTypes from 'prop-types';
import { Context } from 'create-react-context';
import * as createContext from 'create-react-context';

import { Transition } from '../Animation';
import { Portal, Consumer as PortalConsumer } from '../Private/Portal';
import { Clickable } from '../Clickable';
import { Icon } from '../Icon';
import { Link } from '../Link';

export * from './PopupSelect';

export type ConsumerType = {
  close: () => void
  open: () => void
  reposition: () => void
  ref: (r: any) => void
  isOpen: () => boolean
  register: (item) => void
  unregister: (item) => void
}

export const { Provider, Consumer }: Context<ConsumerType> = (createContext as any)({
  close: () => {},
  open: () => {},
  reposition: () => {},
  ref: (r) => {},
  isOpen: () => false,
  register: (item) => {},
  unregister: (item) => {}
});

export const PopupLink = (props: {
  icon?: string
  children: any
  style?: any
  to: string
}) => <Transition className="group" type="fade" appear>
    <Link className="item" activeClassName="active" to={props.to}>
    {props.icon && <Icon name={props.icon} style={props.style}/>}
    <span>{props.children}</span>
  </Link>
</Transition>

export const PopupHeader = (props: {
  children: any
  onClick?(e?: React.MouseEvent<HTMLDivElement>): Promise<void>
}) => <Transition className="group" type="fade" appear>
  <Clickable className="header row" onClick={props.onClick}>
    {props.children}
  </Clickable>
</Transition>

export type PopupItemProps = {
  icon?: string
  children: any
  active?: boolean
  style?: any
  className?: string
  notCloseOnClick?: boolean
  type?: string
  href?: string
  onClick?(e?: React.MouseEvent<HTMLElement>): Promise<void> | void
}

export class PopupItem extends React.Component<PopupItemProps & {
  popup?: any
}> {
  element: Element

  consumer = {
    focus: () => $(this.element).focus(),
    isFocused: () => $(this.element).is(":focus")
  }

  render() {
    return <Consumer>{context =>
      <Transition className="group" type="fade" appear>
        <Clickable ref={ref => this.element = ReactDOM.findDOMNode(ref) as Element} onMount={() => {
          context.register(this.consumer);
        }} onUnmount={() => {
          context.unregister(this.consumer);
        }} type={this.props.type} href={this.props.href} className={"item" + (this.props.active ? ' active' : '') + ' ' + (this.props.className || '')} onClick={async (e) => {
          if (this.props.onClick) await this.props.onClick(e);
          if (!this.props.notCloseOnClick) context.close();
        }}>
          {this.props.icon && <Icon name={this.props.icon} style={this.props.style}/>}
          {this.props.children}
        </Clickable>
      </Transition>}
    </Consumer>
  }
}

export const PopupScroll = (props: {
  children: any
}) => <div className="select-container">
  {props.children}
</div>

export const PopupInput = (props: {
  icon?: string
  placeholder?: string
  help?: string
  type?: string
  className?: string
  value?: string
  onChange?: (e: any) => void
}) => <Transition className="group" type="fade" appear>
  <div className={"input " + (props.className || ' ')}>
    <input type={props.type || "text"} placeholder={props.placeholder || "Filter"} value={props.value || ''} onChange={props.onChange}/>
    <Icon name={props.icon || "search"}/>
    <span className="right">{props.help || "Type to find"}</span>
  </div>
</Transition>

export class PopupProps {
  onOpen?: () => void
  onClose?: () => void

  openOnOverMove?: boolean
  closeOnOutMove?: boolean
  closeOnOutClick?: boolean
  closeOnEsc?: boolean
  focusOnClose?: boolean
  isHidden?: boolean
  isFocusable?: boolean
  testing?: boolean

  element: (popup: ConsumerType) => any
  padding_window?: number = 10
  offset?: number = 5
  timeout?: number = 0
  activeClassName?: string = 'hover'
  delay?: number = 0
  minWidth?: string
  maxWidth?: string
  type?: 'select' | 'info' | 'error' = 'info'
  position?: 'top left' | 'top center' | 'top right' | 'bottom left' | 'bottom center' | 'bottom right' | 'left top' | 'left middle' | 'left bottom' | 'right top' | 'right middle' | 'right bottom'
}

export class Popup extends React.Component<PopupProps> {

  public static defaultProps = new PopupProps()
  scrollEvent: any
  timeout: any
  hideTimeout: any
  open: boolean = false
  mounted: boolean = false
  popup: Element
  element: Element
  items: any[] = []

  componentDidMount() {
    this.mounted = true;

    this.handleOutMouseClick = this.handleOutMouseClick.bind(this);
    this.handleEscKeydown = this.handleEscKeydown.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.handleOpenKeydown = this.handleOpenKeydown.bind(this);

    if (this.props.closeOnEsc) {
      document.addEventListener('keydown', this.handleEscKeydown);
    }

    if (this.props.closeOnOutClick) {
      document.addEventListener('mousedown', this.handleOutMouseClick);
      document.addEventListener('touchstart', this.handleOutMouseClick);
    }

    $(window).on('resize', this.onResize);
    window.addEventListener("scroll", this.onScroll);
  }

  componentWillUnmount() {
    this.mounted = false;

    if (this.props.closeOnEsc) {
      document.removeEventListener('keydown', this.handleEscKeydown);
    }

    if (this.props.closeOnOutClick) {
      document.removeEventListener('mousedown', this.handleOutMouseClick);
      document.removeEventListener('touchstart', this.handleOutMouseClick);
    }

    $(window).off('resize', this.onResize);
    window.removeEventListener("scroll", this.onScroll);
  }

  onResize(e) {
    this.reposition();
  }

  handleEscKeydown(e) {
    if (e.keyCode === 27) {
      if (!this.open) return;      
      if (this.popup.parentElement.parentElement === $(document.body).children().filter('div').last()[0]) {
        e.preventDefault();
        this.open = false;
        this.forceUpdate();
      }
    }
  }

  handleOutMouseClick(e) {
    if (!this.open) return;
    if (!this.popup) return;
    if (this.popup === e.target || $(this.popup).find(e.target)[0]) return;
    if ($(e.target).parents().index(this.popup.parentElement.parentElement) < 0 && this.popup.parentElement.parentElement === $(document.body).children().filter('div').last()[0]) {
      this.open = false;
      this.forceUpdate();
    }
  }

  onScroll(e) {
    if (this.element && this.elementOrParentIsFixed(this.element)) {
      this.reposition();
    }
  }

  elementOrParentIsFixed(element) {
    var $element = $(element);
    var $checkElements = $element.add($element.parents());
    var isFixed = false;
    $checkElements.each(function(){
      if ($(this).css("position") === "fixed") {
        isFixed = true;
        return false;
      }
    });
    return isFixed;
  }

  reposition() {
    if (!this.open || this.props.isHidden || !this.mounted || !this.popup || !this.element) return;

    let doc = document.documentElement;
    let scrollLeft = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
    let scrollTop = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);

    let min_x = scrollLeft;
    let min_y = scrollTop;

    let max_x = window.innerWidth + scrollLeft;
    let max_y = window.innerHeight + scrollTop;

    let this_x = this.element.getBoundingClientRect().left + scrollLeft;
    let this_y = this.element.getBoundingClientRect().top + scrollTop;

    let this_width = this.element.clientWidth;
    let this_height = this.element.clientHeight;

    let this_y_middle = this_y + this_height / 2;
    let this_x_middle = this_x + this_width / 2;

    let popup_width = this.popup.clientWidth;
    let popup_height = this.popup.clientHeight;

    let top = this_y;
    let left = this_x;

    let result_y = 'auto';
    let result_x = 'auto';

    if (this.props.position == 'top center') {
      top = this_y - popup_height - this.props.offset;
      left = this_x + this_width / 2 - popup_width / 2;

      result_y = "top";
      result_x = "center";

      if (left + popup_width > max_x - this.props.padding_window) {
        left = max_x - this.props.padding_window - popup_width;
        result_x = "left";
      }
      else if (left < min_x + this.props.padding_window) {
        left = min_x + this.props.padding_window;
        result_x = "right";
      }

      if (top < this_height + this.props.padding_window) {
        top = this_y + this_height + this.props.offset;
        result_y = "bottom";
      }
    }
    else if (this.props.position == 'top left') {
      top = this_y - popup_height - this.props.offset;
      left = this_x - popup_width + this_width;

      result_y = "top";
      result_x = "left";

      if (left + popup_width > max_x - this.props.padding_window) {
        left = max_x - this.props.padding_window - popup_width;
        result_x = "left";
      }
      else if (left < min_x + this.props.padding_window) {
        left = min_x + this.props.padding_window;
        result_x = "right";
      }

      if (top < this_height - this.props.padding_window) {
        top = this_y + this_height + this.props.offset;
        result_y = "bottom";
      }
    }
    else if (this.props.position == 'top right') {
      top = this_y - popup_height - this.props.offset;
      left = this_x;

      result_y = "top";
      result_x = "right";

      if (left + popup_width > max_x - this.props.padding_window) {
        left = max_x - this.props.padding_window - popup_width;
        result_x = "left";
      }
      else if (left < min_x + this.props.padding_window) {
        left = min_x + this.props.padding_window;
        result_x = "right";
      }

      if (top < this_height - this.props.padding_window) {
        top = this_y + this_height + this.props.offset;
        result_y = "bottom";
      }
    }
    else if (this.props.position == 'bottom center') {
      top = this_y + this_height + this.props.offset;
      left = this_x + this_width / 2 - popup_width / 2;

      result_y = "bottom";
      result_x = "center";

      if (left + popup_width > max_x - this.props.padding_window) {
        left = max_x - this.props.padding_window - popup_width;
        result_x = "left";
      }
      else if (left < min_x + this.props.padding_window) {
        left = min_x + this.props.padding_window;
        result_x = "right";
      }

      if (top + popup_height > max_y - this.props.padding_window && this_y - popup_height - this.props.offset >= 0 && this_y - popup_height - this.props.offset >= this_height - this.props.padding_window) {
        top = this_y - popup_height - this.props.offset;
        result_y = "top";
      }
    }
    else if (this.props.position == 'bottom left') {
      top = this_y + this_height + this.props.offset;
      left = this_x - popup_width + this_width;

      result_y = "bottom";
      result_x = "left";

      if (left + popup_width > max_x - this.props.padding_window) {
        left = max_x - this.props.padding_window - popup_width;
        result_x = "left";
      }
      else if (left < min_x + this.props.padding_window) {
        left = min_x + this.props.padding_window;
        result_x = "right";
      }

      if (top + popup_height > max_y - this.props.padding_window && this_y - popup_height - this.props.offset >= 0 && this_y - popup_height - this.props.offset >= this_height - this.props.padding_window) {
        top = this_y - popup_height - this.props.offset;
        result_y = "top";
      }
    }
    else if (this.props.position == 'bottom right') {
      top = this_y + this_height + this.props.offset;
      left = this_x;

      result_y = "bottom";
      result_x = "right";

      if (left + popup_width > max_x - this.props.padding_window) {
        left = max_x - this.props.padding_window - popup_width;
        result_x = "left";
      }
      else if (left < min_x + this.props.padding_window) {
        left = min_x + this.props.padding_window;
        result_x = "right";
      }

      if (top + popup_height > max_y - this.props.padding_window && this_y - popup_height - this.props.offset >= 0 && this_y - popup_height - this.props.offset >= this_height - this.props.padding_window) {
        top = this_y - popup_height - this.props.offset;
        result_y = "top";
      }
    }
    else if (this.props.position == 'left middle') {
      top = this_y + this_height / 2 - popup_height / 2;
      left = this_x - this_width - this.props.offset;

      result_y = "bottom";
      result_x = "center";

      // if (left + popup_width > max_x - this.props.padding_window) {
      //   left = max_x - this.props.padding_window - popup_width
      //   result_x = "left"
      // }
      // else if (left < min_x + this.props.padding_window) {
      //   left = min_x + this.props.padding_window
      //   result_x = "right"
      // }

      // if (top + popup_height > max_y - this.props.padding_window) {
      //   top = this_y - popup_height - this.props.offset
      //   result_y = "top"
      // }
    }
    else if (this.props.position == 'right middle') {
      top = this_y + this_height / 2 - popup_height / 2;
      left = this_x + this_width + this.props.offset;

      result_y = "bottom";
      result_x = "center";

      // if (left + popup_width > max_x - this.props.padding_window) {
      //   left = max_x - this.props.padding_window - popup_width
      //   result_x = "left"
      // }
      // else if (left < min_x + this.props.padding_window) {
      //   left = min_x + this.props.padding_window
      //   result_x = "right"
      // }

      // if (top + popup_height > max_y - this.props.padding_window) {
      //   top = this_y - popup_height - this.props.offset
      //   result_y = "top"
      // }
    }

    $(this.popup).css('min-width', this.props.minWidth || this_width);
    this.props.maxWidth && $(this.popup).css('max-width', this.props.maxWidth);

    $(this.popup).offset({top: top, left: left});
    $(this.popup).addClass('show');
  }

  handleWrapperOver() {
    if (this.props.closeOnOutMove) {
      window.clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (this.props.openOnOverMove) {
      window.clearTimeout(this.timeout);
      this.timeout = window.setTimeout(() => {
        this.open = true;
        if (this.mounted) this.forceUpdate();
      }, this.props.delay);
    }
  }

  handleWrapperOut() {
    if (this.props.openOnOverMove) {
      window.clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (this.props.closeOnOutMove) {
      window.clearTimeout(this.timeout);
      this.timeout = window.setTimeout(() => {
        this.open = false;
        if (this.mounted) this.forceUpdate();
      }, this.props.timeout);
    }
  }

  handleOutsideClick() {
    if (this.props.closeOnOutClick) {
      window.clearTimeout(this.timeout);
      this.timeout = window.setTimeout(() => {
        this.open = false;
        if (this.mounted) this.forceUpdate();
      }, this.props.timeout);
    }
  }

  componentDidUpdate() {
    if (this.open && this.mounted) this.reposition();
  }

  handleOpenKeydown(e) {
    if (e.keyCode === 40) {
      let finded = false;
      for (let i = 0; i < this.items.length; i++) {
        if (finded) {
          this.items[i].focus();
          e.preventDefault();
          break;
        }
        if (this.items[i].isFocused()) {
          finded = true;
        }
      }
    } else if (e.keyCode === 38) {
      let finded = false;
      for (let i = this.items.length - 1; i >= 0; i--) {
        if (finded) {
          this.items[i].focus();
          e.preventDefault();
          break;
        }
        if (this.items[i].isFocused()) {
          finded = true;
        }
      }
    }
  }

  render() {
    const isOpen = (this.open && !this.props.isHidden) || this.props.testing;

    const consumer = {
      close: () => {
        if (this.props.testing) {
          this.open = false;
          if (this.mounted) this.forceUpdate();
        } else if (this.props.timeout) {
          window.clearTimeout(this.timeout);
          this.timeout = window.setTimeout(() => {
            this.open = false;
            if (this.mounted) this.forceUpdate();
          }, this.props.timeout);
        } else {
          this.open = false;
          if (this.mounted) this.forceUpdate();
        }
      },
      open: () => {
        window.clearTimeout(this.timeout);
        if (this.props.testing) {
          this.open = true;
          if (this.mounted) this.forceUpdate();
        } else if (this.props.delay) {
          this.timeout = window.setTimeout(() => {
            this.open = true;
            if (this.mounted) this.forceUpdate();
          }, this.props.delay);
        } else {
          this.open = true;
          if (this.mounted) this.forceUpdate();
        }
      },
      reposition: () => {
        this.reposition();
      },
      ref: (ref) => {
        this.element = ReactDOM.findDOMNode(ref) as Element;
      },
      isOpen: () => isOpen,
      register: (element: Element) => this.items.push(element),
      unregister: (element: Element) => this.items.splice(this.items.indexOf(element), 1)
    }

    return <Provider value={consumer}>
      <Portal testing={this.props.testing} element={this.props.element(consumer)} isFocusable={this.props.isFocusable} isOpen={isOpen} onOpen={node => {
          if (this.hideTimeout) clearTimeout(this.hideTimeout);
          this.reposition();

          $(node).find('.popup').addClass('show');
          // .velocity({ translateY: [0, "-0.5rem"] }, { duration: 200 });
          this.props.onOpen && this.props.onOpen();

          if (this.items.length > 0) {
            this.items[0].focus();
          }

          document.addEventListener('keydown', this.handleOpenKeydown);
        }}
        onClose={(node, callback) => {
          $(node).find('.popup').removeClass('show');
          // .velocity({ translateY: "-0.5rem" }, { duration: 300 });
          if (this.hideTimeout) clearTimeout(this.hideTimeout);
          this.hideTimeout = setTimeout(() => {
            this.props.onClose && this.props.onClose();
            callback();
          }, 300);

          if (this.props.focusOnClose) {
            $(this.element).focus();
          }

          document.removeEventListener('keydown', this.handleOpenKeydown);
        }}>
        <div className="popup-back">
          <div ref={ref => this.popup = ReactDOM.findDOMNode(ref) as Element} className={"popup " + (this.props.type || '')} onMouseOver={this.handleWrapperOver.bind(this)} onMouseOut={this.handleWrapperOut.bind(this)}>
            {this.props.children}
          </div>
        </div>
      </Portal>
    </Provider>
  }
}