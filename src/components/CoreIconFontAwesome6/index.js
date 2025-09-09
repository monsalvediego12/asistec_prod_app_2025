import MaterialIcon from '@react-native-vector-icons/fontawesome6';
import {useCoreTheme} from '@src/themes';

const coreIconMaterial = ({...props}) => {
  const {themeData} = useCoreTheme();
  return (
    <MaterialIcon
      color={themeData?.colors?.outline || '#000'}
      {...props}
      //   name={'menu'}
      //   size={24}
      //   onPress={navigation.toggleDrawer}
    />
  );
};
export default coreIconMaterial;
