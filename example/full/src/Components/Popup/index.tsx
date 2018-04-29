import * as React from 'react'
import * as ReactDOM from 'react-dom';
import * as PropTypes from 'prop-types';
import { Context } from 'create-react-context';
import * as createContext from 'create-react-context';

import { Transition } from '../Animation';
import { Portal } from '../Private/Portal';
import { Clickable } from '../Clickable';
import { Icon } from '../Icon';
import { Link } from '../Link';

// export * from './PopupSelect';

export type ConsumerType = {
  close: () => void
  open: () => void
  reposition: () => void
  ref: (r: any) => void
}

export const { Provider, Consumer }: Context<ConsumerType> = (createContext as any)({
  close: () => {},
  open: () => {},
  reposition: () => {},
  ref: (r) => {}
});

export function PopupLink(props: {
  icon?: string
  children: any
  style?: any
  to: string
}) {
  return <Transition className="group" type="fade" appear>
      <Link className="item" activeClassName="active" to={props.to}>
      {props.icon && <Icon name={props.icon} style={props.style}/>}
      <span>{props.children}</span>
    </Link>
  </Transition>
}

export function PopupHeader(props: {
  children: any
  onClick?(e?: React.MouseEvent<HTMLDivElement>): Promise<void>
}) {
  return <Transition className="group" type="fade" appear>
    <Clickable className="header row" onClick={props.onClick}>
      {props.children}
    </Clickable>
  </Transition>
}

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

export const PopupItem = (props: PopupItemProps & {
  popup?: any
}) => {
  return <Consumer>{context =>
    <Transition className="group" type="fade" appear>
      <Clickable type={props.type} href={props.href} className={"item" + (props.active ? ' active' : '') + ' ' + (props.className || '')} onClick={async (e) => {
        if (props.onClick) await props.onClick(e);
        if (!props.notCloseOnClick) context.close();
      }}>
        {props.icon && <Icon name={props.icon} style={props.style}/>}
        {props.children}
      </Clickable>
    </Transition>

  }</Consumer>
}

export function PopupScroll(props: {
  children: any
}) {
  return <div className="select-container">
    {props.children}
  </div>
}

export function PopupInput(props: {
  icon?: string
  placeholder?: string
  help?: string
  type?: string
  className?: string
  value?: string
  onChange?: (e: any) => void
}) {
  return <Transition className="group" type="fade" appear>
    <div className={"input " + (props.className || ' ')}>
      <input type={props.type || "text"} placeholder={props.placeholder || "Filter"} value={props.value || ''} onChange={props.onChange}/>
      <Icon name={props.icon || "search"}/>
      <span className="right">{props.help || "Type to find"}</span>
    </div>
  </Transition>
}

export class PopupProps {
  onOpen?: (node: HTMLElement) => void
  onClose?: (node: HTMLElement, callback: () => void) => void

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

  // mounted: boolean = false

  // refs: {
  //   [key: string]: any;
  //   popup: HTMLElement;
  // }

  public static defaultProps = new PopupProps()
  scrollEvent: any
  timeout: any
  hideTimeout: any
  open: boolean = false
  mounted: boolean = false
  toObserve = {childList: true, attributes: true, subtree: true, attributeOldValue: true, attributeFilter: ['class', 'style']}
  mutationObserver: MutationObserver

  popup: Element
  element: Element

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  // onScroll(e) {
  //   // if (this.element && this.elementOrParentIsFixed(this.element)) {
  //     this.reposition();
  //   // }
  // }

  // componentWillMount() {
  //   if (process.env.MODE == "client") this.mutationObserver = new MutationObserver((mutationRecords) => {
  //     $.each(mutationRecords, (index, mutationRecord) => {
  //       if (mutationRecord.type === 'childList') {
  //         if (mutationRecord.addedNodes.length > 0) {
  //           //DOM node added, do something
  //           this.reposition();
  //         }
  //         else if (mutationRecord.removedNodes.length > 0) {
  //           //DOM node removed, do something
  //           this.reposition();
  //         }
  //       }
  //       else if (mutationRecord.type === 'attributes') {
  //         if (mutationRecord.attributeName === 'class') {
  //           //class changed, do something
  //           this.reposition();
  //         }
  //       }
  //     });
  //   });
  // }

  // closePortal() {
  //   if (this.refs.portal) {
  //     this.refs.portal.closePortal();
  //   }
  // }

  // openPortal() {
  //   if (this.refs.portal) {
  //     this.refs.portal.openPortal();
  //   }
  // }

  // lock = false
  // prevW: number = 0
  // prevH: number = 0

