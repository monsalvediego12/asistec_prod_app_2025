import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

import AppConfig from '@src/app.config';

function ScreenView({route, navigation}: any) {

  // Estados del mapa
  const [location, setLocation]: any = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [apiKey] = React.useState(
    Platform.OS === 'ios' ? AppConfig.ios_apikey : AppConfig.android_apikey,
  );

  // Función para pedir permisos de ubicación
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de Ubicación',
            message: 'Necesita acceso a tu ubicación para mostrar el mapa',
            buttonNeutral: 'Pregúntame después',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Error requesting location permission:', err);
        return false;
      }
    }
    return true; // iOS maneja permisos automáticamente
  };

  // Obtener ubicación actual
  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const {latitude, longitude} = position.coords;
        console.log('Location:', {latitude, longitude});
        setLocation({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setLoading(false);
      },
      (error) => {
        console.warn('Error getting location:', error);
        // Fallback a Bogotá si no se puede obtener ubicación
        setLocation({
          latitude: 4.711,
          longitude: -74.0721,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  };

  // Inicializar ubicación al montar el componente
  React.useEffect(() => {
    const initLocation = async () => {
      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        getCurrentLocation();
      } else {
        // Sin permisos, usar Bogotá como fallback
        setLocation({
          latitude: 4.711,
          longitude: -74.0721,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setLoading(false);
      }
    };

    initLocation();
  }, []);

  return (
    <>
        {loading ? (
          <View style={[styles.loadingContainer, {}]}>
            <ActivityIndicator size="large" color={'#6200ea'} />
            <Text style={{ marginTop: 10}}>
              Obteniendo ubicación...
            </Text>
          </View>
        ) : (
          location && apiKey ? (
            <View style={{flex: 1}}>
             <Text style={{color: '#000', marginTop: 5}}>
                API Key: {apiKey ? 'OK' : 'Missing'}
              </Text>
              <Text style={{color: '#000'}}>
                Ubicación: {location ? 'OK' : 'Missing'}
              </Text>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={location}
              showsUserLocation={true}
              showsMyLocationButton={true}
              followsUserLocation={false}>
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title="Tu ubicación"
                description="Ubicación actual del dispositivo"
              />
            </MapView>
            </View>
          ) : (
            <View style={[styles.errorContainer, {backgroundColor: '#fff'}]}>
              <Text style={[styles.errorText, {color: '#f00'}]}>
                Error: No se pudo cargar el mapa
              </Text>
              <Text style={{color: '#000', marginTop: 5}}>
                API Key: {apiKey ? 'OK' : 'Missing'}
              </Text>
              <Text style={{color: '#000'}}>
                Ubicación: {location ? 'OK' : 'Missing'}
              </Text>
            </View>
          )
        )}
    </>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ScreenView;