import React, {
  useCallback,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {View, Text, Animated} from 'react-native';
import {useCoreTheme} from '@src/themes';
import {CustomBackground} from './CustomBackgroundComponent';
import {
  ScrollView,
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';

const CoreBottomSheetModal = forwardRef(
  ({children, modalContent, height = '60%'}, ref) => {
    const bottomSheetModalRef = useRef();
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const [sheetIndex, setSheetIndex] = React.useState(-1); // State to track sheet visibility
    const {themeData, themeDataNavigation} = useCoreTheme();
    const panGestureHandlerRef = useRef(null);

    useImperativeHandle(ref, () => ({
      open: () => {
        handlePresentModalPress();
      },
      close: () => {
        handlePresentModalPressClose();
      },
    }));

    const fadeIn = () => {
      // Will change fadeAnim value to 1 in 5 seconds
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    };

    const fadeOut = () => {
      // Will change fadeAnim value to 0 in 3 seconds
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start();
    };

    const handlePresentModalPress = React.useCallback(() => {
      fadeIn();
      setSheetIndex(1);
      bottomSheetModalRef.current?.present();
    }, []);

    const handlePresentModalPressClose = React.useCallback(() => {
      fadeOut();
      setSheetIndex(-1);
      bottomSheetModalRef?.current?.close();
    }, []);

    const handleSheetChanges = React.useCallback(index => {
      setSheetIndex(index);
    }, []);

    const handleDrag = useCallback(
      event => {
        if (event.nativeEvent.translationY > 0) {
          // Only allow dragging downwards
          const newIndex = Math.max(
            0, // Ensure index doesn't go below 0
            sheetIndex - Math.floor(event.nativeEvent.translationY / 100), // Translate drag distance to index change
          );
          setSheetIndex(newIndex);
        }
      },
      [sheetIndex],
    );

    const handleDragEnd = useCallback(() => {
      if (sheetIndex > 0) {
        // If still partially open after drag, close completely
        handlePresentModalPressClose();
      }
    }, [sheetIndex, handlePresentModalPressClose]);

    React.useEffect(() => {
      if (
        sheetIndex == 0 ||
        sheetIndex == -1 ||
        sheetIndex == '0' ||
        sheetIndex == '-1'
      ) {
        handlePresentModalPressClose();
      }
    }, [sheetIndex]);

    return (
      <View style={{flex: 1}}>
        <GestureHandlerRootView>
          <BottomSheetModalProvider>
            <View style={{flex: 1}}>
              {typeof children === 'function' ? children() : children}
            </View>
            <BottomSheetModal
              ref={bottomSheetModalRef}
              snapPoints={['1%', height]}
              index={sheetIndex}
              onChange={handleSheetChanges}
              backdropComponent={props => (
                <CustomBackground
                  {...props}
                  handlePresentModalPressClose={handlePresentModalPressClose}
                />
              )}
              backgroundStyle={{backgroundColor: themeData.colors.surface}}
              handleIndicatorStyle={{
                backgroundColor: themeData.colors.onSurface,
              }}>
              <PanGestureHandler
                ref={panGestureHandlerRef}
                onGestureEvent={handleDrag}
                onEnd={handleDragEnd}>
                <ScrollView>
                  <View>
                    {modalContent ? (
                      typeof modalContent === 'function' ? (
                        modalContent()
                      ) : (
                        modalContent
                      )
                    ) : (
                      <Text>CoreBottomSheetModal</Text>
                    )}
                  </View>
                </ScrollView>
              </PanGestureHandler>
            </BottomSheetModal>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </View>
    );
  },
);

export default CoreBottomSheetModal;
