import React, {useState} from 'react';
import {defaultTheme, testTheme, asistecTheme} from './styles/';

const ThemeContext = React.createContext({});

// provider
const CoreThemeProvider = ({children}) => {
  const [darkMode, setDarkMode] = useState(false);
  const [themeState, SetThemeState] = useState('asistec');
  const [themeData, SetThemeData] = useState(asistecTheme({}));
  const [navigationThemeData, SetNavigationThemeData] = useState(
    asistecTheme({}).navigation,
  );

  React.useEffect(() => {
    if (!themeState || themeState === 'asistec') {
      SetThemeData(asistecTheme({variant: darkMode ? 'dark' : 'light'}));
    }
    if (themeState === 'default') {
      SetThemeData(defaultTheme({variant: darkMode ? 'dark' : 'light'}));
    }
    if (themeState === 'test') {
      SetThemeData(testTheme({variant: darkMode ? 'dark' : 'light'}));
    }
  }, [themeState, darkMode]);

  React.useEffect(() => {
    SetNavigationThemeData(themeData.navigation);
  }, [darkMode, themeData]);

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        theme: themeState,
        themeData,
        themeDataNavigation: navigationThemeData,
        setDarkMode,
        setTheme: SetThemeState,
      }}>
      {children}
    </ThemeContext.Provider>
  );
};

// hook
const useCoreTheme = () => {
  const {
    setDarkMode,
    setTheme,
    darkMode,
    theme,
    themeData,
    themeDataNavigation,
  } = React.useContext(ThemeContext);

  return {
    setDarkMode,
    setTheme,
    theme,
    themeData,
    themeDataNavigation,
    darkMode,
  };
};

export {useCoreTheme};
export default CoreThemeProvider;
