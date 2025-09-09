import React, {forwardRef, useMemo, useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Button,
  Pressable,
  Dimensions,
} from 'react-native';
import BottomSheet, {
  useBottomSheet,
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

const {height} = Dimensions.get('window');

const CustomBottomSheet = forwardRef((props, ref) => {
  const {modalContent, snapPointsLst, indexInitial} = props;
  const snapPoints = useMemo(() => snapPointsLst || ['25%', '50%', '85%'], []);
  const bottomSheetModalRef = React.useRef();

  const [index, setIndex] = useState(indexInitial || -1);

  const getCurrentIndex = React.useCallback(() => {
    return index;
  }, [index]);

  const openBottomSheet = React.useCallback(position => {
    if (position) {
      bottomSheetModalRef.current?.snapToPosition(position);
    } else {
      bottomSheetModalRef.current?.expand();
    }
  }, []);

  const closeBottomSheet = React.useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);

  React.useImperativeHandle(ref, () => ({
    getCurrentIndex,
    open: position => {
      openBottomSheet(position);
    },
    close: () => {
      closeBottomSheet();
    },
  }));

  const renderBackdrop = React.useCallback(props => {
    const {close} = useBottomSheet();
    return (
      <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props}>
        <Pressable onPress={() => close()} style={{flex: 1}}>
          <Text />
        </Pressable>
      </BottomSheetBackdrop>
    );
  }, []);

  return (
    <BottomSheet
      ref={bottomSheetModalRef}
      index={index}
      onChange={setIndex}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      keyboardBehavior={'interactive'}
      keyboardBlurBehavior={'restore'}>
      <BottomSheetView style={styles.contentContainer}>
        {modalContent ? (
          typeof modalContent === 'function' ? (
            modalContent()
          ) : (
            modalContent
          )
        ) : (
          <Text>CoreBottomSheet</Text>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    height: '100%',
  },
});

export default CustomBottomSheet;
