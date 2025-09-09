import * as React from 'react';
import {Image} from 'react-native';

const CoreImage = ({children = null, ...props}) => {
  return <Image {...props}>{children}</Image>;
};

export default CoreImage;
