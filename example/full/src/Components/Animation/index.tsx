import * as React from 'react';
import * as ReactTransition from 'react-transition-group';

import * as Router from 'reiso/Modules/Router';

export const Transition = props => (
    <ReactTransition.TransitionGroup className={props.className}>
        <ReactTransition.CSSTransition
            key={props.id}
            in={props.in}
            appear={props.appear}
            exit={props.exit}
            classNames={props.type || 'fadenslide'}
            timeout={{
                enter: 200,
                exit: props.exit ? 200 : 0
            }}
        >
            {props.children}
        </ReactTransition.CSSTransition>
    </ReactTransition.TransitionGroup>
);

export const PageTransition = Router.withRouter(Transition);