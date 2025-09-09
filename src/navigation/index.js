const DevNavigationStack = () => {
  const Stack = createStackNavigator();

  return (
    <Stack.Navigator initialRouteName="DevHomeView">
      <Stack.Group
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Main" component={DevNavigation} />
      </Stack.Group>
      <Stack.Group screenOptions={{presentation: 'modal'}}>
        <Stack.Screen name="ModalExampleDev" component={ModalExampleDev} />
      </Stack.Group>
    </Stack.Navigator>
  );
};
