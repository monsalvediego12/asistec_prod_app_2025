import * as React from 'react';
import {TextInput} from 'react-native-paper';

const CoreTextInput = ({children, ...props}) => {
  return (
    <TextInput style={{backgroundColor: 'transparent'}} {...props}>
      {children}
    </TextInput>
  );
};

CoreTextInput.Icon = TextInput.Icon;
CoreTextInput.Affix = TextInput.Affix;

export default CoreTextInput;
