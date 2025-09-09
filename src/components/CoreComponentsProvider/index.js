import * as React from 'react';
import {View, ActivityIndicator, Modal, Text, StyleSheet} from 'react-native';
import {Snackbar} from 'react-native-paper';
import {useCoreTheme} from '@src/themes';
import {
  MD2Colors,
  Portal,
  Dialog,
  useTheme,
  MD3Colors,
} from 'react-native-paper';
import AppConfig from '@src/app.config';
import {CoreText} from '@src/components/';

// initial state
const INITIAL_STATE = {
  // loading modal
  loader: {
    state: false,
    message: 'Cargando',
  },
  // app notification
  snack: {
    state: false,
    message: 'Correcto',
    type: null,
    time: null,
  },
};

// reducer
export const CoreComponentsReducer = (state, action) => {
  switch (action.type) {
    case 'appSetLoader':
      return {
        ...state,
        loader: {
          ...state.loader,
          state: action.payload.state,
          message: action.payload.message || state.loader.message,
        },
      };
      break;

    case 'appSetSnack':
      return {
        ...state,
        snack: {
          ...state.snack,
          state: action.payload.state,
          message: action.payload.message || state.snack.message,
          type: !action.payload.state
            ? state.snack.message
            : action.payload.type,
          time: action.payload.time,
        },
      };
      break;

    default:
      return state;
  }
};

// context
const CoreComponentsContext = React.createContext({});

// provider
function CoreComponentsProvider({children}) {
  const [coreState, dispatch] = React.useReducer(
    CoreComponentsReducer,
    INITIAL_STATE,
  );

  const {loader, snack} = coreState;

  const appSetLoader = ({state, message}) => {
    dispatch({type: 'appSetLoader', payload: {state, message}});
  };

  const appSetSnack = ({state, message, type, time}) => {
    dispatch({type: 'appSetSnack', payload: {state, message, type, time}});
  };

  return (
    <CoreComponentsContext.Provider
      value={{
        appSetLoader,
        appSetSnack,
        loaderState: loader,
        snackState: snack,
      }}>
      <LoaderComponent state={loader.state} message={loader.message} />
      {children}
      <SnackComponent />
    </CoreComponentsContext.Provider>
  );
}

// hook
const useCoreComponents = () => {
  const {appSetLoader, appSetSnack, loaderState, snackState} = React.useContext(
    CoreComponentsContext,
  );
  return {
    appSetLoader,
    appSetSnack,
    loaderState,
    snackState,
  };
};

const SnackComponent = () => {
  const {appSetSnack, snackState} = useCoreComponents();
  const {themeData} = useCoreTheme();
  const setSnack = value => {
    appSetSnack({state: value, time: null});
  };

  return (
    <View>
      <Snackbar
        visible={snackState.state}
        onDismiss={() => setSnack(false)}
        // onPress={() => setSnack(false)}
        duration={snackState.time || 2000}
        // action={null}
        action={{
          label: 'X',
          onPress: () => {
            setSnack(false);
          },
        }}
        style={{
          ...(snackState.type === 'error'
            ? {backgroundColor: themeData.colors.onErrorContainer}
            : {}),
        }}>
        <CoreText
          // onPress={() => setSnack(false)}
          style={{
            color: themeData.colors.onPrimary,
          }}>
          {snackState.message}
        </CoreText>
      </Snackbar>
    </View>
  );
};

const stylesLoaderComponent = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  flexing: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marginRight: {
    marginRight: 16,
  },
});

const LoaderComponent = ({state, message}) => {
  const {appSetLoader, loaderState} = useCoreComponents();

  const {themeData} = useCoreTheme();
  const setLoader = value => {
    appSetLoader({state: value, message: null});
  };

  return (
    <Modal
      backdropDismiss={true}
      transparent={true}
      visible={loaderState.state}
      onRequestClose={() => {
        // appSetLoader({state: !loaderState.state});
        return false;
      }}>
      <View style={[stylesLoaderComponent.centeredView]}>
        <Dialog visible={loaderState.state}>
          {/* <Dialog.Title>Progress Dialog</Dialog.Title> */}
          <Dialog.Content>
            <View style={stylesLoaderComponent.flexing}>
              <ActivityIndicator
                color={themeData.colors.tertiary}
                size={48}
                style={stylesLoaderComponent.marginRight}
              />
              <CoreText
                onPress={() => {
                  if (AppConfig.is_dev) {
                    setLoader(!loaderState.state);
                  }
                }}>
                {loaderState.message}
              </CoreText>
            </View>
          </Dialog.Content>
        </Dialog>
      </View>
    </Modal>
  );
};

export default CoreComponentsProvider;
export {useCoreComponents};
