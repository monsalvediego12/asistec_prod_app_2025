import React, {memo, useMemo} from 'react';
import {StyleSheet, TouchableOpacity, Text} from 'react-native';
import {BottomSheetBackgroundProps} from '@gorhom/bottom-sheet';
import Animated, {
  useAnimatedStyle,
  interpolateColor,
} from 'react-native-reanimated';
import {useCoreTheme} from '@src/themes';

const CustomBackgroundComponent: React.FC<any> = ({
  style,
  animatedIndex,
  handlePresentModalPressClose,
}) => {
  const {themeData, themeDataNavigation} = useCoreTheme();

  //#region styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    // @ts-ignore
    backgroundColor: interpolateColor(
      animatedIndex.value,
      [0, 1],
      [themeData.colors.backdrop, themeData.colors.backdrop],
    ),
  }));
  const containerStyle = useMemo(
    () => [style, containerAnimatedStyle],
    [style, containerAnimatedStyle],
  );
  //#endregion

  // render
  // return <Animated.View pointerEvents="none" style={containerStyle} />;
  return (
    <Animated.View style={containerStyle}>
      <TouchableOpacity
        onPress={() => handlePresentModalPressClose()}
        style={{
          height: '100%',
          width: '100%',
        }}
      />
    </Animated.View>
  );
};

export const CustomBackground = memo(CustomBackgroundComponent);
