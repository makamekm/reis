import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as PropTypes from 'prop-types';
import { Context } from 'create-react-context';
import * as createContext from 'create-react-context';
import * as ReactTransition from 'react-transition-group';

export type ConsumerType = {
  level: number
  isActive: () => boolean
  isShow: () => boolean
  getNode: () => HTMLDivElement
}

export const { Provider, Consumer }: Context<ConsumerType> = (createContext as any)({
  level: -1,
  isActive: () => false,
  isShow: () => false,
  getNode: () => null
});

export class PortalProps {
  level?: number = 0
  isGhost?: boolean
  isOpen?: boolean
  isHide?: boolean
  isFixedBody?: boolean
  onOpen?: (node: HTMLElement) => void
  onClose?: (node: HTMLElement, callback: () => void) => void
  children: any
  element?: any
  testing?: boolean
}

export class MountControlled extends React.Component<{
  onMount?: () => void
  onUnmount?: () => void
}> {

  componentDidMount() {
    if (this.props.onMount) this.props.onMount();
  }
  
  componentWillUnmount() {
    if (this.props.onMount) {
      this.props.onUnmount();
    }
  }

  render() {
    return this.props.children;
  }
}

export class Portal extends React.Component<PortalProps> {
  public static defaultProps: PortalProps = new PortalProps()
  node: HTMLDivElement
  
  render() {
    return <Consumer>{parent => {
      const isShow = this.props.isOpen && !this.props.isHide;

      let consumer = {
        level: this.props.isGhost ? parent.level + 1 : parent.level,
        isActive: () => this.node === $(document.body).children().filter('div').last()[0],
        isShow: () => isShow,
        getNode: () => this.node
      }

      let body;

      if (isShow) {
        if (!this.node) {
          this.node = document.createElement('div');
          document.body.appendChild(this.node);
        }

        body = ReactDOM.createPortal(
          <MountControlled onMount={() => {
            if (this.props.isFixedBody) {
              document.body.style.overflow = "hidden";
              // document.body.scroll = 'no';
            }
            if (this.props.onOpen) {
              if (this.props.testing) {
                this.props.onOpen(this.node);
              } else {
                setImmediate(() => this.props.onOpen(this.node));
              }
            }
          }} onUnmount={() => {
            let callback = () => {
              this.node.parentNode.removeChild(this.node);
              this.node = null;
              if (this.props.isFixedBody) {
                document.body.style.overflow = null;
                // document.body.scroll = 'yes';
              }
            }
            if (this.props.onClose) {
              if (this.props.testing) {
                this.props.onClose(this.node, () => {});
                callback();
              } else {
                let cloned = $(this.node).children().clone()[0];
                if (cloned) this.node.appendChild(cloned);
                setImmediate(() => this.props.onClose(this.node, callback));
              }
            } else {
              callback();
            }
          }}>{this.props.children}</MountControlled>,
          this.node
        );
      }

      return <Provider value={consumer}>
        {this.props.element}
        {body}
      </Provider>
    }}</Consumer>
  }
}