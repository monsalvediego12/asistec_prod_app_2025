import React from 'react';
import {BackHandler} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

/**
 * Hook personalizado para manejar la navegación hacia atrás
 * Convierte el comportamiento de modales a vistas normales del Stack
 */
export const useNavigationBack = (options = {}) => {
  const navigation = useNavigation();
  const {
    onBeforeGoBack, // Función a ejecutar antes de navegar atrás
    fallbackRoute = 'HomeView', // Ruta de fallback si no hay historial
  } = options;

  // Función que maneja la navegación atrás
  const handleGoBack = React.useCallback(() => {
    // Ejecutar función antes de navegar (ej: guardar datos)
    if (onBeforeGoBack) {
      onBeforeGoBack();
    }

    // Verificar si hay historial en el stack
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Fallback a una ruta específica si no hay historial
      navigation.navigate(fallbackRoute);
    }
  }, [navigation, onBeforeGoBack, fallbackRoute]);

  // Configurar el botón físico "atrás" en Android
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleGoBack();
        return true; // Prevenir comportamiento por defecto
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => backHandler.remove();
    }, [handleGoBack]),
  );

  return {
    goBack: handleGoBack,
    canGoBack: navigation.canGoBack(),
  };
};

export default useNavigationBack;