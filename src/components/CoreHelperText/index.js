import * as React from 'react';
import {HelperText} from 'react-native-paper';

const CoreHelperText = ({children, ...props}) => {
  return <HelperText {...props}>{children}</HelperText>;
};

export default CoreHelperText;
