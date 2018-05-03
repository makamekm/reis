import * as React from 'react';
import * as PropTypes from 'prop-types';

import * as Router from 'reiso/Modules/Router';
import * as Reducer from 'reiso/Modules/Reducer';

import * as UserReducer from '~/Modules/Authentication/Reducer/User';
import { InputForm } from '~/Components/Form';
import { Button } from '~/Components/Button';
import { Modal, Consumer as ModalConsumer, ConsumerType as ModalConsumerType } from '~/Components/Modal';
import { Consumer, ConsumerType } from '../Html';
import * as Header from '~/Modules/Main/Reducer/Header';

@Router.withRouter
export class LoginForm extends React.Component<{
  children: (modal: ModalConsumerType) => any
}> {
  state: {
    username: string
    password: string
    errors: { [name: string]: string[] }
  } = {
      username: '',
      password: '',
      errors: null
    }

  loading: boolean = false

  async login(context: ConsumerType) {
    this.loading = true;
    this.setState({ errors: {} });
    try {
      await context.auth.login(this.state.username, this.state.password);
      this.loading = false;
      this.forceUpdate();
      location.href = location.href;
    }
    catch (e) {
      this.loading = false;

      let state;

      if (Array.isArray(e)) for (let err of e) {
        context.setNotification('Error', err.message);
        if (err.state) {
          state = state ? { ...state, ...err.state } : err.state;
        }
      } else {
        context.setNotification('Error', e.message);
        if (e.state) {
          state = e.state;
        }
      }

      state ? this.setState({
        errors: state
      }) : this.setState({
        errors: {}
      });
    }
  }

  render() {
    return <Modal size="small" content={
      <ModalConsumer>
        {modal => this.props.children(modal)}
      </ModalConsumer>}>
      <Consumer>
        {context =>
          <ModalConsumer>
            {modalContext =>
              <div className="modal-content">
                <div className="block">
                  <div className="row justify-content-between align-items-center">
                    <div className="col-auto py-2 px-3">
                      <span className="text large thin px-1">Sign in</span>
                    </div>
                    <div className="col text right py-2">
                      <Button className="mr-2" size="sm" onClick={async () => modalContext.close()}><span className="fa fa-close"></span></Button>
                    </div>
                  </div>
                </div>
                <div className="block default px-1 pb-2 text center">
                  <div className="row around-xs mx-2">
                    <InputForm className="col-12 mt-1 px-2" label="Login:" placeholder="Username or Email" icon="at" errors={this.state.errors && this.state.errors.username} linkValue={{
                      set: (value) => this.setState({ username: value }),
                      get: () => this.state.username
                    }} onEnterKey={async () => {
                      if (!this.loading) {
                        this.login(context);
                      }
                    }}/>
                    <InputForm className="col-12 mt-3 px-2" label="Password:" type="password" placeholder="Password" icon="key" errors={this.state.errors && this.state.errors.password} linkValue={{
                      set: (value) => this.setState({ password: value }),
                      get: () => this.state.password
                    }} onEnterKey={async () => {
                      if (!this.loading) {
                        this.login(context);
                      }
                    }}/>
                  </div>
                </div>
                <div className="block default text right pt-3 px-3 pb-3">
                  <Button className="mr-3 mb-1" size="md" onClick={async () => modalContext.close()}>
                    <span className="fa fa-ban"></span>
                    <span>Cancel</span>
                  </Button>
                  <Button type="primary" size="md" className={"mr-1 mb-1" + (this.loading ? ' loading' : '')} onClick={async e => {
                    await this.login(context);
                  }}>
                    <span className="fa fa-bolt"></span>
                    <span>Login</span>
                  </Button>
                </div>
              </div>
            }
          </ModalConsumer>
        }
      </Consumer>
    </Modal>
  }
}