import * as React from 'react';
import * as ApolloReact from 'react-apollo';

import * as Routes from 'reiso/Modules/Router';
import * as Reducer from 'reiso/Modules/Reducer';

import * as Header from '~/Modules/Main/Reducer/Header';
import * as NotificationComponent from '~/Components/Notification';

export interface StateProps {
    notifications?: Header.NotificationModel[]
}

export interface DispatchProps {
    removeNotification?: (notification: Header.NotificationModel) => void
}

@Reducer.Connect<StateProps, DispatchProps, Header.StateModel>(state => ({
    notifications: state.Header.notifications
}), (dispatch, props) => ({
    removeNotification: async (notification: Header.NotificationModel) => {
        await dispatch(Header.unsetNotification(notification));
    }
}))
export class Notification extends React.Component<StateProps & DispatchProps & {
}, {}> {
    render() {
        let notif = this.props.notifications[0];
        let elem = null;
        if (notif) {
            if (notif.type == 'error')
            elem = <NotificationComponent.Notification key={notif.id} type="error" message={notif.message} title={notif.title} onClose={()=>{
                this.props.removeNotification(notif);
            }}/>
        }

        return <div>
            {elem}
        </div>
    }
}