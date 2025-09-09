import * as React from 'react';
import {View} from 'react-native';
import {CoreText} from '@src/components/';

const IndexLayout = ({children, modeDev}) => {
  return (
    <View
      style={{
        flex: 1,
      }}>
      <View
        style={{
          flex: 1,
        }}>
        {typeof children === 'function' ? children() : children}
      </View>
      <View
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          width: '100%',
        }}>
        {modeDev ? <CoreText>CORE - LAYOUT</CoreText> : <></>}
      </View>
    </View>
  );
};

export default IndexLayout;