  // didUpdate(popupNode, elementNode) {
    // if (this.mutationObserver && this.popup) {
    //   this.mutationObserver.disconnect();
    // }

    // this.popup = ReactDOM.findDOMNode(this.refs.popup) as Element;
    // this.element = elementNode;

    // this.reposition();

    // if (this.mutationObserver && this.popup) {
    //   this.mutationObserver.observe(this.popup, this.toObserve)
    // }
  // }

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
    // if (this.lock) return;

    if (!this.mounted || !this.popup || !this.element) {
      return;
    }

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

    // if ((Math.abs(popup_height - this.prevH) > 1 || Math.abs(popup_width - this.prevW) > 1) && this.mounted) {
    //   setTimeout(this.reposition.bind(this), 1);
    // }
    // else {
    //   if (!this.show) {
    //     this.show = true;

    //     // this.popup.velocity({ translateY: [0, '-0.5rem'] }, { duration: 200, complete: () => {
    //     //   this.lock = false;
    //     // }, begin: () => {
    //     //   this.lock = true;
    //     // } });
    //   }
    //   $(this.popup).addClass('show');
    // }

    $(this.popup).offset({top: top, left: left});
    $(this.popup).addClass('show');

    // this.prevH = popup_height;
    // this.prevW = popup_width;
  }

  // handleWrapperInput(e) {
  //   if (!this.mounted) return;

  //   if (this.props.openOnInput && !this.refs.portal.state.active && !this.refs.portal.props.isHidden) {
  //     // e.preventDefault();
  //     // e.stopPropagation();
  //     window.clearTimeout(this.state.timer);
  //     this.state.timer = window.setTimeout(() => {
  //       if (this.refs.portal && this.refs.portal.mounted) this.refs.portal.openPortal();
  //     }, this.props.delay);
  //   }
  //   else if (this.props.closeOnInput && this.refs.portal.state.active) {
  //     // e.preventDefault();
  //     // e.stopPropagation();
  //     window.clearTimeout(this.state.timer);
  //     this.state.timer = window.setTimeout(() => {
  //       if (this.refs.portal && this.refs.portal.mounted) this.refs.portal.closePortal();
  //     }, this.props.timeout);
  //   }
  // }

  // handleWrapperClick(e) {
  //   if (!this.mounted) return;

  //   if (this.props.toggleOnClick && !this.refs.portal.props.isHidden) {
  //     // e.preventDefault();
  //     // e.stopPropagation();
  //     window.clearTimeout(this.state.timer);
  //     this.state.timer = window.setTimeout(() => {
  //       if (this.refs.portal && this.refs.portal.mounted) this.refs.portal.togglePortal();
  //     }, this.props.delay);
  //   }
  //   else if (this.props.openOnClick && !this.refs.portal.state.active && !this.refs.portal.props.isHidden) {
  //     // e.preventDefault();
  //     // e.stopPropagation();
  //     window.clearTimeout(this.state.timer);
  //     this.state.timer = window.setTimeout(() => {
  //       if (this.refs.portal && this.refs.portal.mounted) this.refs.portal.openPortal();
  //     }, this.props.delay);
  //   }
  //   else if (this.props.closeOnClick && this.refs.portal.state.active) {
  //     // e.preventDefault();
  //     // e.stopPropagation();
  //     window.clearTimeout(this.state.timer);
  //     this.state.timer = window.setTimeout(() => {
  //       if (this.refs.portal && this.refs.portal.mounted) this.refs.portal.closePortal();
  //     }, this.props.timeout);
  //   }
  // }

  // handleWrapperContextMenu(e) {
  //   if (!this.mounted) return;

  //   if (this.props.toggleOnContextMenu) {
  //     e.preventDefault();
  //     e.stopPropagation();
  //     window.clearTimeout(this.state.timer);
  //     this.state.timer = window.setTimeout(() => {
  //       if (this.refs.portal && this.refs.portal.mounted) this.refs.portal.togglePortal();
  //     }, this.props.delay);
  //   }
  //   else if (this.props.openOnContextMenu && !this.refs.portal.state.active) {
  //     e.preventDefault();
  //     e.stopPropagation();
  //     window.clearTimeout(this.state.timer);
  //     this.state.timer = window.setTimeout(() => {
  //       if (this.refs.portal && this.refs.portal.mounted) this.refs.portal.openPortal();
  //     }, this.props.delay);
  //   }
  //   else if (this.props.closeOnContextMenu && this.refs.portal.state.active) {
  //     e.preventDefault();
  //     e.stopPropagation();
  //     window.clearTimeout(this.state.timer);
  //     this.state.timer = window.setTimeout(() => {
  //       if (this.refs.portal && this.refs.portal.mounted) this.refs.portal.closePortal();
  //     }, this.props.timeout);
  //   }
  // }

  handleWrapperOver(e) {
    // if (!this.mounted) return;

    // if (this.props.closeOnOutMove) {
    //   window.clearTimeout(this.state.timer);
    //   this.state.timer = null;
    // }

    // if (this.props.openOnOverMove && !this.refs.portal.state.active) {
    //   window.clearTimeout(this.state.timer);
    //   this.state.timer = window.setTimeout(() => {
    //     if (this.refs.portal && this.refs.portal.mounted) this.refs.portal.openPortal();
    //   }, this.props.delay);
    // }
  }

  handleWrapperOut(e) {
    // if (!this.mounted) return;

    // if (this.props.openOnOverMove) {
    //   window.clearTimeout(this.state.timer);
    //   this.state.timer = null;
    // }

    // if (this.props.closeOnOutMove && this.refs.portal.state.active) {
    //   window.clearTimeout(this.state.timer);
    //   this.state.timer = window.setTimeout(() => {
    //     if (this.refs.portal && this.refs.portal.mounted) this.refs.portal.closePortal();
    //   }, this.props.timeout);
    // }
  }

  // handleWrapperFocus(e) {
  //   if (!this.mounted) return;

  //   if (this.props.openOnFocus && !this.refs.portal.state.active) {
  //     window.clearTimeout(this.state.timer);
  //     this.state.timer = window.setTimeout(() => {
  //       if (this.refs.portal && this.refs.portal.mounted) this.refs.portal.openPortal();
  //     }, this.props.delay);
  //   }
  // }

  // handleWrapperBlur(e) {
  //   if (!this.mounted) return;

  //   if (this.props.closeOnBlur && this.refs.portal.state.active) {
  //     window.clearTimeout(this.state.timer);
  //     this.state.timer = window.setTimeout(() => {
  //       if (this.refs.portal && this.refs.portal.mounted) this.refs.portal.closePortal();
  //     }, this.props.delay);
  //   }
  // }

  handleOutsideClick(e) {
    // if (!this.mounted) return;

    // if (this.props.closeOnOutsideClick && this.refs.portal.state.active) {
    //   // e.preventDefault();
    //   // e.stopPropagation();
    //   window.clearTimeout(this.state.timer);
    //   this.state.timer = window.setTimeout(() => {
    //     this.refs.portal.closePortal();
    //   }, this.props.timeout);
    // }
    // else if (this.props.onOutsideClick) {
    //   this.props.onOutsideClick(e)
    // }
  }

  componentDidUpdate() {
    if (this.open && this.mounted) this.reposition();
  }

  render() {
    var modifedActiveClassName = this.props.activeClassName + ' open';

    const consumer = {
      close: () => {
        this.open = false;
        if (this.mounted) this.forceUpdate();
      },
      open: () => {
        this.open = true;
        if (this.mounted) this.forceUpdate();
      },
      reposition: () => {
        this.reposition();
      },
      ref: (ref) => {
        this.element = ReactDOM.findDOMNode(ref) as Element;
      }
    }

    return <Provider value={consumer}>
      {this.props.element(consumer)}
      <Portal isOpen={this.open} onOpen={node => {
          {/* console.log($(node).find('.popup')); */}
          {/* $(node).velocity("stop");
          $(node).children().velocity("stop"); */}
          if (this.hideTimeout) clearTimeout(this.hideTimeout);

          // this.scrollEvent = this.onScroll.bind(this);
          // window.addEventListener("scroll", this.scrollEvent);
          
          this.reposition();
          $(node).find('.popup').addClass('show').velocity({ translateY: [0, "-0.5rem"] }, { duration: 200 });

          // $(node).velocity({ opacity: [1.0, 0] }, { duration: 200 });
          // $(node).find('.popup');
        }}
        onClose={(node, callback) => {
          // self.props.onClose();
          {/* $(node).children().velocity("stop"); */}
          {/* $(node).velocity("stop"); */}
          $(node).find('.popup').removeClass('show').velocity({ translateY: "-0.5rem" }, { duration: 300 });

          if (this.hideTimeout) clearTimeout(this.hideTimeout);
          this.hideTimeout = setTimeout(() => {
            callback();
          }, 300);

          // if (this.scrollEvent) {
          //   window.removeEventListener("scroll", this.scrollEvent);
          // }

          {/* $(node).velocity({ opacity: 0.0 }, { duration: 200, complete: _ => {
            callback();
          }}); */}
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