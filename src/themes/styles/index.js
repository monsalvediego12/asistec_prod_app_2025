import {
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
} from '@react-navigation/native';
import {
  MD3LightTheme as PapperDefaultTheme,
  MD3DarkTheme as PapperMD3DarkTheme,
} from 'react-native-paper';

// primary: Define el color principal del tema.
// onPrimary: Define el color de texto sobre el color primario.
// primaryContainer: Define el color de fondo para los contenedores con el color primario.
// onPrimaryContainer: Define el color de texto sobre el color de fondo primario.
// secondary: Define un color secundario.
// onSecondary: Define el color de texto sobre el color secundario.
// secondaryContainer: Define el color de fondo para los contenedores con el color secundario.
// onSecondaryContainer: Define el color de texto sobre el color de fondo secundario.
// tertiary: Define un color terciario.
// onTertiary: Define el color de texto sobre el color terciario.
// tertiaryContainer: Define el color de fondo para los contenedores con el color terciario.
// onTertiaryContainer: Define el color de texto sobre el color de fondo terciario.
// error: Define un color para indicar errores.
// onError: Define el color de texto sobre el color de error.
// errorContainer: Define el color de fondo para los contenedores con el color de error.
// onErrorContainer: Define el color de texto sobre el color de fondo de error.
// background: Define el color de fondo general de la aplicación.
// onBackground: Define el color de texto sobre el color de fondo general.
// surface: Define el color de fondo de las superficies, como tarjetas y paneles.
// onSurface: Define el color de texto sobre el color de fondo de la superficie.
// surfaceVariant: Define una variante del color de fondo de la superficie.
// onSurfaceVariant: Define el color de texto sobre la variante de la superficie.
// outline: Define un color para los contornos de los elementos.
// outlineVariant: Define una variante del color de contorno.
// shadow: Define un color para las sombras.
// scrim: Define un color de fondo para el scrim, un área semiopaca utilizada para resaltar información.
// inverseSurface: Define un color de fondo invertido para las superficies.
// inverseOnSurface: Define el color de texto sobre la superficie invertida.
// inversePrimary: Define un color primario invertido.
// elevation: Define colores para diferentes niveles de elevación, utilizados para las sombras de los componentes.
// surfaceDisabled: Define un color de fondo para las superficies deshabilitadas.
// onSurfaceDisabled: Define el color de texto sobre la superficie deshabilitada.
// backdrop: Define un color para el fondo de la pantalla de fondo o de enfoque.

const palette = {
  purple: '#5A31F4',
  green: '#0ECD9D',
  red: '#CD0E61',
  black: '#0B0B0B',
  white: '#F0F2F3',
  yellow: '#f1c40f',
  //
  primary: 'rgb(190, 194, 255)',
  onPrimary: 'rgb(0, 1, 172)',
  primaryContainer: 'rgb(0, 0, 239)',
  onPrimaryContainer: 'rgb(224, 224, 255)',
  secondary: 'rgb(197, 196, 221)',
  onSecondary: 'rgb(46, 47, 66)',
  secondaryContainer: 'rgb(68, 69, 89)',
  onSecondaryContainer: 'rgb(225, 224, 249)',
  tertiary: 'rgb(232, 185, 213)',
  onTertiary: 'rgb(70, 38, 59)',
  tertiaryContainer: 'rgb(94, 60, 82)',
  onTertiaryContainer: 'rgb(255, 216, 238)',
  error: 'rgb(255, 180, 171)',
  onError: 'rgb(105, 0, 5)',
  errorContainer: 'rgb(147, 0, 10)',
  onErrorContainer: 'rgb(255, 180, 171)',
  background: 'rgb(27, 27, 31)',
  onBackground: 'rgb(229, 225, 230)',
  surface: 'rgb(27, 27, 31)',
  onSurface: 'rgb(229, 225, 230)',
  surfaceVariant: 'rgb(70, 70, 79)',
  onSurfaceVariant: 'rgb(199, 197, 208)',
  outline: 'rgb(145, 144, 154)',
  outlineVariant: 'rgb(70, 70, 79)',
  shadow: 'rgb(0, 0, 0)',
  scrim: 'rgb(0, 0, 0)',
  inverseSurface: 'rgb(229, 225, 230)',
  inverseOnSurface: 'rgb(48, 48, 52)',
  inversePrimary: 'rgb(52, 61, 255)',
  elevation: {
    level0: 'transparent',
    level1: 'rgb(35, 35, 42)',
    level2: 'rgb(40, 40, 49)',
    level3: 'rgb(45, 45, 56)',
    level4: 'rgb(47, 47, 58)',
    level5: 'rgb(50, 50, 62)',
  },
  surfaceDisabled: 'rgba(229, 225, 230, 0.12)',
  onSurfaceDisabled: 'rgba(229, 225, 230, 0.38)',
  backdrop: 'rgba(48, 48, 56, 0.4)',
};

