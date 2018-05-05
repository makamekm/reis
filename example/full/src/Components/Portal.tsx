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
  isFocusable?: boolean
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

  isActive() {
    return this.node === $(document.body).children().filter('div').last()[0];
  }

  isShow() {
    return this.props.isOpen && !this.props.isHide;
  }

  setTabIndexes() {
    if (this.props.isFocusable && this.isActive()) {
      $(document.body).children().filter((i, el) => el !== this.node).find('[tabindex]').attr('tabindex', "-1");
      $(this.node).find('[tabindex]').attr('tabindex', "0");
    }
  }

  unsetTabIndexes() {
    if (this.props.isFocusable && this.isActive()) {
      let nodes = $(document.body).children().filter((i, el) => el !== this.node);
      let nodesSingleFocusable = nodes.filter('.data-single-focsable');
      if (nodesSingleFocusable.length > 0) {
        $(nodesSingleFocusable[nodesSingleFocusable.length - 1]).find('[tabindex]').attr('tabindex', "0");
      } else {
        nodes.find('[tabindex]').attr('tabindex', "0");
      }
    }
  }
  
  render() {
    return <Consumer>{parent => {
      const isShow = this.isShow();

      let consumer = {
        level: this.props.isGhost ? parent.level + 1 : parent.level,
        isActive: () => this.isActive(),
        isShow: () => isShow,
        getNode: () => this.node
      }

      let body;

      if (isShow) {
        if (!this.node) {
          this.node = document.createElement('div');
          document.body.appendChild(this.node);
          if (this.props.isFocusable) $(this.node).addClass('.data-single-focsable');
        }

        body = ReactDOM.createPortal(
          <MountControlled onMount={() => {
            if (this.props.isFixedBody) {
              document.body.style.overflow = "hidden";
              // document.body.scroll = 'no';
            }
            this.setTabIndexes();
            if (this.props.onOpen) {
              if (this.props.testing) {
                this.props.onOpen(this.node);
              } else {
                setImmediate(() => this.props.onOpen(this.node));
              }
            }
          }} onUnmount={() => {
            let callback = () => {
              this.unsetTabIndexes();
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