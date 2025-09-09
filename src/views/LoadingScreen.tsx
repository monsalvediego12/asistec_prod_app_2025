// Importa las dependencias necesarias
import React from 'react';
import {View, ActivityIndicator, Text, StyleSheet} from 'react-native';
import {Dialog} from 'react-native-paper'; // Asumiendo que estás utilizando react-native-paper para el componente Dialog
import {useCoreTheme} from '@src/themes';
import {useSelector} from 'react-redux';

// Define la pantalla
const LoaderScreen = () => {
  const {themeData} = useCoreTheme();
  const selectorAppStore = useSelector(state => state?.app);

  return (
    <View style={[stylesLoaderComponent.centeredView]}>
      <Dialog visible={true}>
        <Dialog.Content>
          <View style={stylesLoaderComponent.flexing}>
            <ActivityIndicator
              color={themeData.colors.tertiary}
              size={48}
              style={stylesLoaderComponent.marginRight}
            />
            <Text>{selectorAppStore.loader_view_msg}</Text>
          </View>
        </Dialog.Content>
      </Dialog>
    </View>
  );
};

// Exporta la pantalla
export default LoaderScreen;

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
