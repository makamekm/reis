import * as React from 'react';
import * as PropTypes from 'prop-types';

import { Consumer } from '~/Components/Modal';
import { Button } from '../Button';

export type ProveModalType = "default" | "empty" | "error";

export const ProveModal = (props: {
  title?: string
  onProve?: () => Promise<void | boolean>
  onApprove?: () => Promise<void | boolean>
  type?: ProveModalType
  children: any
}) => {
  return <Consumer>
    {context => 
      <div className="modal-content">
        <div className={'block ' + (props.type || "default")}>
          <div className="row justify-content-between align-items-center">
            <div className="col-auto py-2 px-3">
              <span className="text medium thin head px-10">{props.title}</span>
            </div>
            <div className="col text right py-2">
              <Button className="mr-2" size="sm" onClick={async () => context.close()}><span className="fa fa-close"></span></Button>
            </div>
          </div>
        </div>
        <div className={'block ' + props.type + " px-1 pb-2 text regular thin center"}>
          {props.children}
        </div>
        <div className={'block ' + props.type + " text right pt-3 px-3 pb-3"}>
          <Button className="mr-3 mb-1" size="md" onClick={async () => context.close()}>
            <span className="fa fa-ban"></span>
            <span>Cancel</span>
          </Button>
          <Button className="mr-1 mb-1" type="primary" size="md" onClick={async e => {
            if (props.onProve) {
              let result = await props.onProve();
              if (result !== false) context.close();
            }
          }}>
            <span className="fa fa-bolt"></span>
            <span>{"Do it"}</span>
          </Button>
        </div>
      </div>
    }
  </Consumer>
}