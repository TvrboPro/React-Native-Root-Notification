import React, {
    Component,
    PropTypes
} from 'react';
import {
    StyleSheet,
    View,
    Text,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
    Easing,
		Platform
    // Keyboard
} from 'react-native';
const NOTIFICATION_ANIMATION_DURATION = 200;
const STATUS_BAR_PADDING = (Platform.OS === 'ios') ? 15 : 0;
const NOTIFICATION_PADDING = 15;
const NOTIFICATION_HEIGHT = 80 + STATUS_BAR_PADDING;

const DIMENSION = Dimensions.get('window');
const WINDOW_WIDTH = DIMENSION.width;
// let KEYBOARD_HEIGHT = 0;

// Keyboard.addListener('keyboardDidChangeFrame', function ({ endCoordinates }) {
//     KEYBOARD_HEIGHT = DIMENSION.height - endCoordinates.screenY;
// });

const durations = {
    LONG: 7000,
    SHORT: 3500
};

let styles = StyleSheet.create({
    defaultStyle: {
        position: 'absolute',
        width: WINDOW_WIDTH
        // justifyContent: 'center',
        // alignItems: 'center'
    },
    viewStyle: {
        padding: NOTIFICATION_PADDING,
				paddingTop: NOTIFICATION_PADDING + STATUS_BAR_PADDING,
        backgroundColor: '#f5f5f5',
        opacity: 1,
        borderRadius: 0
    },
    shadowStyle: {
        shadowColor: '#000',
        shadowOffset: {
            width: 2,
            height: 2
        },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 4
    },
    textStyle: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center'
    }
});

class NotificationView extends Component {
    static displayName = 'NotificationView';

    static propTypes = {
        ...View.propTypes,
        viewStyle: View.propTypes.style,
        duration: PropTypes.number,
        visible: PropTypes.bool,
        animation: PropTypes.bool,
        shadow: PropTypes.bool,
        backgroundColor: PropTypes.string,
        opacity: PropTypes.number,
        shadowColor: PropTypes.string,
        textColor: PropTypes.string,
        textStyle: Text.propTypes.style,
        delay: PropTypes.number,
        hideOnPress: PropTypes.bool,
        onHide: PropTypes.func,
        onHidden: PropTypes.func,
        onShow: PropTypes.func,
        onShown: PropTypes.func
    };

    static defaultProps = {
        visible: false,
        duration: durations.SHORT,
        animation: true,
        shadow: true,
        top: - NOTIFICATION_HEIGHT - NOTIFICATION_PADDING*2,
				textColor: '#333',
				backgroundColor: '#f5f5f5',
        delay: 0,
        hideOnPress: true
    };

    constructor() {
        super(...arguments);
        this.state = {
            visible: this.props.visible,
            top: new Animated.Value(- NOTIFICATION_HEIGHT - NOTIFICATION_PADDING*2)
        };
    }

    componentDidMount = () => {
        if (this.state.visible) {
            this._showTimeout = setTimeout(() => this._show(), this.props.delay);
        }
    };

    componentWillReceiveProps = nextProps => {
        if (nextProps.visible !== this.props.visible) {
            if (nextProps.visible) {
                clearTimeout(this._showTimeout);
                clearTimeout(this._hideTimeout);
                this._showTimeout = setTimeout(() => this._show(), this.props.delay);
            } else {
                this._hide();
            }

            this.setState({
                visible: nextProps.visible
            });
        }
    };

    componentWillUnmount = () => {
        this._hide();
    };

    shouldComponentUpdate = (nextProps, nextState) => {
        return this.state.visible !== nextState.visible;
    };

    _animating = false;
    _root = null;
    _hideTimeout = null;
    _showTimeout = null;

    _show = () => {
        clearTimeout(this._showTimeout);

        if (!this._animating) {
            clearTimeout(this._hideTimeout);

            this._animating = true;
            this._root.setNativeProps({
                pointerEvents: 'auto'
            });
            this.props.onShow && this.props.onShow(this.props.siblingManager);

            Animated.timing(this.state.top, {
                toValue: 0,
                duration: this.props.animation ? NOTIFICATION_ANIMATION_DURATION : 0,
                easing: Easing.out(Easing.ease)
            }).start(({finished}) => {
                if (finished) {
                    this._animating = !finished;
                    this.props.onShown && this.props.onShown(this.props.siblingManager);
                    if (this.props.duration > 0) {
                        this._hideTimeout = setTimeout(() => this._hide(), this.props.duration);
                    }
                }
            });
        }
    };

    _hide = () => {
        clearTimeout(this._showTimeout);
        clearTimeout(this._hideTimeout);

        if (!this._animating) {
            this._root.setNativeProps({
                pointerEvents: 'none'
            });
            this.props.onHide && this.props.onHide(this.props.siblingManager);
            Animated.timing(this.state.top, {
                toValue: - NOTIFICATION_HEIGHT - NOTIFICATION_PADDING*2,
                duration: this.props.animation ? NOTIFICATION_ANIMATION_DURATION : 0,
                easing: Easing.in(Easing.ease)
            }).start(({finished}) => {
                if (finished) {
                    this._animating = false;
                    this.props.onHidden && this.props.onHidden(this.props.siblingManager);
                }
            });
        }
    };

    render() {
        let {props} =  this;
        let position = {
            top: 0,
            // bottom: NOTIFICATION_HEIGHT
        };

        return (this.state.visible || this._animating) ? <View
            style={[
                styles.defaultStyle,
                position
            ]}
            pointerEvents="box-none"
        >
            <TouchableWithoutFeedback
                onPress={this.props.hideOnPress ? this._hide : null}
            >
                <Animated.View
                    style={[
                        styles.viewStyle,
                        props.viewStyle,
                        props.backgroundColor && {backgroundColor: props.backgroundColor},
                        {
                            top: this.state.top
                        },
                        props.shadow && styles.shadowStyle,
                        props.shadowColor && {shadowColor: props.shadowColor}
                    ]}
                    pointerEvents="none"
                    ref={element => this._root = element}
                >
                    <Text style={[
                        styles.textStyle,
                        props.textStyle,
                        props.textColor && {color: props.textColor}
                    ]}>
                        {this.props.children}
                    </Text>
                </Animated.View>
            </TouchableWithoutFeedback>
        </View> : null;
    }
}

export default NotificationView;
export {
    durations
}
