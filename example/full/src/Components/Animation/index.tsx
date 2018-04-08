import * as React from 'react';
import * as ReactTransition from 'react-transition-group';

import * as Router from 'reiso/Modules/Router';

export const Transition = Router.withRouter(({ location, className, children, appear, exit, id, type, ...props }) => (
    <ReactTransition.TransitionGroup className={className}>
        <ReactTransition.CSSTransition
            key={id}
            in={props.in}
            appear={appear}
            exit={exit}
            classNames={type || 'fadenslide'}
            timeout={{
                enter: 200,
                exit: exit ? 200 : 0
            }}
        >
            {children}
        </ReactTransition.CSSTransition>
    </ReactTransition.TransitionGroup>
));