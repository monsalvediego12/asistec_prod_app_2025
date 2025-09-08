# Asistec

com.asistecprod.asistecapp

### branch, changelog y versiones

- Los cambios se hacen en un rama aparte siempre y se fusionan con main.
- al subir de version se crea una rama igualmente, se modifica el chagelog y la version.
- En changelog.txt se debe introducir info de cada cambios subido.
- Se validan los cambios y se fucionan las ramas.
- Se debe subir de version el core_app.config.
- Se debe subir de version el proyecto y especificar en changelog.tx la version.
  - Actualizar manualmente package.json -> "version": "0.1.1" -> se actualiza la version
  - yarn react-native-version --never-amend (Actualiza los dos proyectos)
- En iOs, se debe abrir Asistec.xcworkspace en Xcode y subir el campo version y build en Targets Asistec -> Identy.
- Clean build -> Build
- **Ejemplo changelog.txt**
  0.1.1 -> Version nueva
  00-00-0000 -> Fecha de cambios
  -xxx xxx -> Resumen de version, cambios que se hacen para la nueva version
  00-00-0000 -> Fecha de cambios hechos en otro dia
  -xxx xxx -> Resumen de cambios hechos otro dia
  0.1.2 ..., ...

### comandos

app.xcworkspace

yarn install

cd ios
  
  bundle install

  bundle exec pod install

npx pod-install ios

npx react-native run-android

npx react-native run-ios

yarn start --reset-cache

npx react-native start — reset-cache

RCT_NEW_ARCH_ENABLED=1 pod install

npx react-native-rename@latest "Asistec" -b "com.asistecapp"

watchman watch-del-all

npx pod-install ios --allow-root

cd android && ./gradlew signingReport

cd android &&./gradlew clean

cd android && ./gradlew assembleRelease

yarn react-native-version --never-amend

npx react-native build-android --mode=release

Xcode, Product -> Clean build, Build, Archive - Window -> Organizer

Distribute App -> App Store Conect

### resourses

https://stackoverflow.com/questions/1080556/how-can-i-test-apple-push-notification-service-without-an-iphone

https://stackoverflow.com/questions/76792138/sandbox-bash72986-deny1-file-write-data-users-xxx-ios-pods-resources-to-co

https://www.youtube.com/watch?v=r-Z--YDrmjI&t=485s&ab_channel=notJust%E2%80%A4dev

### dev_team & technical_support

desarrollado por: [diegomonsalve.com](https://diegomonsalve.com)


### package

https://gorhom.dev/react-native-bottom-sheet/
yarn add @gorhom/bottom-sheet@^5
yarn add react-native-reanimated react-native-gesture-handler
yarn add react-native-worklets

yarn add @react-native-async-storage/async-storage

https://github.com/react-native-maps/react-native-maps/blob/master/docs/installation.md
yarn add react-native-maps

https://reactnavigation.org/docs/getting-started/