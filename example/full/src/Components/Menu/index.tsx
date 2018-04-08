import * as React from 'react';

import { Popup } from '../Popup';
import { Icon } from '../Icon';
import { Flag } from '../Flag';
import { Clickable } from '../Clickable';
import { Link } from '../Link';

export function MenuHeader(props) {
  return <div id={props.id} className="header" dangerouslySetInnerHTML={{ __html: props.image }}>
  </div>
}

export function MenuSpace(props) {
  return <div className="space"/>
}

export function MenuDivider(props) {
  return <div className="divider"/>
}

export function MenuInput(props: {
  icon?: string
  placeholder?: string
  help?: string
  className?: string
}) {
  return <div className={"input " + (props.className || "")}>
    <input id="searching" type="text" placeholder={props.placeholder || "Search"}/>
    <Icon name={props.icon || "search"}/>
    <span className="right">{props.help || "Type to send"}</span>
  </div>
}

export class MenuItem extends React.Component<{
  icon?: string
  flag?: string
  children?: any
  onClick?(e?: React.MouseEvent<HTMLDivElement>): Promise<void>
}> {
  render() {
    return <Clickable className={"item " + (!this.props.children ? 'image' : '')} onClick={this.props.onClick}>
      {this.props.flag && <Flag name={this.props.flag}/>}
      {this.props.icon && <Icon name={this.props.icon}/>}
      {this.props.children && <span>{this.props.children}</span>}
    </Clickable>
  }
}

export function MenuLink(props: {
  icon?: string
  flag?: string
  children?: any
  to?: string
  relative?: boolean
}) {
  return <Link className={"item " + (!props.children ? 'image' : '')} to={props.to} activeClassName="active" relative={props.relative}>
    {props.flag && <Flag name={props.flag}/>}
    {props.icon && <Icon name={props.icon}/>}
    {props.children && <span>{props.children}</span>}
  </Link>
}

export function MenuGroup(props: {
  children: any
}) {
  return <div className="group">
    {props.children}
  </div>
}

export function MenuDrop(props: {
  icon?: string
  flag?: string
  children: any
  text?: any
  position?: any
  minWidth?: string
  maxWidth?: string
  className?: string
}) {
  return <Popup bodyFixed type="select" minWidth={props.minWidth} maxWidth={props.maxWidth} position={props.position || "bottom right"} element={
    <div className={"item" + (!props.text ? ' image' : '') + (props.className ? (' ' + props.className) : '')}>
      {props.flag && <Flag name={props.flag}/>}
      {props.icon && <Icon name={props.icon}/>}
      {props.text && <span>{props.text}</span>}
    </div>
  } openOnFocus openOnOverMove closeOnOutsideClick closeOnBlur closeOnOutMove closeOnOutMovePop timeout={300}>
    {props.children}
  </Popup>
}

export class Menu extends React.Component<{
  sticky?: boolean
  children?: any
}> {

  isSticky: boolean = false
  event: any

  componentDidMount() {
    if (process.env.MODE == "client" && this.props.sticky) {
      this.event = this.onScroll.bind(this);
      window.addEventListener("scroll", this.event);
      this.isSticky = $(document).scrollTop() > 20;
      this.forceUpdate();
    }
  }

  componentWillReceiveProps(props) {
    if (process.env.MODE == "client" && !this.event && props.sticky) {
      this.event = this.onScroll.bind(this);
      window.addEventListener("scroll", this.event);
      this.isSticky = $(document).scrollTop() > 20;
    }
  }

  componentWillUnmount() {
    if (process.env.MODE == "client" && this.event) {
      window.removeEventListener("scroll", this.event);
    }
  }

  onScroll(e) {
    const newValue = $(document).scrollTop() > 20;
    if (newValue != this.isSticky) {
      this.isSticky = newValue;
      this.forceUpdate();
    }
  }

  render() {
    return !this.props.sticky ? (
      <div>
        <div className="top-line"/>
        <div className="glow-ghost-top-light"/>
        <div className="menu-container">
          <div className="menu">
            <div>
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div style={{
        position: 'fixed',
        zIndex: 1,
        top: 0,
        left: 0,
        right: 0
      }}>
        <div className="top-line" style={{opacity: this.isSticky ? 1 : 0}}/>
        <div className="glow-ghost-top-light"/>
        <div className={"menu-sticky-container" + (this.isSticky ? ' sticky' : '')}>
          <div className="menu">
            <div>
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    )
  }
}