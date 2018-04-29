import * as React from 'react'
import * as ReactDOM from 'react-dom';

import { Portal, PortalProps } from '../Private/Portal';
import { Button } from '../Button';

export type NotificationType = "error"

export class NotificationProps {
  level?: number = -2
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
  public hover: boolean = false

  handleOver() {
    this.hover = true;
    this.stopTimer();
  }

  handleLeave() {
    this.hover = false;
    this.startTimer();
  }

  startTimer() {
    if (!this.hover) {
      this.stopTimer();
      this.timeout = setTimeout(() => {
        // this.close();
      }, this.props.timeout);
    }
  }

  stopTimer() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  mounted: boolean = false

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    let content = null;

    if (this.props.type == "error") {
      content = (
        <div className="notification" onMouseOver={() => this.handleOver()} onMouseLeave={() => this.handleLeave()}>
          <div className="block error">
            <div className="row justify-content-between align-items-center">
              <div className="col-auto py-2 px-3">
                <span className="text medium thin px-2">
                  {this.props.title ? this.props.title : 'Error'}
                </span>
              </div>
              <div className="col text right py-2">
                {/* <Button className="mr-1" size="sm" onClick={async () => this.close()}><span className="fa fa-close"></span></Button> */}
              </div>
            </div>
          </div>
          <div className="block error px-4 pb-3 thin">
            {this.props.message}
          </div>
        </div>
      )
    }

    return null
    // return (
    //   <Portal ref="portal" level={this.props.level} className="notification-container std" isModal={false}
    //     onOpen={(node, elem) => {
    //       setTimeout(() => {
    //         $(node).children().addClass('show');
    //         this.startTimer();
    //       }, 0);
    //     }}
    //     beforeClose={(node, callback) => {
    //       $(node).children().removeClass('show');
    //       setTimeout(callback, 400);
    //     }}
    //     onClose={() => {
    //       this.props.onClose();
    //     }}>
    //     {content}
    //   </Portal>
    // )
  }
}
