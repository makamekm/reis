import * as React from 'react';
import * as ApolloReact from 'react-apollo';

import * as Reducer from 'reiso/Modules/Reducer';

import * as ModalServiceItem from '~/Components/Modal/ModalServiceItem';

export class ModalService extends React.Component<{
    modals: ModalServiceItem.ModalProps[],
    removeModal: (modal: any) => void
}> {

    update() {
        this.forceUpdate();
    }

    render() {
        let elems = this.props.modals.map(modal => React.createElement(ModalServiceItem.Modal, {
            ...modal,
            onClose: () => {
                this.props.removeModal(modal);
                if (modal.onClose) modal.onClose();
            }
        }));

        return <div>
            {elems}
        </div>
    }
}