const baseTheme = ({variant}) => {
  let theme = {
    // react-native-paper
    ...PapperDefaultTheme,
    colors: {
      ...palette,
      ...PapperDefaultTheme.colors,
      primary: '#fff',
    },
    // react-navigation
    navigation: {
      ...NavigationDefaultTheme,
      colors: {
        ...palette,
        ...NavigationDefaultTheme.colors,
      },
    },
  };

  if (variant === 'dark') {
    theme = {
      ...theme,
      ...PapperMD3DarkTheme,
      colors: {
        ...palette,
        ...PapperMD3DarkTheme.colors,
      },
      navigation: {
        ...theme.navigation,
        ...NavigationDarkTheme,
        colors: {
          ...palette,
          ...theme.navigation.colors,
          ...NavigationDarkTheme.colors,
        },
        dark: true,
      },
      dark: true,
    };
  }
  return theme;
};

const defaultTheme = ({variant}) => {
  const baseThemeData = baseTheme({variant});
  let theme = {
    ...baseThemeData,
  };

  return {
    ...theme,
  };
};

const testTheme = ({variant}) => {
  const baseThemeData = baseTheme({variant});
  let theme = {
    ...baseThemeData,
  };

  if (!variant || variant === 'light') {
    theme.colors.primary = palette.yellow;
  }

  if (variant === 'dark') {
    theme.colors.primary = palette.green;
  }

  return {
    ...theme,
  };
};

const asistecTheme = ({variant}) => {
  const baseThemeData = baseTheme({variant});
  let theme = {
    ...baseThemeData,
  };

  theme.colors = {
    primary: 'rgb(0, 106, 99)',
    onPrimary: 'rgb(255, 255, 255)',
    primaryContainer: '#015953',
    onPrimaryContainer: 'rgb(0, 32, 29)',
    secondary: 'rgb(74, 99, 96)',
    onSecondary: 'rgb(255, 255, 255)',
    secondaryContainer: 'rgb(204, 232, 228)',
    onSecondaryContainer: 'rgb(5, 31, 29)',
    tertiary: 'rgb(71, 97, 122)',
    onTertiary: 'rgb(255, 255, 255)',
    tertiaryContainer: 'rgb(206, 229, 255)',
    onTertiaryContainer: 'rgb(0, 29, 51)',
    error: 'rgb(186, 26, 26)',
    onError: 'rgb(255, 255, 255)',
    errorContainer: 'rgb(255, 218, 214)',
    onErrorContainer: 'rgb(65, 0, 2)',
    background: 'rgb(250, 253, 251)',
    onBackground: 'rgb(25, 28, 28)',
    surface: 'rgb(250, 253, 251)',
    onSurface: 'rgb(25, 28, 28)',
    surfaceVariant: 'rgb(218, 229, 226)',
    onSurfaceVariant: 'rgb(63, 73, 71)',
    outline: 'rgb(111, 121, 119)',
    outlineVariant: 'rgb(190, 201, 198)',
    shadow: 'rgb(0, 0, 0)',
    scrim: 'rgb(0, 0, 0)',
    inverseSurface: 'rgb(45, 49, 48)',
    inverseOnSurface: 'rgb(239, 241, 240)',
    inversePrimary: 'rgb(80, 219, 207)',
    elevation: {
      level0: 'transparent',
      level1: 'rgb(238, 246, 243)',
      level2: 'rgb(230, 241, 239)',
      level3: 'rgb(223, 237, 234)',
      level4: 'rgb(220, 235, 233)',
      level5: 'rgb(215, 232, 230)',
    },
    surfaceDisabled: 'rgba(25, 28, 28, 0.12)',
    onSurfaceDisabled: 'rgba(25, 28, 28, 0.38)',
    backdrop: 'rgba(41, 50, 49, 0.4)',
    asistectSec: '#F9992F',
    onAsistectSec: 'rgb(255, 255, 255)',
    asistectSecContainer: 'rgb(255, 220, 192)',
    onAsistectSecContainer: 'rgb(45, 22, 0)',
  };

  return {
    ...theme,
  };
};

export {defaultTheme, testTheme, asistecTheme};
