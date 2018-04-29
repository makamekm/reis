import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as ApolloReact from 'react-apollo';
import { Helmet as _Helmet } from "react-helmet";
const Helmet: any = _Helmet;
import * as StackTraceParser from 'stacktrace-parser';
import { Context } from 'create-react-context';
import * as createContext from 'create-react-context';

import * as Translation from 'reiso/Modules/Translation';
import * as Router from 'reiso/Modules/Router';
import * as Reducer from 'reiso/Modules/Reducer';

import { LanguageForEach, LanguageCode } from '~/Modules/Language/Enum/Language';
import * as ModalComponent from '~/Components/Modal';
import * as UserReducer from '~/Modules/Authentication/Reducer/User';
import { Notification } from '~/Modules/Notification/View/Notification';

import * as Header from '../Reducer/Header';

export const { Provider, Consumer }: Context<{
  client: any
  store: any
  auth: any
  // modals: {
  //   push: (modal: ModalComponent.ModalProps) => void
  //   remove: (modal: ModalComponent.ModalProps) => void
  //   update: (modal?: ModalComponent.ModalProps) => void
  // }
  forceUpdate: Function
  language: Function
  trans: (query: string, ...args: string[]) => string
  getPath: Function
  go: Function
  isPath: Function
  loadingTheme: Function
}> = (createContext as any)(null);

function createCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + value + expires + "; path=/";
}

function eraseCookie(name) {
  createCookie(name, "" , -1);
}

export interface StateProps {
  title?: string
  theme?: Header.Model['theme']
}

export interface DispatchProps {
  setTitle?: (name: string) => void
}

