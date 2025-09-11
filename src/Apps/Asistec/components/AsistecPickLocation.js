import React, {useState, useEffect, useRef, useImperativeHandle} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  ActivityIndicator,
  PermissionsAndroid,
  TouchableOpacity,
  Platform,
} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import Geocoder from 'react-native-geocoding'; // Asegúrate de tener esta librería para obtener la dirección
import BottomSheet, {
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {
  CoreButton,
  CoreText,
  CoreTextInput,
  CoreIconMaterialCommunity,
  CoreIconMaterial,
} from '@src/components/';
import {useCoreTheme} from '@src/themes';
import Geolocation from '@react-native-community/geolocation';
import {NativeViewGestureHandler} from 'react-native-gesture-handler';
import AppConfig from '@src/app.config';

const ACTIVE_GEOCODING = true;

const requestLocationPermission = async () => {
  try {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Geolocation Permission',
          message: 'Can we access your location?',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === 'granted') {
        return true;
      } else {
        return false;
      }
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};

const PickLocationMap = React.forwardRef(
  ({chidren, dataObject, onCloseFnt, onSaveFnt, extRegionText}, ref) => {
    const [apiKey, setApiKey] = React.useState(
      Platform.OS === 'ios' ? AppConfig.ios_apikey : AppConfig.android_apikey,
    );

    useEffect(() => {
      Geocoder.init(apiKey);
    }, [apiKey]);

    useEffect(() => {
      requestLocationPermission();
    }, []);

    const {themeData} = useCoreTheme();
    const [isFocused, setIsFocused] = useState(false);

    const inputRef = useRef(null);
    const mapRef = useRef(null);

    const [origin, setOrigin] = useState({
      latitude: 0,
      longitude: 0,
    });

    const [address, setAddress] = useState('');

    const [zoom, setZoom] = useState(0.0004); // Valor inicial del zoom

    const [iniRegion, setinitRegion] = useState({
      latitude: origin?.latitude,
      longitude: origin?.longitude,
      latitudeDelta: zoom,
      longitudeDelta: zoom * 2,
    });

    const [region, setRegion] = useState({
      latitude: origin?.latitude,
      longitude: origin?.longitude,
      latitudeDelta: zoom,
      longitudeDelta: zoom * 2,
    });

    useImperativeHandle(ref, () => ({
      init: () => {
        initComponent();
      },
    }));

    const getAddressFromCoordinates = async (lat, lng) => {
      try {
        if (!ACTIVE_GEOCODING) {
          return null;
        }
        const json = await Geocoder.from(lat, lng);
        const address = json.results[0].formatted_address;
        return address;
      } catch (error) {
        console.error(error);
        return null;
      }
    };

    const getCoordsFromAddress = async addressInfo => {
      inputRef?.current?.blur();
      let coords = null;

      if (!ACTIVE_GEOCODING) {
        return null;
      }

      await Geocoder.from(addressInfo || address)
        .then(json => {
          var location = json.results[0].geometry.location;
          if (location.lat && location.lng) {
            coords = {
              latitude: location.lat,
              longitude: location.lng,
            };
          }
        })
        .catch(error => console.warn(error));
      return coords;
    };

    const initComponent = () => {
      setAddress(dataObject?.loc_address || '');
      if (dataObject?.loc_address_coords?.latitude) {
        setOrigin({
          ...origin,
          ...dataObject?.loc_address_coords,
        });
        setRegion({
          ...region,
          ...dataObject?.loc_address_coords,
        });
        setinitRegion({
          ...iniRegion,
          ...dataObject?.loc_address_coords,
        });
      } else {
        Geolocation.getCurrentPosition(info => {
          setMarkerCurrentLocation(info);
        });
      }
    };

    useEffect(() => {
      setRegion({
        ...region,
        ...origin,
      });
    }, [origin]);

    const handleZoomIn = () => {
      const newZoom = zoom * 0.5;
      setZoom(newZoom);
      setRegion({
        ...region,
        latitudeDelta: newZoom,
        longitudeDelta: newZoom * 2,
      });
    };

    const handleZoomOut = () => {
      const newZoom = zoom * 2;
      setZoom(newZoom);
      setRegion({
        ...region,
        latitudeDelta: newZoom,
        longitudeDelta: newZoom * 2,
      });
    };

    const setMarkerCurrentLocation = async data => {
      try {
        let info;

        if (data) {
          info = data;
        } else {
          info = await new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition(resolve, reject);
          });
        }

        const coords = info?.coords;

        if (coords?.latitude) {
          const address = await getAddressFromCoordinates(
            coords.latitude,
            coords.longitude,
          );

          setAddress(address);
          setOrigin(coords);
          setRegion({
            ...coords,
            ...region,
          });
        }
      } catch (error) {
        console.error('Error getting geolocation', error);
      }
      inputRef?.current?.blur();
    };

    const onMoveMarkerCurrentLocation = async direction => {
      const coords = direction.nativeEvent.coordinate;
      if (coords?.latitude) {
        // setOrigin({
        //   latitude: null,
        //   longitude: null,
        // });
        const address = await getAddressFromCoordinates(
          coords.latitude,
          coords.longitude,
        );
        setAddress(address);
        setOrigin(coords);
      }
    };

    const onChangeTextDirection = data => {
      setAddress(data);
    };

    const clearDirection = () => {
      setAddress(null);
      setOrigin({
        latitude: null,
        longitude: null,
      });
      inputRef?.current?.focus();
    };

    const onSaveCoords = async () => {
      let dataCoords;
      let regionText = extRegionText ?? AppConfig.region_text;
      if (isFocused && address?.length > 0) {
        dataCoords = await getCoordsFromAddress(address + regionText);
        setOrigin(dataCoords);
        inputRef?.current?.blur();
      } else {
        dataCoords = origin;
        if (onSaveFnt && dataCoords?.latitude) {
          onSaveFnt({address, coords: dataCoords});
        }
      }
    };

    const onClose = () => {
      inputRef?.current?.blur();
      if (onCloseFnt) {
        onCloseFnt();
      }
    };

    const getAddresslabel = () => {
      if (isFocused) {
        return address;
      }
      return address && address.length > 40
        ? address.substring(0, 40) + '...'
        : address || '';
    };

    return (
      <View
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          // borderColor: 'red',
          // borderWidth: 1,
        }}>
        <View style={{flex: 1, height: '100%'}}>
          <View style={{paddingHorizontal: 10}}>
            <CoreText variant="titleMedium">Confirmar ubicacion</CoreText>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 10,
            }}>
            <BottomSheetTextInput
              label="Ubicación"
              ref={inputRef}
              value={getAddresslabel()}
              onChangeText={onChangeTextDirection}
              // editable={false}
              style={{
                flex: 1,
                backgroundColor: '#fff',
                borderColor: '#000',
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 10,
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            <TouchableOpacity style={{padding: 5}}>
              <View style={{width: 20, height: 20}}>
                <CoreIconMaterial
                  name="close"
                  size={20}
                  color="#000"
                  onPress={() => clearDirection()}
                />
              </View>
            </TouchableOpacity>
          </View>

          {isFocused ? (
            <>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingTop: 20,
                }}>
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingTop: 20,
                  }}>
                  <ActivityIndicator
                    size="large"
                    color={themeData.colors.asistectSec}
                  />
                </View>
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingTop: 20,
                  }}>
                  <CoreText style={{paddingTop: 10}}>
                    Introduce una direccion válida y presiona el boton Aceptar
                  </CoreText>
                  <CoreText style={{marginTop: 5}}>
                    Ejemplo: Cra 01 oe # 1B - 000, Barrio xxxx
                  </CoreText>
                </View>
              </View>
            </>
          ) : (
            <>
              <View
                style={{
                  paddingHorizontal: 10,
                  marginBottom: 10,
                }}>
                <CoreText style={{fontWeight: 'bold'}}>
                  * Manten y arrastra el maracador a la ubicacion deseada
                </CoreText>
              </View>

              <View
                style={{
                  flex: 1,
                  paddingHorizontal: 10,
                  // borderColor: 'red',
                  // borderWidth: 1,
                }}>
                <NativeViewGestureHandler>
                  <View style={{flex: 1}}>
                    {origin?.longitude &&
                    origin?.latitude &&
                    region?.latitude ? (
                      <MapView
                        ref={mapRef}
                        provider={PROVIDER_GOOGLE}
                        style={{
                          width: '100%',
                          height: '100%',
                        }}
                        zoomEnabled={true}
                        initialRegion={iniRegion}
                        showsUserLocation
                        region={region}>
                        <Marker
                          coordinate={origin}
                          draggable
                          onDragEnd={onMoveMarkerCurrentLocation}
                        />
                        {/* <Marker coordinate={calculateMarkerPosition(region)} /> */}
                      </MapView>
                    ) : (
                      <></>
                    )}
                    <View
                      style={{
                        position: 'absolute',
                        top: 16,
                        justifyContent: 'center', // Centra horizontalmente
                        alignItems: 'center', // Centra verticalmente (opcional)
                        width: '100%', // Opcional: para ocupar todo el ancho
                      }}>
                      <TouchableOpacity
                        onPress={() => setMarkerCurrentLocation()}
                        style={{
                          flexDirection: 'row', // Alinea el icono y el texto en una fila
                          alignItems: 'center', // Centra verticalmente
                          padding: 5,
                          paddingHorizontal: 15,
                          borderWidth: 1,
                          borderRadius: 10,
                          // borderColor: 'orange',
                          // backgroundColor: 'orange',
                          backgroundColor: '#fff',
                          shadowColor: '#000', // Color de la sombra
                          shadowOffset: {width: 0, height: 2}, // Dirección y distancia de la sombra
                          shadowOpacity: 0.25, // Opacidad de la sombra
                          shadowRadius: 3.84, // Radio del blur de la sombra
                          elevation: 5, // Elevación en Android para aplicar sombra
                        }}>
                        <CoreIconMaterial
                          name="my-location"
                          size={20}
                          // color="#fff"
                        />
                        <Text
                          style={{
                            padding: 8,
                            fontWeight: 'bold',
                            // color: '#fff',
                          }}>
                          Ubicacion actual
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={{position: 'absolute', bottom: 16, right: 16}}>
                      <TouchableOpacity
                        onPress={handleZoomIn}
                        disabled={
                          !(
                            origin?.longitude &&
                            origin?.latitude &&
                            region?.latitude
                          )
                        }
                        style={{
                          margin: 5,
                          borderWidth: 1,
                          borderRadius: 10,
                          // borderColor: '#000',
                          backgroundColor: 'white',
                          // borderColor: 'orange',
                          // backgroundColor: 'orange',
                          shadowColor: '#000', // Color de la sombra
                          shadowOffset: {width: 0, height: 2}, // Dirección y distancia de la sombra
                          shadowOpacity: 0.25, // Opacidad de la sombra
                          shadowRadius: 3.84, // Radio del blur de la sombra
                          elevation: 5, // Elevación en Android para aplicar sombra
                        }}>
                        <Text
                          style={{
                            padding: 8,
                            fontWeight: 'bold',
                            // color: '#fff',
                          }}>
                          Zoom +
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleZoomOut}
                        disabled={
                          !(
                            origin?.longitude &&
                            origin?.latitude &&
                            region?.latitude
                          )
                        }
                        style={{
                          margin: 5,
                          borderWidth: 1,
                          borderRadius: 10,
                          // borderColor: '#000',
                          backgroundColor: 'white',
                          // borderColor: 'orange',
                          // backgroundColor: 'orange',
                          shadowColor: '#000', // Color de la sombra
                          shadowOffset: {width: 0, height: 2}, // Dirección y distancia de la sombra
                          shadowOpacity: 0.25, // Opacidad de la sombra
                          shadowRadius: 3.84, // Radio del blur de la sombra
                          elevation: 5, // Elevación en Android para aplicar sombra
                        }}>
                        <Text
                          style={{
                            padding: 8,
                            fontWeight: 'bold',
                            // color: '#fff',
                          }}>
                          Zoom -
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </NativeViewGestureHandler>
              </View>
            </>
          )}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              paddingVertical: 5,
            }}>
            <CoreButton
              mode="contained"
              onPress={() => onSaveCoords()}
              style={{flex: 1}}>
              Aceptar
            </CoreButton>
            <CoreButton
              mode="contained"
              onPress={() => onClose()}
              buttonColor={themeData.colors.asistectSec}
              style={{flex: 1}}>
              Cerrar
            </CoreButton>
          </View>
        </View>
      </View>
    );
  },
);

export default PickLocationMap;
