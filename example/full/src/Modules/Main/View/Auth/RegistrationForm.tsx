import * as React from 'react';
import * as PropTypes from 'prop-types';

import * as Router from 'reiso/Modules/Router';
import * as Reducer from 'reiso/Modules/Reducer';

import * as UserReducer from '~/Modules/Authentication/Reducer/User';
// import { InputForm } from '~/Components/Form';
import { Clickable } from '~/Components/Clickable';
import { Button } from '~/Components/Button';
import { Popup, PopupItem, PopupScroll, PopupInput, PopupLink, PopupHeader } from '~/Components/Popup';
import { Img } from '~/Components/Img';
import { Modal, Consumer as ModalConsumer, ConsumerType as ModalConsumerType } from '~/Components/Modal';
import { Consumer } from '../Html';
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
export class RegistrationForm extends React.Component<{
  history?: any
  setNotification?: Function
  children: (modal: ModalConsumerType) => any
}> {
  state: {
    username: string
    email: string
    password: string
    password2: string
    avatar_file: any
    errors: { [name: string]: string[] }
  } = {
    username: '',
    email: '',
    password: '',
    password2: '',
    avatar_file: null,
    errors: null
  };

  render() {
    return <Modal size="medium" content={
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
                      <span className="text large thin px-1">Sign up</span>
                    </div>
                    <div className="col text right py-2">
                      <Button className="mr-2" size="sm" onClick={async () => modalContext.close()}><span className="fa fa-close"></span></Button>
                    </div>
                  </div>
                </div>
                <div className="block default px-1 pb-2 pt-3 text center">
                  {/* <Popup type="error" position="top center" isHide={!(this.state.errors && this.state.errors.avatar)} element={
                    <label>
                      <Img className="profile-img file big" file={this.state.avatar_file} src="/images/avatar-empty.png"/>
                      <input accept={'image/jpeg,image/png'} type="file" onChange={({ target }) => {
                        this.setState({ avatar_file: target.files[0] });
                      }}/>
                    </label>
                  } openOnFocus openOnOverMove closeOnOutsideClick closeOnBlur closeOnOutMove closeOnOutMovePop timeout={300}>
                    {this.state.errors && this.state.errors.avatar && this.state.errors.avatar.map((message, i) => (
                      <div key={i}>{message}</div>
                    ))}
                  </Popup> */}
                  <div className="text sub center mini mt-2">Select your avatar, if you want</div>
                  <div className="row around-xs mt-3 mx-2">
                    {/* <InputForm className="col-6 mt-3 px-2" label="Username:" placeholder="Username" icon="user" errors={this.state.errors && this.state.errors.username} linkValue={{
                      set: (value) => {
                        this.setState({username: value})
                      },
                      get: () => this.state.username
                    }}/>
                    <InputForm className="col-6 mt-3 px-2" label="Email:" type="email" placeholder="Email" icon="at" errors={this.state.errors && this.state.errors.email} linkValue={{
                      set: (value) => {
                        this.setState({email: value})
                      },
                      get: () => this.state.email
                    }}/>
                    <InputForm className="col-6 mt-3 px-2" label="Password:" type="password" placeholder="Password" icon="key" errors={this.state.errors && this.state.errors.password} linkValue={{
                      set: (value) => {
                        this.setState({password: value})
                      },
                      get: () => this.state.password
                    }}/>
                    <InputForm className="col-6 mt-3 px-2" label="Password (Repeat):" type="password" placeholder="Password (Repeat)" addon="2" errors={this.state.password != this.state.password2 && ["The passwords are not equal"]} linkValue={{
                      set: (value) => {
                        this.setState({password2: value})
                      },
                      get: () => this.state.password2
                    }}/> */}
                  </div>
                </div>
                <div className="block default text right pt-3 px-3 pb-3">
                  <Button className="mr-3 mb-1" size="md" onClick={async () => modalContext.close()}>
                    <span className="fa fa-ban"></span>
                    <span>Cancel</span>
                  </Button>
                  <Button className="mr-1 mb-1" type="primary" size="md" onClick={async e => {
                    try {
                      let user = await context.auth.registration({
                        username: this.state.username,
                        password: this.state.password,
                        email: this.state.email,
                        avatar: this.state.avatar_file
                      });
                      await context.auth.login(this.state.username, this.state.password);
                      modalContext.close();
                      location.href = location.href;
                    }
                    catch (e) {
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
                  }}>
                    <span className="fa fa-bolt"></span>
                    <span>Sign in</span>
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