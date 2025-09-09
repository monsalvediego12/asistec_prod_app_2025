// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import {useCoreTheme} from '@src/themes';

const coreIconMaterial = ({...props}) => {
  const {themeData} = useCoreTheme();

  return (
    <MaterialCommunityIcons
      color={themeData.colors.outline}
      {...props}
      //   name={'menu'}
      //   size={24}

      //   onPress={navigation.toggleDrawer}
    />
  );
};
export default coreIconMaterial;
