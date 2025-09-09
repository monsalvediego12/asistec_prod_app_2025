import React from 'react';
import {View, Text, Alert, ScrollView} from 'react-native';
import {FAB, Portal} from 'react-native-paper';
import auth from '@react-native-firebase/auth'; // Asegúrate de tener esta importación si estás usando Firebase

function IndexView({navigation}) {
  const [visible, setVisible] = React.useState(true);
  const [openMenu, setOpenMenu] = React.useState(false);
  const [toggleStackOnLongPress, setToggleStackOnLongPress] =
    React.useState(false);

  // Verifica si estás en un ambiente web, puede que necesites ajustar esta línea dependiendo de tu entorno
  const isWeb = Platform.OS === 'web';

  return (
    <View style={{flex: 1}}>
      <ScrollView style={{paddingHorizontal: 20}}>
        <Text>Users</Text>
        <Text>{JSON.stringify(auth().currentUser, null, 2)}</Text>
        <Text>{JSON.stringify(auth().currentUser, null, 2)}</Text>
      </ScrollView>
      <Portal>
        <FAB.Group
          open={openMenu}
          icon={openMenu ? 'calendar-today' : 'plus'}
          actions={[
            {icon: 'close', onPress: () => console.log('Pressed add')},
            {
              icon: 'star',
              label: 'Star',
              onPress: () => console.log('Pressed star'),
            },
            {
              icon: 'email',
              label: 'Email',
              onPress: () => console.log('Pressed email'),
            },
            {
              icon: 'bell',
              label: 'Remind',
              onPress: () => console.log('Pressed remind'),
              small: false,
            }, // `size` no es una propiedad válida. Usa `small` para tamaño.
            {
              icon: toggleStackOnLongPress ? 'gesture-tap' : 'gesture-tap-hold',
              label: toggleStackOnLongPress
                ? 'Toggle on Press'
                : 'Toggle on Long Press',
              onPress: () => setToggleStackOnLongPress(!toggleStackOnLongPress),
            },
          ]}
          onStateChange={({open}) => setOpenMenu(open)} // Aquí es donde necesitas corregir
          onLongPress={() => {
            if (!toggleStackOnLongPress || openMenu) {
              isWeb
                ? alert('FAB is Long Pressed')
                : Alert.alert('FAB is Long Pressed');
            }
          }}
          visible={visible}
        />
      </Portal>
    </View>
  );
}

export default IndexView;
