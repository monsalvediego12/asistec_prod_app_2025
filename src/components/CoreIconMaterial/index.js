import MaterialIcon from '@react-native-vector-icons/material-icons';
import {useCoreTheme} from '@src/themes';

const coreIconMaterial = ({...props}) => {
  const {themeData} = useCoreTheme();
  return (
    <MaterialIcon
      color={themeData?.colors?.outline || '#000'}
      {...props}
    />
  );
};
export default coreIconMaterial;
