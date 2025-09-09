import * as React from 'react';
import {Text} from 'react-native-paper';

const CoreText = ({children, ...props}) => {
  return <Text {...props}>{children}</Text>;
};

export default CoreText;
