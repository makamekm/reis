import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as PropTypes from 'prop-types';

import * as Router from 'reiso/Modules/Router';
import * as Reducer from 'reiso/Modules/Reducer';
import * as Translation from 'reiso/Modules/Translation';

import * as UserReducer from '~/Modules/Authentication/Reducer/User';

import { Language, CodeFlag, LanguageForEach, LanguageStringify, LanguageCode, CodeLanguage } from '~/Modules/Language/Enum/Language';
import { AdminRule } from '~/Modules/Authentication/Enum/AdminRule';
import { Theme, ThemeStringify } from '~/Modules/Main/Enum/Theme';
import { Modal, Consumer as ModalConsumer } from '~/Components/Modal';
import { Popup, PopupItem, PopupScroll, PopupInput, PopupLink, PopupHeader } from '~/Components/Popup';
import { Icon } from '~/Components/Icon';
import { Clickable } from '~/Components/Clickable';
import { Button } from '~/Components/Button';
// import { InputForm } from '~/Components/Form';
import { Img } from '~/Components/Img';
import { Menu as MenuRaw, MenuSpace, MenuLink, MenuHeader, MenuItem, MenuDivider, MenuGroup, MenuInput, MenuDrop } from '~/Components/Menu';

import { LoginForm } from './Auth/LoginForm';
import { RegistrationForm } from './Auth/RegistrationForm';
import * as Header from '../Reducer/Header';

import { Consumer } from './Html';

export interface StateProps {
  isDesktop?: boolean
  theme?: Header.Model['theme']
}

export interface DispatchProps {
  setTheme?: (theme: Header.Model['theme']) => void
}

@Router.withRouter
@UserReducer.DecorateConnectUser
@Reducer.Connect<StateProps, DispatchProps>(state => ({
  isDesktop: state.browser.mediaType == 'large' || state.browser.mediaType == 'infinity',
  theme: state.Header.theme
}), (dispatch, props) => {
  return {
    setTheme: (theme) => {
      dispatch(Header.setTheme(theme));
    }
  }
})
export class Menu extends React.Component<{
  // Props
  sticky?: boolean

