import * as React from 'react';
import {Image, Pressable} from 'react-native';
import ImageModal from 'react-native-image-modal';

const CoreImageModal = ({children = null, ...props}) => {
  const imageModalRef = React.useRef(null);

  const handlePress = () => {
    imageModalRef?.current?.open();
  };

  return (
    <>
      <Pressable onPress={() => handlePress()}>
        <Image {...props}>{children}</Image>
      </Pressable>
      <ImageModal
        ref={imageModalRef}
        source={{
          uri:
            props?.source?.uri ||
            'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
        }}
      />
    </>
  );
};

export default CoreImageModal;
