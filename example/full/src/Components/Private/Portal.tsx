import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as PropTypes from 'prop-types';

// let CSSPropertyOperations = require('react-dom/lib/CSSPropertyOperations');

const KEYCODES = {
  ESCAPE: 27,
};

export class ConnectionPortal {
  open?: () => void
  close?: () => void
  render?: () => void
}

export class PortalProps {
  level?: number = 0
  closeOnEsc?: boolean
  isOpened?: boolean
  isHidden?: boolean
  isGhost?: boolean
  connectionPortal?: ConnectionPortal = {}
  onElementClick?: (e: any) => void
  onElementOver?: (e: any) => void
  onElementContextMenu?: (e: any) => void
  onElementInput?: (e: any) => void
  onElementOut?: (e: any) => void
  onElementFocus?: (e: any) => void
  onElementBlur?: (e: any) => void
  onOutsideClick?: (e: any) => void
  onKeyDown?: (e: any) => void
  onEsc?: (e: any) => void
  onOpen?: (node?: any, elem?: any) => void
  onUpdate?: () => void
  didUpdate?: (portal: HTMLElement, element: Element) => void
  beforeClose?: (node: HTMLElement, resetPortalState: () => void) => void
  onClose?: (node?: HTMLElement) => void
  isModal?: boolean
  className?: string
  style?: any
  element?: React.ReactElement<any>
  activeClassName?: string = ''
  elementProps?: any = {}
  outsideLevel?: number = 0
}

export class PortalState {
  portal?: any
  node?: HTMLElement
  active: boolean = false
  onResize?: (s: any) => void
  forceClosed?: boolean
  needToDestroy?: boolean
}

export class Portal extends React.Component<PortalProps, PortalState> {
  context: {
    portal: {
      level: Function
    }
  }

  static contextTypes: React.ValidationMap<any> = {
    portal: PropTypes.object,
  }

	static childContextTypes: React.ValidationMap<any> = {
		portal: PropTypes.object,
  }

  getChildContext() {
    return {
      portal: {
        level: () => this.level
      }
    }
  }

  level() {
    return this.props.level == 0 ? (this.context.portal ? (this.context.portal.level() + 1) : this.props.level) : this.props.level;
  }

  static portals: Portal[] = []

  state = new PortalState()

  public static defaultProps = new PortalProps()

  refs: {
    [key: string]: Element;
    elem: HTMLElement;
  }

  constructor(props, context) {
    super(props, context);
    this.handleWrapperClick = this.handleWrapperClick.bind(this);
    this.closePortal = this.closePortal.bind(this);
    this.tryExpectClose = this.tryExpectClose.bind(this);
    this.handleOutsideMouseClick = this.handleOutsideMouseClick.bind(this);
    this.handleWrapperOver = this.handleWrapperOver.bind(this);
    this.handleWrapperOut = this.handleWrapperOut.bind(this);
    this.handleWrapperFocus = this.handleWrapperFocus.bind(this);
    this.handleWrapperBlur = this.handleWrapperBlur.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.update = this.update.bind(this);
  }

  update() {
    if (this.props.didUpdate) {
      this.props.didUpdate(this.state.node, this.mounted && ReactDOM.findDOMNode(this.refs.elem) as Element);
    }
  }

  componentDidMount() {
    this.mounted = true;

    if (this.props.closeOnEsc) {
      document.addEventListener('keydown', this.handleKeydown);
    }

    document.addEventListener('mousedown', this.handleOutsideMouseClick);
    document.addEventListener('touchstart', this.handleOutsideMouseClick);

    this.state.onResize = (s) => {
      if (this.props.didUpdate) {
        this.props.didUpdate(this.state.node, this.mounted && ReactDOM.findDOMNode(this.refs.elem) as Element);
      }
    }

    $(window).on('resize', this.state.onResize);
    // $(this.mounted && ReactDOM.findDOMNode(this.refs.elem)).parents().on('scroll', this.state.onResize);

    if (this.props.isOpened) {
      this.openPortal();
    }

    Portal.portals.push(this);

    this.props.connectionPortal.close = () => {
      this.closePortal()
    }

    this.props.connectionPortal.open = () => {
      if (!this.state.active) {
        this.openPortal();
      }
      else {
        this.renderPortal();
      }
    }

    this.props.connectionPortal.render = () => {
      this.renderPortal();
    }
  }

