import React, {
    Component,
    PropTypes
} from 'react';
import { View } from 'react-native';
import RootSiblings from 'react-native-root-siblings';
import NotificationView, { positions, durations } from './NotificationView';

class Notification extends Component {
    static displayName = 'Notification';
    static propTypes = NotificationView.propTypes;
    static positions = positions;
    static durations = durations;

    static show = (message, options = { position: positions.BOTTOM, duration: durations.SHORT }) => {
        return new RootSiblings(<NotificationView
            {...options}
            visible={true}
        >
            {message}
        </NotificationView>);
    };

    static hide = notification => {
        if (notification instanceof RootSiblings) {
            notification.destroy();
        } else {
            console.warn(`Notification.hide expected a \`RootSiblings\` instance as argument.\nBut got \`${typeof notification}\` instead.`);
        }
    };

    _notification = null;

    componentWillMount = () => {
        this._notification = new RootSiblings(<NotificationView
            {...this.props}
            duration={0}
        />);
    };

    componentWillReceiveProps = nextProps => {
        this._notification.update(<NotificationView
            {...nextProps}
            duration={0}
        />);
    };

    componentWillUnmount = () => {
        this._notification.destroy();
    };

    render() {
        return null;
    }
}

export {
    RootSiblings as Manager
};
export default Notification;