@Router.DeclareHtml()
@Router.withRouter
@Reducer.Connect<StateProps, DispatchProps, Header.StateModel>(state => {
  return {
    title: state.Header.title,
    theme: state.Header.theme
  }
}, (dispatch, props) => {
  return {
      setTitle: (name: string) => {
        dispatch(Header.setTitle(name));
      }
  }
})
export class Html extends React.Component<StateProps & DispatchProps & {
  client: Router.ApolloClient
  store: any
  language: string
  history?: any
}, {
  modals: ModalComponent.ModalProps[],
}> {

  refs: any

  // static childContextTypes: React.ValidationMap<any> = {
  //   client: PropTypes.object,
  //   store: PropTypes.object,
  //   auth: PropTypes.object,
  //   modals: PropTypes.object,
  //   forceUpdate: PropTypes.func,
  //   language: PropTypes.func,
  //   trans: PropTypes.func,
  //   getPath: PropTypes.func,
  //   go: PropTypes.func,
  //   isPath: PropTypes.func,
  //   loadingTheme: PropTypes.func,
  // }

  state = {
    modals: []
  }

  // getChildContext() {
  //   return 
  // }

  getContext() {
    return {
      client: this.props.client,
      store: this.props.store,
      auth: {
        login: async (login, password) => {
          let res = await this.props.client.mutate({
            mutation: Router.gql`
              mutation Auth($login: String, $password: Password!) {
                auth {
                  login(login: $login, password: $password) {
                    sid,
                    token,
                    user {
                      id,
                      username,
                      email,
                      avatar,
                      rules
                    }
                  }
                }
              }`,
            variables: { login, password }
          });

          if (res.errors && res.errors.length) throw res.errors;

          createCookie('session_id', (res.data as any).auth.login.sid, 30);
          createCookie('session_token', (res.data as any).auth.login.token, 30);

          this.props.store.dispatch(UserReducer.setUser({
            id: (res.data as any).auth.login.user.id,
            username: (res.data as any).auth.login.user.username,
            email: (res.data as any).auth.login.user.email,
            rules: (res.data as any).auth.login.user.rules,
            avatar: (res.data as any).auth.login.user.avatar
          }));

          this.props.client.resetStore();
        },
        logout: async () => {
          let res = await this.props.client.mutate({
            mutation: Router.gql`
              mutation Auth {
                auth {
                  logout
                }
              }`
          });

          if (res.errors && res.errors.length) throw res.errors;

          eraseCookie('session_id');
          eraseCookie('session_token');

          this.props.client.resetStore();
        },
        touch: async (login, password) => {
          let res = await this.props.client.mutate({
            mutation: Router.gql`
              mutation Auth {
                auth {
                  touch {
                    sid,
                    token,
                    user {
                      id,
                      username,
                      email,
                      avatar,
                      rules
                    }
                  }
                }
              }`,
            variables: {}
          });

          if (res.errors && res.errors.length) throw res.errors;

          createCookie('session_id', (res.data as any).auth.touch.sid, 30);
          createCookie('session_token', (res.data as any).auth.touch.token, 30);

          this.props.store.dispatch(UserReducer.setUser({
            id: (res.data as any).auth.touch.user.id,
            username: (res.data as any).auth.touch.user.username,
            email: (res.data as any).auth.touch.user.email,
            rules: (res.data as any).auth.touch.user.rules,
            avatar: (res.data as any).auth.touch.user.avatar
          }));

          this.props.client.resetStore();
        },
        registration: async ({username, password, email, avatar}) => {
          let res = await this.props.client.mutate({
            mutation: Router.gql`
              mutation Auth($username: Username!, $password: Password!, $email: Email, $avatar: Upload) {
                auth {
                  registration(data: { username: $username, password: $password, email: $email, avatar: $avatar }) {
                    id
                  }
                }
              }`,
            variables: { username, password, email, avatar }
          });

          if (res.errors && res.errors.length) throw res.errors;

          return res;
        },
        log: async (error) => {
          let res = await this.props.client.mutate({
            mutation: Router.gql`
              mutation Auth($message: String!, $stack: String!) {
                auth {
                  log(message: $message, stack: $stack)
                }
              }`,
            variables: { message: error.message, stack: JSON.stringify(StackTraceParser.parse(error.stack)) }
          });

          return res;
        }
      },
      // modals: {
      //   push: (modal: ModalComponent.ModalProps) => {
      //     this.state.modals.push(modal);
      //     this.refs.modalService && this.refs.modalService.update();
      //   },
      //   remove: (modal: ModalComponent.ModalProps) => {
      //     this.state.modals.splice(this.state.modals.indexOf(modal), 1);
      //     this.refs.modalService && this.refs.modalService.update();
      //   },
      //   update: (modal?: ModalComponent.ModalProps): void => {
      //     if (modal) this.state.modals = this.state.modals.map(function(item) { return item.key == modal.key ? modal : item; });
      //     this.refs.modalService && this.refs.modalService.update();
      //   }
      // },
      forceUpdate: () => this.forceUpdate(),
      language: () => process.env.MODE == "server" ? this.props.language : Translation.getLanguage(),
      trans: (query: string, ...args: string[]): string => {
        if (process.env.MODE == "server") {
          return Translation.trans(process.env.MODE == "server" ? this.props.language : Translation.getLanguage(), query, ...args);
        }
        else {
          return Translation.trans(Translation.getLanguage(), query, ...args);
        }
      },
      getPath: (path: string) => {
        let languagePath = null;
        LanguageForEach(language => {
          if (this.props.history.location.pathname.indexOf(LanguageCode(language) + '/') == 1) {
            languagePath = LanguageCode(language);
          }
        })

        if (languagePath) return `/${languagePath}${path}`;
        else return path;
      },
      go: (path: string) => {
        let languagePath = null;
        LanguageForEach(language => {
          if (this.props.history.location.pathname.indexOf(LanguageCode(language) + '/') == 1) {
            languagePath = LanguageCode(language);
          }
        })

        if (languagePath) this.props.history.push(`/${languagePath}${path}`);
        else this.props.history.push(path);
      },
      isPath: (path: string, relative: boolean = false): boolean => {
        let languagePath = null;
        LanguageForEach(language => {
          if (this.props.history.location.pathname.indexOf(LanguageCode(language) + '/') === 1) {
            languagePath = LanguageCode(language);
          }
        });

        let localPath: string = this.props.history.location.pathname;

        if (languagePath) localPath = localPath.substr(`/${languagePath}`.length);

        if (relative) return localPath.indexOf(path) === 0;
        else return localPath === path;
      },
      loadingTheme: () => this.loading
    }
  }

  inited: boolean = false
  prevTheme: Header.Model['theme']
  checkLoadingInterval: number
  loading: boolean = true;

  componentDidMount() {
    if (!this.inited && process.env.MODE == "client") {
      this.loading = true;
      this.checkLoadingInterval = window.setInterval(this.checkLoading.bind(this), 100);
    }
  }

  componentWillReceiveProps(newProps) {
    if (this.props.theme != newProps.theme && process.env.MODE == "client") {
      this.prevTheme = this.props.theme;
      this.loading = true;
      if (this.checkLoadingInterval) window.clearInterval(this.checkLoadingInterval);
      this.checkLoadingInterval = window.setInterval(this.checkLoading.bind(this), 100);
    }
  }

  checkLoading() {
    if (this.prevTheme != this.props.theme) {
      if (!this.loading) {
        clearInterval(this.checkLoadingInterval);
      } else if (this.isLoaded('/' + this.props.theme + '.css')) {
        clearInterval(this.checkLoadingInterval);
        this.loading = false;
        if (!this.inited) {
          this.inited = true;
          // this.showUI();
        }
        this.forceUpdate();
      }
    }
  }

  isLoaded(path) {
    // document.styleSheets holds the style sheets from LINK and STYLE elements
    for (var i = 0; i < document.styleSheets.length; i++) {

      // Checking if there is a request for the css file
      // We iterate the style sheets with href attribute that are created from LINK elements
      // STYLE elements don't have href attribute, so we ignore them
      // We also check if the href contains the css file name
      if (document.styleSheets[i].href && document.styleSheets[i].href.match(path)) {

        // console.log("There is a request for the css file.");
        if ((document.styleSheets[i] as any).cssRules.length == 0) {
          // console.log("Request for the css file failed.");
          return true;
        } else {
          // console.log("Request for the css file is successful.");
          return true;
        }
      }
      else if (i == document.styleSheets.length - 1) {
        // console.log("There is no request for the css file.");
        return false;
      }
    }

    return false;
  }

  render() {
    return <Provider value={this.getContext()}>
      <div style={{flex: '1 1 auto'}} key="routers">
        {this.props.children}
      </div>
      <div className="block block-2" style={{flex: '0 1 auto'}} key="footer">
        <div className="row align-items-center" style={{maxWidth: '100%', width: '100%'}}>
          <div className="col-12 col-md-3 text center mt-4">
            <div className="text big sub">Cypto Board</div>
            <div className="text subsubsub">We help you watch exchanges</div>
          </div>
          <div className="col-12 col-md-3 text center mt-4">
            <div className="text sub">Links</div>
            <div className="text subsub mt-2">
              <div className="mt-1">
                <a href="/feedback" className="text link"><span className="fa fa-mail-forward mr-2"/>Feedback</a>
              </div>
              <div className="mt-1 mt-1">
                <a href="/advertising" className="text link"><span className="fa fa-shopping-cart mr-2"/>Advertising</a>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3 text center mt-4">
            <div className="text sub"><span className="fa fa-heartbeat mr-2"/>Support us</div>
            <div className="text subsub mt-2">
              <div className="text wrap">BTC: 12XagkcShrC6hMG19R7UcxMtZZtpkJ5czz</div>
              <div className="text wrap mt-1">ETH: 0xd7b66b3dd9859c6411b696991c9158d1398f77ec</div>
              <div className="text wrap mt-1">Litecoin: LgBz4Y5oiNcdiNhjiFyWbkyWZcXxcJmfR3</div>
            </div>
          </div>
          <div className="col-12 col-md-3 text center mt-4">
            <div className="text sub">
              Our contacts
            </div>
            <div className="text subsub mt-2">
              <div className="mt-1">
                <a href="mailto:support@cryptoboard.com" className="text link"><span className="fa fa-inbox mr-2"/>Email</a>
              </div>
              <div className="mt-1">
                <a href="https://t.me/joinchat/DB-eGRBp2WrlojZbZssTjQ" className="text link"><span className="fa fa-telegram mr-2"/>Telegram</a>
              </div>
              <div className="mt-1">
                <a href="https://twitter.com/Strymexofficial" className="text link"><span className="fa fa-twitter mr-2"/>Twitter</a>
              </div>
              <div className="mt-1">
                <a href="https://www.facebook.com/Strymex/" className="text link"><span className="fa fa-facebook mr-2"/>Facebook</a>
              </div>
            </div>
          </div>
        </div>
        <div className="block block-1 text subsub center mt-4 pt-2 pb-2">
          Copyright 2017 by Karpov
        </div>
      </div>
      <Helmet key="helmet">
        <title>{this.props.title}</title>
        {/* <link href="https://fonts.googleapis.com/css?family=Ubuntu" rel="stylesheet"/> */}
        <link href="/index.css" rel="stylesheet" media="screen"/>
        {(this.loading && this.prevTheme) && <link href={'/' + this.prevTheme + '.css'} rel="stylesheet" media="screen"/>}
        <link href={'/' + this.props.theme + '.css'} rel="stylesheet" media="screen"/>
        <link rel="icon" href="/images/icon.svg" type="image/svg"/>
        <link rel="shortcut" href="/images/icon.ico" type="image/x-icon"/>
        <body/>
      </Helmet>
      <Notification ref="notificationService" key="notifications"/>
    </Provider>
  }
}