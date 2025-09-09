import * as React from 'react';
import {View, ActivityIndicator, Modal, Text, StyleSheet} from 'react-native';
import AppConfig from '@src/app.config';

// styles
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

const CoreModal = ({state, message}) => {
  const [loader, setLoader] = React.useState(false);
  const [loaderMessage, setLoaderMessage] = React.useState('default');

  React.useEffect(() => {
    setLoader(state);
    setLoaderMessage(message);
  }, [state, message]);
  //   const {appSetLoader, loaderState} = useCoreComponents();

  return (
    <Modal
      backdropDismiss={true}
      transparent={true}
      visible={loader}
      onRequestClose={() => {
        // appSetLoader({state: !loaderState.state});
        return false;
      }}>
      <View
        style={[styles.centeredView, {backgroundColor: 'rgba(0, 0, 0, 0.7)'}]}>
        <View style={styles.modalView}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text
            onPress={() => {
              if (AppConfig.is_dev) {
                setLoader(!loader);
              }
            }}
            style={styles.modalText}>
            {loaderMessage}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default CoreModal;
