import * as React from 'react';

import { Popup, Consumer } from '../Popup';
import { Icon } from '../Icon';
import { Flag } from '../Flag';
import { Clickable } from '../Clickable';
import { Link } from '../Link';

export const MenuHeader = (props: { image: string, id?: string }) => <div id={props.id} className="header" dangerouslySetInnerHTML={{ __html: props.image }}></div>

export const MenuSpace = (props: { id?: string }) => <div id={props.id} className="space"/>

export const MenuDivider = (props: { id?: string }) => <div id={props.id} className="divider"/>

export function MenuInput(props: {
  id?: string
  icon?: string
  placeholder?: string
  help?: string
  className?: string
}) {
  return <div className={"input " + (props.className || "")}>
    <input id={this.props.id} type="text" placeholder={props.placeholder || "Search"}/>
    <Icon name={props.icon || "search"}/>
    <span className="right">{props.help || "Type to send"}</span>
  </div>
}

export const MenuItem = (props: {
  id?: string
  icon?: string
  flag?: string
  children?: any
  onClick?(e?: React.MouseEvent<HTMLDivElement>): Promise<void>
}) => <Clickable id={props.id} className={"item " + (!props.children ? 'image' : '')} onClick={props.onClick}>
  {props.flag && <Flag name={props.flag}/>}
  {props.icon && <Icon name={props.icon}/>}
  {props.children && <span>{props.children}</span>}
</Clickable>

export const MenuLink = (props: {
  id?: string
  icon?: string
  flag?: string
  children?: any
  to?: string
  relative?: boolean
}) => <Link id={props.id} className={"item " + (!props.children ? 'image' : '')} to={props.to} activeClassName="active" relative={props.relative}>
  {props.flag && <Flag name={props.flag}/>}
  {props.icon && <Icon name={props.icon}/>}
  {props.children && <span>{props.children}</span>}
</Link>

export const MenuGroup = (props: {
  id?: string
  children: any
}) => <div id={props.id} className="group">
  {props.children}
</div>

export const MenuDrop = (props: {
  id?: string
  popupId?: string
  icon?: string
  flag?: string
  children: any
  text?: any
  position?: any
  minWidth?: string
  maxWidth?: string
  className?: string
}) => <Popup id={props.popupId} type="select" minWidth={props.minWidth} maxWidth={props.maxWidth} position={props.position || "bottom center"} timeout={300} element={
  popup => <Clickable id={props.id} onClick={async () => popup.open()} onMouseLeave={() => popup.close()} ref={ref => popup.ref(ref)} className={"item" + (!props.text ? ' image' : '') + (props.className ? (' ' + props.className) : '')}>
    {props.flag && <Flag name={props.flag}/>}
    {props.icon && <Icon name={props.icon}/>}
    {props.text && <span>{props.text}</span>}
  </Clickable>} closeOnOutClick closeOnEsc closeOnOutMove focusOnClose isFocusable>
  {props.children}
</Popup>

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