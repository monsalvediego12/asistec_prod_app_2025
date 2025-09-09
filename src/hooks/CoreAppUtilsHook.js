import {useState, useEffect, useRef} from 'react';
import {AppState} from 'react-native';

const useCoreAppUtilsHook = () => {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [appStateVisibleFromBackground, setAppStateVisibleFromBackground] =
    useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        setAppStateVisibleFromBackground(true);
      } else {
        setAppStateVisibleFromBackground(false);
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    appStateVisible,
    appStateVisibleFromBackground,
  };
};

export {useCoreAppUtilsHook};
