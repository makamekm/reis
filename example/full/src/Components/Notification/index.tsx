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
  }

  componentWillUnmount() {
    this.mounted = false;
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
      <div className="notification-container std">
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