  // Router
  history?: any
  match?: any
  user?: UserReducer.ConnectUserInterface
} & StateProps & DispatchProps> {
  searching: boolean = false
  isSticky: boolean = false
  event: any

  componentDidMount() {
    if (process.env.MODE == "client" && this.props.sticky) {
      this.event = this.onScroll.bind(this);
      window.addEventListener("scroll", this.event);
      this.isSticky = $(document).scrollTop() > 20;
      this.forceUpdate();
      if (this.isSticky) {
        this.restartAnimation();
      }
    }
  }

  restartAnimation() {
    let elem = $(ReactDOM.findDOMNode(this)).find('#logoHeader');

    // elem.velocity("stop");
    // elem.find('svg').find('*').velocity("stop");

    elem.velocity({
      translateY: '-0.25rem',
      scaleX: 1.1,
      scaleY: 0.9,
      opacity: 0.7
    },
    {
      delay: 5000,
      duration: 150,
      loop: true,
      easing: "easeInSine"
    }).velocity("reverse", {
      loop: true
    });

    // elem.find('svg').find('*').each((i, e) => {
    //   $(e).velocity({
    //     'fill': '#'+Math.floor(Math.random()*16777215).toString(16),
    //   },
    //   {
    //     delay: 5000,
    //     duration: 150,
    //     loop: true
    //   }).velocity("reverse", {
    //     loop: true
    //   });
    // });
  }

  componentWillUnmount() {
    if (process.env.MODE == "client" && this.event) {
      window.removeEventListener("scroll", this.event);
    }
  }

  onScroll(e) {
    const newValue = $(document).scrollTop() > 20;
    if (newValue != this.isSticky) {
      this.isSticky = newValue;
      this.forceUpdate(() => {
        if (this.isSticky) {
          this.restartAnimation();
        }
      });
    }
  }

  getLanguageUrl(languageCode: string): string {
    let pathname: string = this.props.history.location.pathname;

    let currentLang: string = Translation.getLanguages().find(code => pathname.indexOf('/' + code + '/') == 0);

    if (currentLang) {
      return pathname.replace('/' + currentLang + '/', '/' + languageCode + '/');
    } else {
      return '/' + languageCode + pathname;
    }
  }

  setLanguage(languageCode: string) {
    let pathname: string = this.props.history.location.pathname;

    let currentLang: string = Translation.getLanguages().find(code => pathname.indexOf('/' + code + '/') == 0);

    if (currentLang) {
      this.props.history.push(pathname.replace('/' + currentLang + '/', '/' + languageCode + '/'));
    } else {
      this.props.history.push('/' + languageCode + pathname);
    }
  }

  render() {
    return <Consumer>
      {context => {
        let langItems = Translation.getLanguages().map(code => {
          let active = context.language() == code;

          return (
            <PopupItem key={code} active={active} type="a" href={this.getLanguageUrl(code)} onClick={e => {
              this.setLanguage(code);
            }}>
              {LanguageStringify(CodeLanguage(code))}
            </PopupItem>
          )
        });

        let themes = [
          (
            <PopupItem key={'dark'} active={this.props.theme == 'dark'} onClick={e => {
              this.props.setTheme('dark');
            }}>
              {context.trans("Main.Theme." + ThemeStringify('dark'))}
            </PopupItem>
          ),
          (
            <PopupItem key={'light'} active={this.props.theme == 'light'} onClick={e => {
              this.props.setTheme('light');
            }}>
              {context.trans("Main.Theme." + ThemeStringify('light'))}
            </PopupItem>
          )
        ];

        return (
          <MenuRaw sticky={this.props.sticky}>
            {/* <MenuHeader id="logoHeader" image={(this.isSticky || !this.props.sticky) ? burdSvg : null}/> */}
            {<MenuLink icon="home" to="/screener" relative>
              Screener
            </MenuLink>}
            {<MenuLink icon="home" to="/table" relative>
              Table
            </MenuLink>}
            {this.props.isDesktop && this.props.user.entity && <MenuLink icon="home" to="/desks">
              Desks
            </MenuLink>}
            {this.props.isDesktop && this.props.user.entity && <MenuLink icon="home" to="/feedback">
              Feedback
            </MenuLink>}
            {this.props.isDesktop && this.searching && <MenuInput className="space"/>}
            {this.props.isDesktop && !this.searching &&
            <MenuItem icon="search" onClick={async e => {
              this.searching = true;
              this.forceUpdate();
              setTimeout(() => {
                $('#searching').focus();
              }, 50);
            }}>
              Search
            </MenuItem>}
            {this.props.isDesktop && <MenuSpace/>}
            {!this.props.user.entity && <MenuDrop text={CodeFlag(context.language()).toUpperCase()}>
              {langItems}
            </MenuDrop>}
            {this.props.isDesktop && !this.props.user.entity && <MenuDrop className={context.loadingTheme() ? 'loading' : ''} text={context.trans("Main.Theme." + ThemeStringify(this.props.theme))}>
              {themes}
            </MenuDrop>}
            {!this.props.user.entity && <LoginForm>
              {modal => <MenuItem icon="sign-in" onClick={async () => modal.open()}>
                Sign in
              </MenuItem>}
            </LoginForm>}
            {!this.props.user.entity && <RegistrationForm>
              {modal => <MenuItem icon="user-plus" onClick={async () => modal.open()}>
                Sign up
              </MenuItem>}
            </RegistrationForm>}
            {!!this.props.user.entity && <MenuGroup>
              {this.props.isDesktop && <MenuDrop className={context.loadingTheme() ? 'loading' : ''} text={context.trans("Main.Theme." + ThemeStringify(this.props.theme))}>
                {themes}
              </MenuDrop>}
              {this.props.isDesktop && <MenuDivider/>}
              {<MenuDrop flag={CodeFlag(context.language())}>
                {langItems}
              </MenuDrop>}
              {<MenuDivider/>}
              {this.props.isDesktop && false && <MenuItem icon="commenting"/>}
              {this.props.isDesktop && <MenuDivider/>}
              <MenuDrop minWidth="10rem" icon="user" position="bottom left">
                <PopupHeader>
                  <span>
                    <Img className="profile-img nano ml-2" url={this.props.user.entity.avatar}src="/images/avatar-empty.png"/>
                    <span className="ml-2">{this.props.user.entity.username}</span>
                  </span>
                </PopupHeader>
                <PopupLink icon="user" to="/profile">
                  Profile
                </PopupLink>
                <PopupItem icon="sign-out" onClick={async e => {
                    try {
                      await context.auth.logout();
                      location.href = location.href;
                    }
                    catch (e) {}
                  }}>
                  Logout
                </PopupItem>
              </MenuDrop>
            </MenuGroup>}
          </MenuRaw>
        )
      }}
    </Consumer>
  }
}