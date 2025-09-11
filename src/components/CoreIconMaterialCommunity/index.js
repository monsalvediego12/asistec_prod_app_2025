import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import {useCoreTheme} from '@src/themes';

const coreIconMaterial = ({...props}) => {
  const {themeData} = useCoreTheme();

  return (
    <MaterialCommunityIcons
      color={themeData.colors.outline}
      {...props}
    />
  );
};
export default coreIconMaterial;
