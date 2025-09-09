import * as React from 'react';
import {Button} from 'react-native-paper';

const CoreButton = ({children, style = {}, ...props}) => {
  return (
    <Button {...props} style={{margin: 1, ...style}}>
      {children}
    </Button>
  );
};

export default CoreButton;
