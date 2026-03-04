# Asistec

**Versión:** 0.1.11

**Plataformas:** Android · iOS

**Package:** com.asistecprod.asistecapp

---

## ¿Qué es Asistec?

Asistec es una aplicación móvil para la gestión integral de servicios técnicos del hogar. Permite agendar, asignar, hacer seguimiento y cerrar órdenes de servicio en tiempo real, coordinando clientes, técnicos y administradores desde un solo lugar.

---

## Roles de usuario

| Rol               | Tipo | Descripción                                                          |
| ----------------- | ---- | -------------------------------------------------------------------- |
| **Administrador** | 1    | Acceso total: gestiona servicios, usuarios, clientes y configuración |
| **Técnico**       | 2    | Ve y opera sus propias órdenes de servicio asignadas                 |
| **Cliente**       | 3    | Agenda servicios, hace seguimiento y aprueba cotizaciones y actas    |

---

## Tipos de servicios

| Servicio     | Código         | Prefijo consecutivo |
| ------------ | -------------- | ------------------- |
| Jardinería   | `JARDINERIA`   | J                   |
| Vidriería    | `VIDRERIA`     | V                   |
| Gas natural  | `GASNATURAL`   | G                   |
| Plomería     | `PLOMERIA`     | P                   |
| Electricidad | `ELECTRICIDAD` | E                   |

Cada orden de servicio recibe un consecutivo único según el tipo, por ejemplo: `G0553` para Gas natural.

---

## Flujo de una orden de servicio

Las órdenes avanzan por **12 estados** en secuencia:

| #   | Estado               | Descripción                                            |
| --- | -------------------- | ------------------------------------------------------ |
| 1   | **Agendado**         | Orden creada, pendiente de inicio                      |
| 2   | **En Espera**        | En pausa temporal                                      |
| 3   | **En Camino**        | Técnico en tránsito hacia el lugar                     |
| 4   | **En Predio**        | Técnico llegó al lugar del servicio                    |
| 5   | **Cotización**       | Técnico genera presupuesto para aprobación del cliente |
| 6   | **Ejecución**        | Trabajo en curso                                       |
| 7   | **Acta de servicio** | Técnico genera acta; cliente debe firmar               |
| 8   | **Pago**             | Pendiente de pago                                      |
| 9   | **Pagado**           | Pago registrado                                        |
| 10  | **Finalizado**       | Servicio completado internamente                       |
| 11  | **Entregado**        | Servicio entregado al cliente                          |
| 12  | **Garantía**         | Solicitud de garantía activa                           |

### Franjas horarias disponibles para agendar

`08:00 AM · 10:00 AM · 12:00 PM · 02:00 PM · 04:00 PM`

---

## Pantallas de la aplicación

### Acceso

#### Login

Inicio de sesión mediante **número de teléfono** con verificación por SMS (Firebase Auth). No requiere contraseña.

---

### Pantallas generales (todos los roles)

#### Inicio (Home)

Pantalla principal que muestra las **categorías de servicios disponibles** con imágenes ilustrativas. Al seleccionar una categoría, el cliente puede agendar un nuevo servicio.

#### Perfil

Permite al usuario editar sus datos personales (nombre, dirección, etc.) y subir una **foto de perfil**. Para usuarios nuevos, es obligatorio completar el perfil antes de continuar.

#### Términos y Condiciones

Pantalla con los términos de uso y política de privacidad de la aplicación.

#### Notificaciones

Historial de todas las **notificaciones push** recibidas, con fecha, tipo y servicio relacionado.

#### Chat de servicio

Mensajería en tiempo real asociada a cada orden de servicio. Existen dos canales:

- **Canal cliente–técnico:** visible para el cliente y el técnico asignado
- **Canal admin–técnico:** comunicación interna (solo admin y técnico)

---

### Gestión de servicios

#### Lista de servicios

Vista principal de administración con todas las órdenes de servicio. Incluye:

- Búsqueda por texto
- Filtros por fecha, estado, tipo de servicio, cliente, técnico y ciudad
- Código de color por estado para identificación rápida
- Acceso directo al detalle de cada orden

#### Filtros de servicios

Panel de configuración de filtros para la lista de servicios. Permite seleccionar rango de fechas, estado y otras categorías.

#### Agendar servicio (`ModalScheduleService`)

Formulario para crear una nueva orden de servicio. Campos:

- Tipo de servicio
- Cliente asociado
- Técnico asignado
- Fecha y franja horaria
- Ciudad
- Descripción del problema
- Fotos adjuntas (opcional)

#### Seguimiento de servicio (`ModalServiceTracking`)

Vista de resumen de una orden activa. Muestra:

- Estado actual con mapa de ubicación del técnico
- Información del cliente y técnico
- Acceso al chat y al detalle completo

#### Detalle del servicio (`ModalServiceTrackingDetails`)

Vista completa de la orden de servicio. Organizada por secciones según el avance:

| Sección                                                      | Disponible desde estado |
| ------------------------------------------------------------ | ----------------------- |
| Datos generales (fecha, hora, técnico, cliente)              | Siempre                 |
| Registro fotográfico de llegada                              | Estado 4 (En Predio)    |
| **Cotización** (ítems, precios, observaciones, descarga PDF) | Estado 5                |
| Registro fotográfico antes/después                           | Estado 6 (Ejecución)    |
| **Acta de servicio** (firma digital, descarga PDF)           | Estado 7                |
| Evidencia de pago                                            | Estado 8                |
| Entrega y cierre                                             | Estado 10–11            |

#### Acta de servicio (`ModalServiceOrderActa`)

Documento formal del servicio con los trabajos realizados, observaciones y **firma digital del cliente**. Una vez firmada, queda bloqueada para edición.

