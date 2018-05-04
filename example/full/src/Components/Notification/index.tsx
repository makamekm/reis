import * as React from 'react'
import * as ReactDOM from 'react-dom';

import { Portal, PortalProps } from '../Private/Portal';
import { Button } from '../Button';

export type NotificationType = "error"

export class NotificationProps {
  timeout?: number = 2000
  type: NotificationType
  title?: string
  message: string
  more?: string
  onClose: () => void
}

export class Notification extends React.Component<NotificationProps, {}> {

  public static defaultProps = new NotificationProps()

  public timeout: any = null
  public open: boolean = true
  mounted: boolean = false
  container: Element

  startTimer() {
    this.stopTimer();
    this.timeout = setTimeout(() => {
      this.open = false;
      if (this.mounted) this.forceUpdate();
    }, this.props.timeout);
  }

  stopTimer() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  componentDidMount() {
    this.mounted = true;

    this.handleEscKeydown = this.handleEscKeydown.bind(this);
    this.handleOutMouseClick = this.handleOutMouseClick.bind(this);

    document.addEventListener('keydown', this.handleEscKeydown);
    document.addEventListener('mousedown', this.handleOutMouseClick);
    document.addEventListener('touchstart', this.handleOutMouseClick);
  }

  componentWillUnmount() {
    this.mounted = false;

    document.removeEventListener('keydown', this.handleEscKeydown);
    document.removeEventListener('mousedown', this.handleOutMouseClick);
    document.removeEventListener('touchstart', this.handleOutMouseClick);
  }

  handleEscKeydown(e) {
    if (e.keyCode === 27) {
      if (!this.open) return;      
      if (this.container.parentElement === $(document.body).children().filter('div').last()[0]) {
        e.preventDefault();
        this.open = false;
        this.forceUpdate();
      }
    }
  }

  handleOutMouseClick(e) {
    if (!this.open) return;
    if (!this.container) return;
    if (this.container === e.target || $(this.container).find(e.target)[0]) return;
    if ($(e.container).parents().index(this.container.parentElement) < 0 && this.container.parentElement === $(document.body).children().filter('div').last()[0]) {
      this.open = false;
      this.forceUpdate();
    }
  }

  render() {
    return <Portal isOpen={this.open}
      onOpen={(node) => {
        $(node).find('.notification-container').addClass('show');
        this.startTimer();
      }}
      onClose={(node, callback) => {
        $(node).children().removeClass('show');
        setTimeout(() => {
          callback();
          this.props.onClose();
        }, 400);
      }}>
      <div ref={ref => this.container = ReactDOM.findDOMNode(ref) as Element} className="notification-container std">
        <div className="notification" onMouseEnter={() => this.stopTimer()} onMouseLeave={() => this.startTimer()}>
          <div className="block error">
            <div className="row justify-content-between align-items-center">
              <div className="col-auto py-2 px-3">
                <span className="text medium thin px-2">
                  {this.props.title ? this.props.title : 'Error'}
                </span>
              </div>
              <div className="col text right py-2">
                <Button className="mr-1" size="sm" onClick={async () => {
                  this.open = false;
                  this.forceUpdate();
                  }}><span className="fa fa-close"></span></Button>
              </div>
            </div>
          </div>
          <div className="block error px-4 pb-3 thin">
            {this.props.message}
          </div>
        </div>
      </div>
    </Portal>
  }
}