  componentWillReceiveProps(newProps) {
    // portal's 'is open' state is handled through the prop isOpened
    if (typeof newProps.isOpened !== 'undefined') {
      if (newProps.isOpened) {
        if (this.state.active) {
          this.renderPortal(newProps);
        } else {
          this.openPortal(newProps);
        }
      }
      if (!newProps.isOpened && this.state.active) {
        this.closePortal();
      }
    }

    // portal handles its own 'is open' state
    if (typeof newProps.isOpened === 'undefined' && this.state.active) {
      this.renderPortal(newProps);
    }

    // if (typeof newProps.isHidden !== 'undefined') {
    if ((newProps.isHidden !== this.props.isHidden || newProps.isGhost) && this.state.active) {
      this.renderPortal(newProps);
    }
    // }

    newProps.connectionPortal.close = () => {
      this.closePortal()
    }

    newProps.connectionPortal.open = () => {
      if (!this.state.active) {
        this.openPortal(newProps);
      }
      else {
        this.renderPortal(newProps);
      }
    }

    newProps.connectionPortal.render = () => {
      this.renderPortal(newProps);
    }
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   return shallowCompare(this, nextProps, nextState);
  // }

  mounted: boolean = false

  componentWillUnmount() {
    this.state.needToDestroy = true;

    this.closePortal();

    this.mounted = false;
  }

  destroy() {
    Portal.portals.splice(Portal.portals.indexOf(this), 1);

    if (this.props.closeOnEsc) {
      document.removeEventListener('keydown', this.handleKeydown);
    }

    document.removeEventListener('mouseup', this.handleOutsideMouseClick);
    document.removeEventListener('touchstart', this.handleOutsideMouseClick);

    $(window).off('resize', this.state.onResize);
    // $(this.mounted && ReactDOM.findDOMNode(this.refs.elem)).parents().off('scroll', this.state.onResize);

    // if (this.state.active) this.closePortal();
  }

  handleWrapperClick(e) {
    // e.preventDefault();
    // e.stopPropagation();
    if (this.props.element.props.onClick) {
      this.props.element.props.onClick(e)
    }

    if (this.props.onElementClick) {
      this.props.onElementClick(e);
    }
    // if (this.state.active) {
    //   this.closePortal();
    // }
    // else {
    //   this.openPortal();
    // }
  }

  handleWrapperOver(e) {
    // e.preventDefault();
    // e.stopPropagation();
    // if (this.state.active) { return; }
    if (this.props.onElementOver) {
      this.props.onElementOver(e);
    }
    // this.openPortal();
  }

  handleContextMenu(e) {
    // e.preventDefault();
    // e.stopPropagation();
    // if (this.state.active) { return; }
    if (this.props.onElementContextMenu) {
      this.props.onElementContextMenu(e);
    }
    // this.openPortal();
  }

  handleWrapperInput(e) {
    // e.preventDefault();
    // e.stopPropagation();
    // if (!this.state.active) { return; }
    if (this.props.onElementInput) {
      this.props.onElementInput(e);
    }
    // this.closePortal();
  }

  handleWrapperOut(e) {
    // e.preventDefault();
    // e.stopPropagation();
    // if (!this.state.active) { return; }
    if (this.props.onElementOut) {
      this.props.onElementOut(e);
    }
    // this.closePortal();
  }

  handleWrapperFocus(e) {
    // if (this.state.active) { return; }
    // this.openPortal();
    if (this.props.onElementFocus) {
      this.props.onElementFocus(e);
    }
  }

  handleWrapperBlur(e) {
    // if (!this.state.active) { return; }
    // this.closePortal();
    if (this.props.onElementBlur) {
      this.props.onElementBlur(e);
    }
  }

  togglePortal() {
    if (this.state.active) {
      this.closePortal();
    }
    else {
      this.openPortal();
    }
  }

  openPortal(props = this.props) {
    let isGhost = (props.isGhost && !!Portal.portals.find(item => item.state.active && item !== this))

    if (props.isHidden || isGhost) {
      if (this.state.active) {
        if (!this.state.forceClosed) {
          this.closePortal(false);
        }
        this.state.forceClosed = true;
      }
      else {
        this.state.forceClosed = true;
        this.state.active = true;
        this.forceUpdate();
      }
      return;
    }

    this.state.active = true;
    this.forceUpdate();

    this.tryExpectClose();

    this.renderPortal(props);

    if (this.state.node && this.props.onOpen) this.props.onOpen(this.state.node, this.mounted && ReactDOM.findDOMNode(this.refs.elem));

    if (this.props.didUpdate) {
      this.props.didUpdate(this.state.node, this.mounted && ReactDOM.findDOMNode(this.refs.elem) as Element);
    }

    if (this.props.isModal) {
      document.body.style.overflow = "hidden";
      // document.body.scroll = 'no';
    }
  }

  closePortal(isUnmounted = true) {
    const resetPortalState = () => {
      if (this.props.onClose) this.props.onClose(this.state.node);

      if (this.state.node) {
        ReactDOM.unmountComponentAtNode(this.state.node);
        document.body.removeChild(this.state.node);
      }
      this.state.portal = null;
      this.state.node = null;

      Portal.portals.forEach(item => {
        if (item.state.active) item.renderPortal()
      })
    };

    if (this.state.active) {
      if (isUnmounted) {
        this.state.active = false;
        this.forceUpdate();
      }

      if (this.props.beforeClose) {
        this.props.beforeClose(this.state.node, resetPortalState);
      } else {
        resetPortalState();
      }
    }

    if (this.props.didUpdate) {
      this.props.didUpdate(this.state.node, this.mounted && ReactDOM.findDOMNode(this.refs.elem) as Element);
    }

    if (this.props.isModal) {
      // document.body.scroll = 'yes';
      document.body.style.overflow = null;
    }

    if (this.state.needToDestroy) {
      this.destroy();
    }
  }

  renderPortal(props = this.props) {
    let isGhost = (props.isGhost && !!Portal.portals.find(item => item.state.active && item !== this))

    if (props.isHidden || isGhost) {
      if (this.state.active) {
        if (!this.state.forceClosed) {
          this.closePortal(false);
        }
        this.state.forceClosed = true;
      }
      else {
        this.state.forceClosed = true;

        this.state.active = true;
        this.forceUpdate();
      }
      return;
    }
    else if (this.state.forceClosed) {
      this.state.forceClosed = false;

      this.openPortal(props);
      return;
    }
    else if (!this.state.active) {
      return;
    }

    if (!this.state.node) {
      this.state.node = document.createElement('div');
      // if (props.className) {
      //   this.state.node.className = props.className;
      // }
      // if (props.style) {
      //   CSSPropertyOperations.setValueForStyles(this.state.node, props.style);
      // }
      document.body.appendChild(this.state.node);
    }

    // let children = props.children as React.ReactElement<any>;

    let children = <div className={props.className} style={props.style}>{props.children}</div>;

    // if (typeof props.children.type === 'function') {
    //   children = React.cloneElement(props.children, { closePortal: this.closePortal });
    // }

    this.state.portal = ReactDOM.unstable_renderSubtreeIntoContainer(
      this,
      children,
      this.state.node,
      this.props.onUpdate
    );

    if (this.props.didUpdate) {
      this.props.didUpdate(this.state.node, this.mounted && ReactDOM.findDOMNode(this.refs.elem) as Element);
    }
  }

  tryExpectClose() {
    if (this.level() > -2) Portal.portals.forEach(portal => {
      if (this !== portal) {
        if ((this.level() <= portal.level()) && portal.level() >= 0) {
          portal.closePortal();
        }
      }
    });
  }

  handleKeydown(e) {
    if (this.state.node !== $(document.body).children().filter('div').last()[0]) {
      return;
    }

    if (this.props.closeOnEsc && e.keyCode === KEYCODES.ESCAPE && this.state.active) {
      if (e.target) {
        $(e.target).blur();
      }

      this.closePortal();
    }

    if (this.props.onEsc && e.keyCode === KEYCODES.ESCAPE && this.state.active) {
      this.props.onEsc(e);
    }

    if (this.props.onKeyDown) {
      this.props.onKeyDown(e);
    }
  }

  recurseChildLevel(level: number, elem: JQuery, parent: JQuery): number {
    if (elem[0] === parent[0]) {
      return level;
    }
    return this.recurseChildLevel(level + 1, elem.parent(), parent);
  }

  getChildLevel(elem: JQuery, parent: JQuery): number {
    if (elem.parents().index(parent) > -1) {
      return this.recurseChildLevel(0, elem, parent);
    }
    return -1;
  }

  handleOutsideMouseClick(e) {
    if (!this.state.active) { return; }

    if (ReactDOM.findDOMNode(this) === e.target || $(ReactDOM.findDOMNode(this)).find(e.target)[0]) { return; }

    if (this.getChildLevel($(e.target), $(this.state.node)) > this.props.outsideLevel || (this.state.node !== $(document.body).children().filter('div').last()[0])) {
      return;
    }

    if (this.props.onOutsideClick) {
      this.props.onOutsideClick(e);
    }
  }

  componentDidUpdate() {
    if (this.props.didUpdate) {
      this.props.didUpdate(this.state.node, this.mounted && ReactDOM.findDOMNode(this.refs.elem) as Element);
    }
  }

  getElement() {
    if (this.props.element) {
      var className = this.props.element.props.className;
      if (this.state.active && this.props.activeClassName) {
        className = className + " " + this.props.activeClassName;
      }
      delete this.props.elementProps.elementProps;
      delete this.props.elementProps.outsideLevel;
      return React.cloneElement(this.props.element, { ...this.props.elementProps, ref: 'elem', className: className, onClick: e => {
        this.handleWrapperClick(e);
        if (this.props.elementProps.onClick) this.props.elementProps.onClick(e);
      }, onFocus: e => {
        this.handleWrapperFocus(e);
        if (this.props.elementProps.onFocus) this.props.elementProps.onFocus(e);
      }, onBlur: e => {
        this.handleWrapperBlur(e);
        if (this.props.elementProps.onBlur) this.props.elementProps.onBlur(e);
      }, onMouseOver: e => {
        this.handleWrapperOver(e);
        if (this.props.elementProps.onMouseOver) this.props.elementProps.onMouseOver(e);
      }, onMouseOut: e => {
        this.handleWrapperOut(e);
        if (this.props.elementProps.onMouseOut) this.props.elementProps.onMouseOut(e);
      }, onInput: e => {
        this.handleWrapperInput(e);
        if (this.props.elementProps.onInput) this.props.elementProps.onInput(e);
      }, onTouchStart: e => {
        this.handleWrapperOver(e);
        if (this.props.elementProps.onTouchStart) this.props.elementProps.onTouchStart(e);
      }, onTouchEnd: e => {
        this.handleWrapperOut(e);
        if (this.props.elementProps.onTouchEnd) this.props.elementProps.onTouchEnd(e);
      }, onContextMenu: e => {
        this.handleContextMenu(e);
        if (this.props.elementProps.onContextMenu) this.props.elementProps.onContextMenu(e);
      } });
    }
    return null;
  }

  render() {
    return this.getElement();
  }
}