#### Garantía (`ServiceWarranty`)

Gestión de solicitudes de garantía sobre servicios finalizados. El cliente puede activar una garantía y el administrador la gestiona desde esta vista.

---

### Administración (solo Admin)

#### Clientes

Lista de todos los clientes registrados. Permite buscar, ver detalle y editar información de cada cliente.

#### Usuarios

Gestión de todos los usuarios de la app (administradores, técnicos, clientes). Permite cambiar roles y activar/desactivar cuentas.

#### Servicios (catálogo)

Configuración del catálogo de tipos de servicios disponibles en la aplicación. Desde aquí se habilitan o deshabilitan los servicios que aparecen en el Inicio.

---

## Notificaciones push

La app envía notificaciones automáticas en los siguientes eventos:

| Evento                  | Destinatario           |
| ----------------------- | ---------------------- |
| Nueva orden agendada    | Administradores        |
| Técnico en camino       | Cliente                |
| Técnico llegó al predio | Cliente                |
| Cotización generada     | Cliente y Admin        |
| Cotización aceptada     | Técnico y Admin        |
| Acta firmada            | Admin y Técnico        |
| Pago registrado         | Admin                  |
| Nuevo mensaje de chat   | Participantes del chat |

Las notificaciones funcionan con la app abierta, en segundo plano y con la app cerrada.

---

## Configuración del proyecto (`core_app.config.js`)

Este archivo centraliza todos los parámetros configurables de la aplicación.

### Parámetros principales

| Parámetro              | Descripción                                                           |
| ---------------------- | --------------------------------------------------------------------- |
| `version`              | Versión actual de la app                                              |
| `is_dev`               | Modo desarrollo (`false` en producción)                               |
| `active_notifications` | Activa/desactiva notificaciones push globalmente                      |
| `firebase_bucket_name` | Nombre del bucket de Firebase Storage (vacío = usa el predeterminado) |
| `contact_number_1`     | Número de contacto de soporte                                         |
| `region_text`          | Texto de región mostrado en la app                                    |
| `terms_conditions_url` | URL de los términos y condiciones                                     |
| `privacy_policy_url`   | URL de la política de privacidad                                      |
| `contact_url_1`        | URL de la página de contacto                                          |

### Estados de orden (`services_order_state`)

Cada estado tiene un `id`, `name`, `color` de fondo y opcionalmente `text_color` para el texto. Se pueden personalizar colores directamente en este array.

```js
{ id: 11, name: 'Entregado', color: '#1e8c5e99', text_color: '#fff' }
```

### Tipos de servicio (`services_config`)

Cada tipo de servicio tiene una imagen de portada (`home_img`) y un prefijo para el consecutivo (`consecutive_prefix`). Para agregar un nuevo tipo de servicio se añade una entrada aquí y se registra en Firestore.

### Franjas horarias (`services_order_book_times`)

Lista de horarios disponibles para agendar. Se pueden agregar, eliminar o modificar horas directamente en este array.

---

## Infraestructura

| Componente                 | Tecnología                               |
| -------------------------- | ---------------------------------------- |
| Autenticación              | Firebase Auth (teléfono + SMS)           |
| Base de datos              | Firebase Firestore                       |
| Almacenamiento de archivos | Firebase Storage                         |
| Notificaciones push        | Firebase Cloud Messaging (FCM) + Notifee |
| Funciones del servidor     | Firebase Cloud Functions                 |
| Mapas y ubicación          | Google Maps                              |

### Colecciones principales en Firestore

| Colección                   | Contenido                                                |
| --------------------------- | -------------------------------------------------------- |
| `usuarios`                  | Perfiles de usuarios (tipo, datos personales, token FCM) |
| `services_order`            | Órdenes de servicio y su estado                          |
| `services_order_media`      | Fotos adjuntas a cada orden                              |
| `services_order_acta`       | Actas de servicio con firma digital                      |
| `services_order_cotizacion` | Cotizaciones de cada orden                               |
| `chat_messages`             | Mensajes de los chats de servicio                        |
| `notifications_logs`        | Historial de notificaciones enviadas                     |
| `cities_config`             | Configuración de ciudades/zonas de operación             |

---

---

## Actualizaciones de version, branch, changelog y versiones

- Los cambios se hacen en un rama (ej: v-0-1-11 )aparte siempre y se fusionan con main.
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

(a veces es nesesario borrar el yarn.lock)
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

cd android

./gradlew --stop # para daemons de Gradle

rm -rf .gradle # limpia caché del proyecto

./gradlew clean # limpia build outputs

apk
cd android && ./gradlew assembleRelease

yarn react-native-version --never-amend

aab
npx react-native build-android --mode=release

Xcode, Product -> Clean build, Build, Archive - Window -> Organizer

Distribute App -> App Store Conect

### resourses

https://stackoverflow.com/questions/1080556/how-can-i-test-apple-push-notification-service-without-an-iphone

https://stackoverflow.com/questions/76792138/sandbox-bash72986-deny1-file-write-data-users-xxx-ios-pods-resources-to-co

https://www.youtube.com/watch?v=r-Z--YDrmjI&t=485s&ab_channel=notJust%E2%80%A4dev

### package

https://gorhom.dev/react-native-bottom-sheet/
yarn add @gorhom/bottom-sheet@^5
yarn add react-native-reanimated react-native-gesture-handler
yarn add react-native-worklets

yarn add @react-native-async-storage/async-storage

https://github.com/react-native-maps/react-native-maps/blob/master/docs/installation.md
yarn add react-native-maps

https://reactnavigation.org/docs/getting-started/

### dev_team & technical_support

desarrollado por: [diegomonsalve.com](https://diegomonsalve.com)
