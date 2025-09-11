import { baseTheme } from '@src/themes/styles/';

const asistecTheme = ({ variant }) => {
    const baseThemeData = baseTheme({ variant });
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

export { asistecTheme }