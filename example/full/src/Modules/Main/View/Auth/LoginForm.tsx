import * as React from 'react';
import * as PropTypes from 'prop-types';

import * as Router from 'reiso/Modules/Router';
import * as Reducer from 'reiso/Modules/Reducer';

import * as UserReducer from '~/Modules/Authentication/Reducer/User';
import { InputForm } from '~/Components/Form';
import { Clickable } from '~/Components/Clickable';
import { Button } from '~/Components/Button';
import { Popup, PopupItem, PopupScroll, PopupInput, PopupLink, PopupHeader } from '~/Components/Popup';
import { Img } from '~/Components/Img';
import * as Header from '~/Modules/Main/Reducer/Header';

@Router.withRouter
@Reducer.Connect<{}, {}, Header.StateModel>(state => ({}), (dispatch, props) => ({
  setNotification: (title, message, type) => {
    dispatch(Header.setNotification({
      message,
      title,
      type: type || 'error'
    }));
  }
}))
export class LoginForm extends React.Component<{
  history?: any
  setNotification?: Function
}, {
  username: string
  password: string
  errors: { [name: string]: string[] }
}> {
  context: {
    auth: any
    modal: any
  }

  static contextTypes: React.ValidationMap<any> = {
    auth: PropTypes.object.isRequired,
    modal: PropTypes.object.isRequired
  }

  state = {
    username: '',
    password: '',
    errors: null
  }

  loading: boolean = false

  async login() {
    this.loading = true;
    this.setState({ errors: {} });
    try {
      await this.context.auth.login(this.state.username, this.state.password);
      this.loading = false;
      this.forceUpdate();
      location.href = location.href;
    }
    catch (e) {
      this.loading = false;

      let state;

      if (Array.isArray(e)) for (let err of e) {
        this.props.setNotification('Error', err.message);
        if (err.state) {
          state = state ? { ...state, ...err.state } : err.state;
        }
      } else {
        this.props.setNotification('Error', e.message);
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
    return (
      <div className="modal-content">
        <div className="block">
          <div className="row justify-content-between align-items-center">
            <div className="col-auto py-2 px-3">
              <span className="text large thin px-1">Sign in</span>
            </div>
            <div className="col text right py-2">
              <Button className="mr-2" size="sm" onClick={this.context.modal.close}><span className="fa fa-close"></span></Button>
            </div>
          </div>
        </div>
        <div className="block default px-1 pb-2 text center">
          <div className="row around-xs mx-2">
            <InputForm className="col-12 mt-1 px-2" label="Login:" placeholder="Username or Email" icon="at" errors={this.state.errors && this.state.errors.username} linkValue={{
              set: (value) => {
                this.setState({username: value})
              },
              get: () => this.state.username
            }} onKeyUp={e => {
              if (e.keyCode == 13 && !this.loading) {
                this.login();
              }
            }}/>
            <InputForm className="col-12 mt-3 px-2" label="Password:" type="password" placeholder="Password" icon="key" errors={this.state.errors && this.state.errors.password} linkValue={{
              set: (value) => {
                this.setState({password: value})
              },
              get: () => this.state.password
            }} onKeyUp={e => {
              if (e.keyCode == 13 && !this.loading) {
                this.login();
              }
            }}/>
          </div>
        </div>
        <div className="block default text right pt-3 px-3 pb-3">
          <Button className="mr-3 mb-1" size="md" onClick={this.context.modal.close}>
            <span className="fa fa-ban"></span>
            <span>Cancel</span>
          </Button>
          <Button type="primary" size="md" className={"mr-1 mb-1" + (this.loading ? ' loading' : '')} onClick={async e => {
            await this.login();
          }}>
            <span className="fa fa-bolt"></span>
            <span>Login</span>
          </Button>
        </div>
      </div>
    )
  }
}