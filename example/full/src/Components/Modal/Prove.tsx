import * as React from 'react';
import * as PropTypes from 'prop-types';

import { Button } from '../Button';

export type ProveModalType = "default" | "empty" | "error";

export class ProveModal extends React.Component<{
  title?: string
  onProve?: () => Promise<void | boolean>
  onApprove?: () => Promise<void | boolean>
  type: ProveModalType
}, {}> {
  context: {
    modal: any
  }

  static contextTypes: React.ValidationMap<any> = {
    modal: PropTypes.object.isRequired
  }

  render() {
    return (
      <div className="modal-content">
        <div className={'block ' + this.props.type}>
          <div className="row justify-content-between align-items-center">
            <div className="col-auto py-2 px-3">
              <span className="text medium thin head px-10">{this.props.title}</span>
            </div>
            <div className="col text right py-2">
              <Button className="mr-2" size="sm" onClick={this.context.modal.close}><span className="fa fa-close"></span></Button>
            </div>
          </div>
        </div>
        <div className={'block ' + this.props.type + " px-1 pb-2 text regular thin center"}>
          {this.props.children}
        </div>
        <div className={'block ' + this.props.type + " text right pt-3 px-3 pb-3"}>
          <Button className="mr-3 mb-1" size="md" onClick={this.context.modal.close}>
            <span className="fa fa-ban"></span>
            <span>Cancel</span>
          </Button>
          <Button className="mr-1 mb-1" type="primary" size="md" onClick={async e => {
            if (this.props.onProve) {
              let result = await this.props.onProve();
              if (result !== false) this.context.modal.close();
            }
          }}>
            <span className="fa fa-bolt"></span>
            <span>{"Do it"}</span>
          </Button>
        </div>
      </div>
    )
  }
}