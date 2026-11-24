
# INFRAGANTI MARKETPLACE

Plataforma web y móvil (Android) de compra y venta de productos entre estudiantes de la comunidad universitaria. Permite publicar artículos (libros, computadores, accesorios, instrumentos, artículos deportivos y otros), explorarlos con filtros, ver su detalle, comprarlos con pago contra entrega, recibir notificaciones de nuevos pedidos y gestionar su estado de venta, con vistas diferenciadas según el rol de quien navega.

El proyecto se compone de un **frontend en React** (carpeta `frontend/`), empaquetado además como **aplicación móvil Android con Capacitor** (segundo cliente de la misma API), **dos APIs REST en FastAPI** (carpeta `backend/`: una de productos y pedidos, y otra de usuarios) y una base de datos **PostgreSQL**, todo levantable con **Docker Compose**. Al compartir el mismo backend y base de datos, todo lo que se realiza desde el celular se refleja en tiempo real en la aplicación web y viceversa.

## Integrantes

| Nombre |
| ----- |
| Benjamin Farias |
| Benjamin Villarroel |
| Omar Millar |
| Frank Häfelin |

## Contenido

1. Descripción de la problemática y Diagnóstico del Taller 2
2. Usuarios objetivo e Historias de Usuario
3. Funcionalidades principales
4. Tecnologías
5. Estructura del proyecto, Arquitectura y Navegación
6. API pública utilizada y documentación oficial
7. Endpoints utilizados
8. Justificación funcional de la API y Modelado de Datos (SQL/NoSQL)
9. Diseño de la plataforma
10. Flujo de la plataforma
11. Criterio de coherencia: cambios e incrementos realizados
12. Aplicación Móvil — Hito 4 (Capacitor / Android)
13. Instalación, ejecución y despliegue (Web, Docker y Android)
14. Persistencia de datos
15. Pruebas
16. Limitaciones conocidas
17. Uso de Inteligencia Artificial
18. Cuentas de prueba
19. Solución de problemas
20. Mejoras futuras

## 1. Descripción de la problemática y Diagnóstico del Taller 2

Dentro de la comunidad universitaria, los estudiantes compran y venden con frecuencia libros, computadores, accesorios, instrumentos y artículos deportivos. Hoy esa actividad ocurre en canales informales (grupos de mensajería, redes sociales y avisos sueltos), donde **no existe una plataforma de confianza** pensada para realizar compras y ventas de artículos entre estudiantes.

Esa falta de una plataforma confiable genera problemas concretos:

- **Desconfianza entre las partes:** no hay una forma clara de saber quién publica, de qué carrera es ni cómo contactarlo, lo que facilita estafas y publicaciones engañosas.
- **Información dispersa y sin estructura:** cada aviso describe el producto a su manera, sin precio, estado, categoría o lugar de entrega ordenados.
- **Publicaciones desactualizadas:** artículos ya vendidos siguen apareciendo como disponibles, y los interesados pierden tiempo preguntando por ellos.
- **Dificultad para encontrar lo que se busca:** sin búsqueda ni filtros, ubicar un producto exige revisar largas conversaciones.
- **Sin control ni moderación:** nadie puede retirar publicaciones inadecuadas ni evitar el spam.

**INFRAGANTI MARKETPLACE** busca responder a este problema ofreciendo un espacio único y ordenado para la comunidad estudiantil (disponible tanto en web como en Android), con:

- Publicaciones **estructuradas** (precio, categoría, estado, descripción, vendedor, carrera, contacto y lugar de entrega).
- **Estado visible** de cada artículo (Disponible o Vendido).
- **Cuentas propias** (iniciar sesión o crear cuenta) para comprar y publicar, con roles de usuario y administrador.
- **Pedidos con pago contra entrega:** el vendedor acepta la solicitud, ambos ven el teléfono del otro para juntarse y el pago se hace en persona al entregar.
- **Notificaciones móviles:** en la app Android, el vendedor recibe alertas locales cuando llega una nueva solicitud de compra.
- **Moderación** a cargo del administrador, que puede eliminar publicaciones, y una **espera de 30 segundos** entre publicaciones para limitar el spam.
- **Información verificable de libros** mediante la API pública de Open Library, que ayuda al comprador a confirmar que el título, autor y edición corresponden a lo ofrecido.

### Diagnóstico del Taller 2 (Continuidad de Etapa 1)

En el Taller 2 el proyecto era un prototipo: React con dos APIs FastAPI que leían los datos desde archivos `data.json` y `usuarios.json` cargados en memoria. Los productos publicados se perdían al reiniciar la API, el carrito y los favoritos vivían en el `localStorage` del navegador, existían solo dos cuentas fijas y no había pedidos.

- **Qué se conserva:** el dominio central (marketplace universitario), los tipos de artículos, las pantallas (Inicio, Mercado, Producto, Publicar, Login), los roles visitante/usuario/administrador, la búsqueda con filtros y la integración con Open Library.
- **Qué se modifica:** el proyecto se separa en dos carpetas independientes (`frontend/` y `backend/`); los datos pasan de JSON en memoria a **PostgreSQL**; el backend se organiza por capas (routers, schemas, services, repositories); carrito y favoritos pasan del navegador a la base de datos; cada publicación queda asociada a la cuenta que la crea.
- **Qué se amplía:** crear cuenta con teléfono, **pedidos con pago contra entrega** (un pedido por vendedor, con estados pendiente → aceptado → entregado, o rechazado/cancelado), página **Mi perfil** con compras y ventas, edición de publicaciones propias, reglas de negocio validadas en la API (401/403/404/409), pruebas automatizadas, Docker Compose y **aplicación móvil Android con Capacitor** con notificaciones locales de pedidos nuevos (Hito 4).

## 2. Usuarios objetivo e Historias de Usuario

| Usuario | Necesidad |
| ----- | ----- |
| **Estudiantes compradores** | Encontrar artículos de segunda mano a buen precio, con información clara y de una fuente confiable. |
| **Estudiantes vendedores** | Publicar sus artículos de forma ordenada, recibir solicitudes de compra (y alertas en su celular) y mantener actualizado su estado de venta. |
| **Administradores o moderadores** | Supervisar el catálogo y retirar publicaciones inadecuadas. |
| **Visitantes** | Explorar el catálogo antes de decidir si crear una cuenta y participar. |

### Historias de Usuario Principales

| # | Historia | Prioridad | Dónde se cumple |
|---|---|:---:|---|
| HU1 | **Como visitante**, quiero crear una cuenta con mi nombre, carrera y teléfono para poder comprar y publicar. | Alta | `Login.jsx` → `POST /registro` |
| HU2 | **Como estudiante comprador**, quiero filtrar los productos por categoría, estado y rango de precio para encontrar rápidamente lo que necesito. | Alta | `Mercado.jsx` |
| HU3 | **Como estudiante comprador**, quiero agregar productos al carrito y solicitar la compra para coordinar la entrega y pagar al recibir. | Alta | `ModalCarrito.jsx` → `POST /usuarios/{id}/pedidos` |
| HU4 | **Como estudiante vendedor**, quiero aceptar o rechazar las solicitudes que recibo y marcar la entrega como pagada para cerrar la venta. | Alta | `Perfil.jsx` (Mis ventas) → `PATCH /pedidos/{id}/estado` |
| HU5 | **Como comprador o vendedor**, quiero ver el teléfono de la otra persona cuando el pedido se acepta para ponernos de acuerdo y juntarnos. | Media | `TarjetaPedido.jsx` |
| HU6 | **Como estudiante vendedor**, quiero editar mis publicaciones o cambiar su estado a "Vendido" para mantenerlas al día. | Media | `Publicar.jsx` / `Mercado.jsx` → `PUT /productos/{id}` |
| HU7 | **Como administrador**, quiero eliminar cualquier publicación para mantener el orden y evitar contenido inapropiado o spam. | Media | `TarjetaProducto.jsx` → `DELETE /productos/{id}` |
| HU8 | **Como comprador**, quiero ver autor, año y portada de un libro desde Open Library para verificar lo que me ofrecen. | Baja | `InfoLibro.jsx` |
| HU9 | **Como estudiante vendedor en la app móvil**, quiero recibir una notificación en mi celular cuando llegue una solicitud de compra nueva para responder a tiempo. | Media | `notificaciones.js` → `GET /usuarios/{id}/ventas` |

## 3. Funcionalidades principales

- Catálogo con portada, productos *Nuevos* y *Populares por categoría*.
- Búsqueda por texto y filtros por categoría, estado y rango de precio, con orden por precio o nombre.
- Detalle del producto con vendedor, categoría, lugar de entrega y recomendaciones de la misma categoría.
- **Iniciar sesión y crear cuenta** desde la misma pantalla (pestañas *Iniciar sesión* / *Crear cuenta*), con tres perfiles: visitante, usuario y administrador.
- Carrito de compra (panel lateral con el total y el botón **Solicitar compra**) y favoritos (botón ♡ en las tarjetas del Mercado), guardados en PostgreSQL por usuario.
- Publicación de productos con validación de formulario y procesamiento de imagen; cada publicación pertenece a su cuenta y el vendedor puede **editarla, cambiar su estado o eliminarla** (el administrador, todas).
- **Pedidos con pago contra entrega:** el carrito se convierte en solicitudes de compra, **una por vendedor**.

  | Estado | Quién lo cambia | Siguiente estado |
  |---|---|---|
  | Pendiente (esperando al vendedor) | Vendedor / Comprador | Aceptado o Rechazado (vendedor) · Cancelado (comprador) |
  | Aceptado (el producto queda vendido) | Vendedor | Entregado y pagado (se guarda la fecha) |
  | Rechazado · Cancelado · Entregado y pagado | — | Final |

- **Mi perfil** (clic en el nombre de usuario): datos de la cuenta, **Mis compras** y **Mis ventas** con los botones Aceptar, Rechazar y Marcar entregado y pagado. Con el pedido aceptado, cada uno ve el **teléfono** del otro.
- Información de libros (autor, primera edición y portada) mediante Open Library.
- **Aplicación móvil Android (Capacitor):** mismos flujos que la web adaptados como cliente móvil y **notificaciones locales** en el celular cuando el vendedor recibe un nuevo pedido pendiente.

## 4. Tecnologías

| Capa | Tecnología |
| ----- | ----- |
| Frontend Web | React 19, Vite, JavaScript, Bootstrap 5.3.8 (CDN) y CSS por página |
| Aplicación Móvil (Hito 4) | Capacitor (empaquetado Android), Android Studio (JVM 21), `@capacitor/local-notifications` |
| Backend de productos y pedidos | Python, FastAPI, Pydantic (puerto 8000) |
| Backend de usuarios | Python, FastAPI, Pydantic (puerto 8001) |
| Conexión a la base de datos | `psycopg2` (mismo patrón conectar → cursor → execute → commit → close de la guía) |
| Base de Datos Relacional | PostgreSQL 16 (usuarios, categorías, productos, pedidos, detalle de pedido, favoritos y carrito) |
| Servicio externo | API pública de [Open Library](https://openlibrary.org) (información de libros) |
| Infraestructura | Docker y Docker Compose (PostgreSQL, 2 APIs y React) |
| Persistencia en el cliente | `localStorage` (solo la sesión y la hora de la última publicación) |

## 5. Estructura del proyecto, Arquitectura y Navegación

El frontend y el backend son **dos aplicaciones separadas**, en carpetas distintas, que solo se comunican por HTTP. Dentro de `frontend/` se aloja tanto la aplicación web como el proyecto Android generado con Capacitor.

```
ProyectoWeb_React/
├── frontend/                        # Aplicación React + Vite (puerto 5173) y app Android
│   ├── android/                     # Proyecto Android generado con `npx cap add android`
│   ├── public/assets/images/        # Logo, portada e imágenes de productos
│   ├── src/
│   │   ├── App.jsx                  # Estado global, sesión, navegación y activación de notificaciones
│   │   ├── main.jsx                 # Punto de entrada de React
│   │   ├── components/              # Header, ModalCarrito, TarjetaProducto, TarjetaPedido...
│   │   ├── pages/                   # Inicio, Mercado, Producto, Publicar, Login, Perfil
│   │   ├── services/
│   │   │   ├── api.js               # API propia (elige URL según plataforma: web o Android)
│   │   │   ├── openLibrary.js       # API pública de Open Library
│   │   │   └── notificaciones.js    # Notificaciones locales de pedidos nuevos (Android)
│   │   ├── js/                      # formato.js y almacenamiento.js
│   │   └── styles/                  # Estilos globales y por página
│   ├── capacitor.config.ts          # Configuración de Capacitor (nombre, id, webDir: 'dist')
│   ├── .env.example                 # Direcciones base de la API para Web y Android
│   ├── package.json
│   └── Dockerfile
├── backend/                         # APIs FastAPI
│   ├── main.py                      # Crea la API de productos y pedidos (puerto 8000) y registra routers
│   ├── usuarios.py                  # Crea la API de usuarios (puerto 8001)
│   ├── database.py                  # Conexión a PostgreSQL (lee el .env)
│   ├── routers/                     # Endpoints y entrada HTTP
│   ├── schemas/                     # Modelos Pydantic de entrada (DTO)
│   ├── services/                    # Reglas de negocio y permisos
│   ├── repositories/                # Acceso a datos: consultas SQL
│   ├── db/
│   │   ├── 01_tablas.sql            # CREATE TABLE de las 7 tablas
│   │   └── 02_datos.sql             # Datos de prueba
│   ├── scripts/smoke.mjs            # Pruebas de la API
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
├── docs/                            # Diagramas ER (modelo-er.png, modelo-er-pgadmin.png)
├── docker-compose.yml               # PostgreSQL, las dos APIs y React
├── .env.example                     # Variables para Docker Compose
├── .gitignore
└── README.md
```

### Diagrama de Arquitectura

```
  Navegador (Web React :5173)         Aplicación Android (Capacitor)
               \                                  /
                \── fetch ──> Open Library       /
                 \          (API pública)       /
                  \                            /
                   ▼  HTTP / JSON (X-Usuario-Id)
                 ┌──────────────────────────────┐
                 │                              │
      ┌──────────▼───────────┐      ┌───────────▼──────────┐
      │ API productos :8000  │      │ API usuarios :8001   │
      │ categorías, productos│      │ login, registro,     │
      │ favoritos, carrito,  │      │ perfil               │
      │ pedidos              │      │                      │
      └──────────┬───────────┘      └───────────┬──────────┘
                 │  routers → services → repositories
                 └──────────────┬───────────────┘
                                │ psycopg2 (SQL)
                       ┌────────▼────────┐
                       │ PostgreSQL :5432│
                       │ 7 tablas        │
                       └─────────────────┘
```

- **Clientes (Web y Móvil):** el frontend React se ejecuta en el navegador (Vite, puerto 5173) y se compila dentro de un contenedor Android mediante **Capacitor**. Ambos clientes consumen la misma API a través de `services/api.js` (que selecciona automáticamente la URL según `Capacitor.getPlatform()`), enviando la cabecera `X-Usuario-Id` cuando hay sesión activa.
- **Backend:** dos APIs FastAPI organizadas por capas: los **routers** reciben la petición, los **schemas** validan el JSON, los **services** aplican las reglas de negocio y los **repositories** ejecutan el SQL.
- **Persistencia:** PostgreSQL (puerto 5432), con claves foráneas y restricciones para mantener la consistencia de usuarios, productos y pedidos. La app móvil no tiene backend ni base de datos propia.

### Mapa de Navegación

```
Inicio ──> Mercado ──> Detalle de Producto ──> (con sesión) Agregar al carrito ──> Carrito ──> Solicitar compra ──> Mi perfil
  │                                                │
  └──> Iniciar sesión / Crear cuenta               └──> (sin sesión) "Inicia sesión para comprar"

(con sesión) Nombre de usuario ──> Mi perfil: Mis compras · Mis ventas (Aceptar / Rechazar / Entregado y pagado)
(con sesión) Publicar ──> Publicar producto · Editar o eliminar mis publicaciones
```

1. `Inicio`: portada y destacados.
2. `Mercado`: exploración con filtros combinados y favoritos.
3. `Detalle de Producto`: información completa, recomendaciones y datos del libro desde Open Library.
4. (Requiere sesión) `Carrito` → `Solicitar compra` → `Mi perfil` (seguimiento de compras).
5. (Requiere sesión) `Mi perfil` → `Mis ventas` para responder solicitudes.
6. (Requiere sesión) `Publicar` → publicar o gestionar artículos propios.

## 6. API pública utilizada y documentación oficial

El proyecto consume la API pública de **Open Library**, un servicio gratuito del Internet Archive con información bibliográfica de millones de libros. No requiere clave de acceso (API key) y se consulta directamente desde el frontend con `fetch` (`frontend/src/services/openLibrary.js`).

| Recurso | Dirección |
| ----- | ----- |
| Sitio oficial | https://openlibrary.org |
| Documentación general de la API | https://openlibrary.org/developers/api |
| Documentación de la API de búsqueda | https://openlibrary.org/dev/docs/api/search |
| Documentación de la API de portadas | https://openlibrary.org/dev/docs/api/covers |

Además, el proyecto expone sus **propias APIs** con FastAPI, descritas en la sección 8. Ambas tienen documentación interactiva **Swagger** en `http://127.0.0.1:8000/docs` y `http://127.0.0.1:8001/docs`.

## 7. Endpoints utilizados

### Open Library (API pública)

| Método | Endpoint | Parámetros | Uso en el proyecto |
| ----- | ----- | ----- | ----- |
| `GET` | `https://openlibrary.org/search.json` | `title` (título buscado) y `limit=3` | Busca libros por título. Se usan los campos `key`, `title`, `author_name`, `first_publish_year` y `cover_i`. |
| `GET` | `https://covers.openlibrary.org/b/id/{cover_i}-M.jpg` | `cover_i` obtenido de la búsqueda | Entrega la portada en tamaño mediano. |

Ejemplo de consulta:

```
https://openlibrary.org/search.json?title=el%20principito&limit=3
```

## 8. Justificación funcional de la API y Modelado de Datos (SQL/NoSQL)

El problema central del proyecto es la **falta de confianza** al comprar y vender entre estudiantes. La API de Open Library aporta a resolverlo mediante la **verificación de la oferta** (el comprador comprueba autor, año y portada del libro), con información externa y objetiva, sin carga extra para el vendedor. Si el servicio no responde, el resto de la plataforma sigue funcionando.

### Tabla de Endpoints y Diseño API REST

Los recursos (`/productos`, `/categorias`, `/usuarios/{id}/...`, `/pedidos`) corresponden a las tablas del modelo relacional. Las rutas de un usuario usan su **id**. "Requiere sesión" significa que la petición debe traer la cabecera `X-Usuario-Id`.

**API de Productos y Pedidos (Puerto 8000)**

| Método | Endpoint | Descripción | Requiere Sesión | Usado en App Móvil |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/` | Verifica que el servicio esté activo. | No | — |
| `GET` | `/categorias` | Lista las categorías del mercado. | No | Sí (filtros) |
| `GET` | `/productos` | Lista todos los productos del catálogo. | No | Sí (Inicio y Mercado) |
| `GET` | `/productos/{id}` | Detalle de un producto (404 si no existe). | No | — |
| `POST` | `/productos` | Publica un producto; queda asociado a quien lo publica (201). | Sí | Sí |
| `PUT` | `/productos/{id}` | Edita un producto o su estado (disponible/vendido). | Sí (Dueño/Admin) | Sí |
| `DELETE` | `/productos/{id}` | Elimina una publicación (409 si está en un pedido). | Sí (Dueño/Admin) | Sí |
| `GET` | `/usuarios/{id}/productos` | Publicaciones de un usuario. | No | — |
| `GET` | `/usuarios/{id}/favoritos` | Lista los ids de los productos favoritos. | Sí | Sí |
| `POST` | `/usuarios/{id}/favoritos/{producto_id}` | Marca un favorito (409 si ya estaba). | Sí | Sí |
| `DELETE` | `/usuarios/{id}/favoritos/{producto_id}` | Quita un favorito. | Sí | Sí |
| `GET` | `/usuarios/{id}/carrito` | Productos del carrito. | Sí | Sí |
| `POST` | `/usuarios/{id}/carrito/{producto_id}` | Agrega al carrito (409 si está vendido, es propio, ya tiene pedido o ya estaba). | Sí | Sí |
| `DELETE` | `/usuarios/{id}/carrito/{producto_id}` | Quita un producto del carrito. | Sí | Sí |
| `DELETE` | `/usuarios/{id}/carrito` | Vacía el carrito. | Sí | Sí |
| `GET` | `/usuarios/{id}/pedidos` | Mis compras, con detalle y estado. | Sí | Sí |
| `POST` | `/usuarios/{id}/pedidos` | Convierte el carrito en solicitudes de compra, una por vendedor (201; 400 si está vacío). | Sí | Sí |
| `GET` | `/usuarios/{id}/ventas` | Mis ventas: pedidos donde el usuario es el vendedor (también usado para notificaciones móviles). | Sí | Sí |
| `GET` | `/pedidos/{id}` | Un pedido (solo comprador, vendedor o admin). | Sí | — |
| `PATCH` | `/pedidos/{id}/estado` | Cambia el estado: el vendedor `aceptado`/`rechazado` y luego `entregado`; el comprador `cancelado` mientras está pendiente (409 si el cambio no es válido, 403 si no le corresponde). | Sí | Sí |

**API de Usuarios (Puerto 8001)**

| Método | Endpoint | Descripción | Requiere Sesión | Usado en App Móvil |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/` | Verifica que el servicio esté activo. | No | — |
| `POST` | `/login` | Valida `nick` y `contrasena`; devuelve `id`, `nick`, `rol`, `nombre`, `carrera` y `telefono` (401 si no coinciden). | No | Sí |
| `POST` | `/registro` | Crea una cuenta con rol `usuario` (201; 409 si el nick ya existe; 422 si faltan datos o la contraseña tiene menos de 8 caracteres). | No | Sí |
| `GET` | `/usuarios/{id}` | Perfil con contadores de publicaciones, compras y ventas. El teléfono solo se incluye si lo pide el dueño. | No | Sí |

**Reglas de negocio validadas en la API**

| Regla | Respuesta si no se cumple |
|---|---|
| Publicar, editar, borrar, carrito, favoritos y pedidos requieren sesión | 401 |
| Solo el dueño de la publicación o un admin pueden editarla o borrarla | 403 |
| Solo puedes ver o cambiar tu propio carrito, favoritos y pedidos | 403 |
| No puedes comprar tu propio producto ni uno vendido | 409 |
| Un producto con un pedido en curso no se puede volver a pedir | 409 |
| Un producto que está en un pedido no se puede borrar | 409 |
| Los pedidos solo avanzan por estados válidos | 409 |
| Solo el vendedor acepta, rechaza o marca entregado; solo el comprador cancela | 403 |

### Modelo entidad-relación (SQL)

![Modelo entidad-relación de Infraganti](docs/modelo-er.png)

El mismo modelo generado por pgAdmin 4 (ERD For Database) desde la base en Docker:

![Modelo entidad-relación generado con pgAdmin](docs/modelo-er-pgadmin.png)

El modelo completo está en `backend/db/01_tablas.sql`. Resumen en texto:

```
usuarios (id PK, nick UNIQUE, contrasena, rol, nombre, carrera, telefono)
   │ 1
   ├──────────< productos (id PK, nombre, categoria_id FK, estado, precio, descripcion,
   │ 1              │          vendedor, carrera, contacto, imagen, usuario_id FK)
   │                │ N                         ▲ N
   │                │                           │ 1
   │                │                   categorias (id PK, nombre)
   │                │
   ├──< pedidos (id PK, usuario_id FK comprador, vendedor_id FK vendedor,
   │       │      fecha, estado, total, fecha_entrega)
   │       │ 1
   │       └──< detalle_pedido (id PK, pedido_id FK, producto_id FK, cantidad, precio_unitario)
   │
   ├──< favoritos (usuario_id FK, producto_id FK)  PK compuesta
   └──< carrito   (usuario_id FK, producto_id FK)  PK compuesta
```

| Tabla | Relación | Restricciones principales |
|---|---|---|
| `usuarios` | Un usuario publica muchos productos y participa en muchos pedidos (como comprador o vendedor). | `nick` único; `rol` solo `usuario` o `admin`. |
| `categorias` | Una categoría agrupa muchos productos. | `id` de texto (`libros`, `otros`...). |
| `productos` | Pertenece a una categoría y a un usuario vendedor. | `estado` solo `disponible` o `vendido`; `precio >= 0`. |
| `pedidos` | Une a un comprador con un vendedor; tiene muchos detalles. | `estado` en (`pendiente`, `aceptado`, `rechazado`, `entregado`, `cancelado`); comprador distinto del vendedor. |
| `detalle_pedido` | Cada fila es un producto dentro de un pedido; guarda el precio del momento. | Un producto no se repite en el mismo pedido; se borra junto con su pedido (`ON DELETE CASCADE`). |
| `favoritos` | Tabla intermedia usuario ↔ producto. | Clave primaria compuesta; se borra si se borra el producto o el usuario. |
| `carrito` | Tabla intermedia usuario ↔ producto. | Clave primaria compuesta; se borra si se borra el producto o el usuario. |

### Diseño de la colección (NoSQL)

El proyecto trabaja solo con PostgreSQL, porque todos los datos actuales son relacionales (usuarios, productos y pedidos que se referencian entre sí).

Si se agregara, el uso que propone el enunciado para este caso es **conversaciones o historial de interacción**: por ejemplo, una colección `conversaciones` con un documento por pedido y los mensajes entre comprador y vendedor guardados dentro del documento. Encaja en un modelo documental porque cada conversación se lee y se escribe completa y su cantidad de mensajes varía.

## 9. Diseño de la plataforma

La interfaz usa una barra de navegación superior con logo, buscador y accesos que **cambian según el rol**, diseño responsive con la grilla de Bootstrap (adaptable tanto a escritorio como a pantalla móvil) y tarjetas de producto con indicador de estado (**Disponible** / **Vendido**). La plataforma maneja tres perfiles:

| Perfil | Cómo se accede |
| ----- | ----- |
| **Visitante** | Sin iniciar sesión |
| **Usuario** | Iniciar sesión o crear cuenta (rol `usuario`) |
| **Administrador** | Inicio de sesión con rol `admin` |

| Acción | Visitante | Usuario | Administrador |
|---|:---:|:---:|:---:|
| Ver Inicio, Mercado y detalle; buscar y filtrar | Sí | Sí | Sí |
| Ver información de libros | Sí | Sí | Sí |
| Carrito, favoritos y pedidos | No | Sí | Sí |
| Publicar productos | No | Sí (espera de 30 s) | Sí (sin espera) |
| Editar, cambiar estado o eliminar publicaciones | No | Solo las propias | Todas |
| Comprar sus propias publicaciones | No | No | No |

Estos permisos se validan **en la API** (no solo en React): si alguien llama directamente a un endpoint sin permiso, recibe 401 o 403.

## 10. Flujo de la plataforma

```
Inicio ---> Buscar ---> Ver detalles ---> Ejecutar acción ---> Confirmación ---> Actualización de estado
```

Flujo principal end-to-end (de React / App Android a PostgreSQL y de vuelta):

```
Comprador agrega al carrito ──> Solicitar compra ──> pedido "pendiente" (+ notificación en Android al vendedor)
Vendedor (Mis ventas) ──> Aceptar ──> producto "vendido" + ambos ven el teléfono
Se juntan en el campus ──> Vendedor marca "Entregado y pagado" ──> se guarda la fecha
```

Las acciones destructivas (cancelar, rechazar, eliminar) piden confirmación con `confirm()`, y los errores que devuelve la API se muestran al usuario junto con estados de carga y vacío.

## 11. Criterio de coherencia: cambios e incrementos realizados

### 1. División de vistas de administrador y usuario

Sistema de autenticación con la API de usuarios: `POST /login` y `POST /registro` validan contra la tabla `usuarios` de PostgreSQL. La sesión se guarda en `localStorage` y `App.jsx` calcula `sesionIniciada` y `esAdmin`, que deciden qué ve cada perfil. La API vuelve a validar cada permiso con la cabecera `X-Usuario-Id`.

### 2. Implementación de la API mediante FastAPI

Se reemplazaron los archivos JSON en memoria por PostgreSQL y el backend se organizó por capas, siguiendo la estructura recomendada en la guía de FastAPI:

```
React / App Android ── HTTP/JSON ──> routers/ ──> services/ ──> repositories/ ──> PostgreSQL
                                     (schemas/ valida la entrada)
```

| Carpeta | Responsabilidad | Ejemplo |
|---|---|---|
| `routers/` | Endpoints y entrada HTTP. No tiene SQL ni reglas. | `routers/pedidos.py` |
| `schemas/` | Modelos Pydantic de entrada (DTO). | `schemas/producto.py`: `ProductoEntrada` |
| `services/` | Reglas de negocio y permisos (401, 403, 404, 409). | `services/pedido_service.py` |
| `repositories/` | Solo consultas SQL. | `repositories/pedido_repository.py` |
| `database.py` | Conexión a PostgreSQL. | `conectar()` |

### 3. Implementación de React y expansión a Móvil (Capacitor)

Manejo de estado con hooks (`useState`, `useEffect`), páginas y componentes separados, y una capa de servicios (`services/api.js`, mismo esquema que `itemsApi.js` de la guía) que concentra todas las llamadas a la API propia. React ya no usa datos locales como fuente principal: productos, categorías, carrito, favoritos y pedidos vienen de PostgreSQL. En el Hito 4, esta misma aplicación React se integró con **Capacitor** para generar la app Android sin duplicar lógica ni backend.

## 12. Aplicación Móvil — Hito 4 (Capacitor / Android)

La aplicación móvil empaqueta el frontend React como una app Android nativa mediante **Capacitor**. No posee backend ni base de datos propia: opera como un segundo cliente conectado a las mismas APIs REST de FastAPI y PostgreSQL.

### Archivos agregados para el Hito 4 (dentro de `frontend/`)

| Archivo | Qué hace |
| ----- | ----- |
| `capacitor.config.ts` | Nombre de la app, identificador y carpeta de compilación (`webDir: 'dist'`). |
| `android/` | Proyecto Android generado con `npx cap add android`. |
| `.env.example` | Direcciones de la API para el navegador y para Android. |
| `src/services/api.js` | Elige la dirección de la API según la plataforma (`Capacitor.getPlatform()`). |
| `src/services/notificaciones.js` | Funcionalidad adicional: notificaciones locales de pedidos nuevos. |
| `src/App.jsx` | Activa las notificaciones cuando hay una sesión iniciada. |

### Dirección base de la API (`frontend/.env`)

Se configura en `frontend/.env` (copiado desde `frontend/.env.example`). `src/services/api.js` utiliza las variables `_WEB` en el navegador y `_ANDROID` en la app móvil. Si faltan, muestra el error *"Falta configurar la URL de la API"*.

| Dónde corre | Variables | Valor |
| ----- | ----- | ----- |
| Navegador del PC | `VITE_API_WEB`, `VITE_USUARIOS_WEB` | `http://127.0.0.1:8000` y `http://127.0.0.1:8001` |
| Emulador Android | `VITE_API_ANDROID`, `VITE_USUARIOS_ANDROID` | `http://10.0.2.2:8000` y `http://10.0.2.2:8001` |
| Teléfono físico | `VITE_API_ANDROID`, `VITE_USUARIOS_ANDROID` | `http://IP_DEL_PC:8000` y `http://IP_DEL_PC:8001` |

El emulador utiliza `10.0.2.2` porque así accede al computador anfitrión (`localhost` dentro del emulador apunta al propio teléfono virtual). Para probar en un **teléfono físico**, los puertos de `api-productos` y `api-usuarios` en `docker-compose.yml` deben quedar expuestos como `'0.0.0.0:8000:8000'` y `'0.0.0.0:8001:8001'`. Después de modificar `frontend/.env`, siempre se debe volver a compilar y sincronizar (`npm run build` y `npx cap sync android`).

### Flujos implementados en la app móvil

**Funcionalidades obligatorias del caso Marketplace universitario:**

| Flujo | Descripción |
| ----- | ----- |
| Explorar publicaciones y ver el detalle | Inicio y Mercado muestran los productos con imagen, precio y estado; al tocar uno se abre su detalle con vendedor, categoría y lugar de entrega. |
| Buscar y filtrar | Buscador del menú y filtros del Mercado por categoría, estado, rango de precio y orden. |
| Administrar favoritos | Botón ♡ en las tarjetas del Mercado para marcar o quitar un favorito. |
| Consultar pedidos propios y sus estados | Perfil muestra *Mis compras* y *Mis ventas* con el estado de cada pedido (pendiente, aceptado, rechazado, entregado o cancelado). |

**Otros flujos disponibles:** iniciar sesión y crear cuenta, agregar al carrito y solicitar compra, aceptar/rechazar/entregar/cancelar pedidos, y publicar/editar/eliminar productos. Las validaciones y reglas de negocio permanecen centralizadas en la API; la app muestra sus mensajes de error y estados de carga, vacío y confirmación.

### Funcionalidad adicional: notificaciones de pedidos

Cuando alguien solicita comprar un producto, el vendedor recibe una **notificación en el celular**, por ejemplo: *"Nuevo pedido en Infraganti — cperez quiere comprar: Calculadora Científica Escolar 240"*.

**Implementación en código:**

- `frontend/src/services/notificaciones.js`: función `vigilarVentas(idUsuario)` basada en el plugin oficial `@capacitor/local-notifications`. Solicita permiso de notificaciones y cada **15 segundos** consulta `GET /usuarios/{id}/ventas`. Si aparece un pedido *pendiente* que no conocía previamente, dispara la alerta con `LocalNotifications.schedule()`. Los pedidos que ya existían al abrir la app no se notifican.
- `frontend/src/App.jsx`: un `useEffect` inicia `vigilarVentas` al iniciar sesión y lo detiene al cerrarla.
- `frontend/package.json`: dependencia `@capacitor/local-notifications`. `npx cap sync android` la registra en `android/capacitor.settings.gradle` y `android/app/capacitor.build.gradle`.

Esta funcionalidad no requiere cambios en el backend. Funciona únicamente en la app Android y mientras la app está abierta o recién minimizada.

### Capturas de la aplicación móvil

*(Agregar las capturas del emulador: Inicio, Mercado, Producto, Carrito, Perfil, notificación y mensaje de error.)*

## 13. Instalación, ejecución y despliegue (Web, Docker y Android)

### Opción 1: Ejecución con Docker Compose (Recomendada para Web y Backend)

**Requisitos:** Docker Desktop instalado y abierto.

1. Clona el repositorio y sitúate en la raíz del proyecto (donde está `docker-compose.yml`).
2. Copia los archivos de variables de entorno (solo la primera vez):

   ```powershell
   # Windows (PowerShell)
   Copy-Item .env.example .env
   Copy-Item frontend\.env.example frontend\.env
   ```

   ```bash
   # macOS / Linux
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   ```

3. Levanta los contenedores en segundo plano:

   ```bash
   docker compose up -d --build
   ```

*Nota: la primera vez PostgreSQL ejecuta automáticamente `backend/db/01_tablas.sql` y `backend/db/02_datos.sql`. Para volver a los datos iniciales: `docker compose down -v` y luego `docker compose up -d --build`.*

**Accesos del entorno Docker:**

- Frontend React: `http://localhost:5173`
- API de productos y pedidos: `http://127.0.0.1:8000` (Swagger en `/docs`)
- API de usuarios: `http://127.0.0.1:8001` (Swagger en `/docs`)
- PostgreSQL: puerto `5432`

Comandos útiles: `docker compose ps` (estado de los 4 servicios), `docker compose logs api-productos` (errores de una API), `docker compose down` (apagar sin borrar datos).

### Opción 2: Ejecución de la Aplicación Móvil (Android Studio)

**Requisitos:** Node.js 22 o superior, Docker Desktop (con el backend y la base de datos arriba según la Opción 1) y **Android Studio** con un emulador creado en *Device Manager* (si Android Studio pregunta por la versión de Java, elegir **JVM 21**).

1. Asegúrate de haber copiado `.env` en la raíz y `frontend/.env`, y de tener los contenedores arriba (`docker compose up -d --build`).
2. En la carpeta `frontend/`, instala dependencias, compila, sincroniza con Capacitor y abre Android Studio:

   ```powershell
   cd frontend
   npm install
   npm run build
   npx cap sync android
   npx cap open android
   ```

3. En Android Studio, selecciona el emulador y presiona **Run ▶**. La app se instalará y abrirá automáticamente.

**Notas importantes:**
- **No volver a ejecutar `npx cap add android`:** la carpeta `android/` ya existe en el repositorio.
- Cada vez que se modifique el código React o `frontend/.env`, ejecutar `npm run build`, luego `npx cap sync android` y volver a presionar **Run ▶** en Android Studio.

### Opción 3: Ejecución manual sin Docker (Web y Backend)

Requiere Node.js 20.19 o superior (22+ si además se compila Android), Python 3.9 o superior y PostgreSQL 16.

1. **Base de datos:**

   ```bash
   psql -U postgres -c "CREATE DATABASE infraganti;"
   cd backend
   psql -U postgres -d infraganti -f db/01_tablas.sql
   psql -U postgres -d infraganti -f db/02_datos.sql
   copy .env.example .env      # y escribe tu contraseña en DB_PASSWORD
   ```

2. **Backend** (dentro de `backend/`):

   ```bash
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000 --env-file .env       # Terminal 1
   uvicorn usuarios:app --reload --port 8001 --env-file .env   # Terminal 2
   ```

3. **Frontend** (Terminal 3):

   ```bash
   cd frontend
   copy .env.example .env
   npm install
   npm run dev
   ```

## 14. Persistencia de datos

| Dato | Dónde vive | ¿Sobrevive a reiniciar? |
|---|---|:---:|
| Usuarios, categorías y productos | Tablas `usuarios`, `categorias` y `productos` de PostgreSQL | Sí |
| Pedidos y su detalle | Tablas `pedidos` y `detalle_pedido` | Sí |
| Carrito y favoritos | Tablas `carrito` y `favoritos` (por usuario) | Sí |
| Sesión iniciada y hora de la última publicación | `localStorage` del navegador / WebView de la app | Sí, en ese dispositivo |

- Con Docker, los datos quedan en el volumen `postgres_infraganti` y sobreviven a `docker compose down` (se borran con `docker compose down -v`).
- Un producto que forma parte de un pedido **no se puede eliminar** (409), para no perder el historial.
- Al aceptar un pedido, sus productos pasan a **vendido** y salen de todos los carritos.

## 15. Pruebas

### Pruebas automatizadas de la API (`smoke.mjs`)

El archivo `backend/scripts/smoke.mjs` (mismo estilo que el `smoke.mjs` de la guía) ejecuta **21 pruebas** sobre las dos APIs.

**Cómo ejecutarla:** con la base recién cargada y las dos APIs encendidas, desde `backend/`:

```bash
node scripts/smoke.mjs
```

Cada prueba que pasa imprime `OK: ...` y al final `PRUEBAS FINALIZADAS`.

**Qué comprueba:**

- **Usuarios:** login correcto e incorrecto (401), perfil inexistente (404), teléfono visible solo para el dueño, crear cuenta (201), nick repetido (409), contraseña corta o sin teléfono (422).
- **Productos:** publicar sin sesión (401), CRUD, datos inválidos (422), categoría inexistente (400), otro usuario no puede editar ni borrar (403).
- **Favoritos y carrito:** agregar, repetido (409), carrito ajeno (403), no se puede comprar el propio producto (409).
- **Pedidos:** un pedido por vendedor, carrito vacío (400), salto de estado inválido (409), solo el vendedor acepta y entrega (403), producto vendido tras aceptar, cancelación solo por el comprador, producto con pedido no se puede borrar (409).

### Prueba de notificaciones en la app móvil (Web → Android)

1. En el emulador Android, iniciar sesión como `mrojas` / `mrojas123` y aceptar el permiso de notificaciones.
2. En la web (`http://localhost:5173`), iniciar sesión como `cperez` / `cperez123`, agregar la *Calculadora Científica Escolar 240* al carrito y presionar **Solicitar compra**.
3. En menos de 15 segundos llega la notificación local al emulador avisando del nuevo pedido.

## 16. Limitaciones conocidas

- No hay base de datos NoSQL (MongoDB); todo se guarda en PostgreSQL.
- Las contraseñas se guardan en texto plano y la API identifica al usuario con la cabecera `X-Usuario-Id`, sin tokens: suficiente para el prototipo, pero no seguro para producción.
- Las imágenes de productos se guardan en base64 dentro de la base de datos, no como archivos.
- La identidad real del usuario no se comprueba y el pago es **contra entrega**: la plataforma solo registra que el vendedor marcó la entrega como pagada, no procesa dinero.
- Open Library requiere internet, devuelve como máximo 3 resultados por título y solo se usa en la categoría *Libros*.
- CORS está abierto a cualquier origen (adecuado para desarrollo).
- Las notificaciones móviles son **locales** mediante *polling* cada 15 segundos: solo funcionan en Android y mientras la aplicación está abierta o recién minimizada (no son notificaciones push con app cerrada).

## 17. Uso de Inteligencia Artificial

Durante el desarrollo del proyecto el equipo utilizó herramientas de inteligencia artificial asegurando transparencia, comprensión y validación posterior de las respuestas generadas:

| Herramienta | Apoyo recibido | Prompts utilizados (Ejemplos) / Validación |
| ----- | ----- | ----- |
| **Claude** | Programación, documentación y revisión de código en FastAPI y React | *"Actúa como desarrollador FastAPI. Necesito un modelo Pydantic para validar un formulario de creación de productos que valide largos de strings."* → Se verificó e integró la clase validada (`schemas/producto.py`). |
| **Gemini** | Resolución de problemas, Docker Compose y PostgreSQL | *"Tengo un error de conexión entre FastAPI y el contenedor postgres en docker-compose, ¿cuál es el host correcto usando el nombre del servicio?"* → Se ajustó la variable `DB_HOST=postgres` en `docker-compose.yml`, logrando la conexión. |

*(Agregar aquí, si corresponde, el detalle del uso de IA específico para el Hito 4 / Capacitor.)*

El equipo comprendió, revisó, probó y adaptó manualmente los resultados generados, siendo responsable del código final del proyecto.

## 18. Cuentas de prueba

| Rol | Nick | Contraseña | Teléfono (de prueba) |
| ----- | ----- | ----- | ----- |
| Administrador | `admin` | `admin123` | +56 9 4120 3381 |
| Estudiante (Matías Rojas, Ingeniería) | `mrojas` | `mrojas123` | +56 9 6234 7710 |
| Estudiante (Camila Pérez, Ingeniería) | `cperez` | `cperez123` | +56 9 7381 2245 |
| Estudiante (Diego González, Informática) | `dgonzalez` | `dgonzalez123` | +56 9 5527 9036 |
| Estudiante (Valentina Soto, Diseño) | `vsoto` | `vsoto123` | +56 9 8812 4470 |
| Estudiante (Sebastián Muñoz, Arquitectura) | `smunoz` | `smunoz123` | +56 9 6649 1123 |
| Estudiante (Felipe Torres, Educación Física) | `ftorres` | `ftorres123` | +56 9 7190 5582 |
| Estudiante (Javiera Silva, Diseño) | `jsilva` | `jsilva123` | +56 9 5903 6617 |
| Estudiante (Nicolás Fuentes, Informática) | `nfuentes` | `nfuentes123` | +56 9 8345 2290 |
| Estudiante (Francisca Díaz, Administración) | `fdiaz` | `fdiaz123` | +56 9 6078 4451 |

Cada estudiante es el vendedor de uno de los 9 productos de prueba. Nadie parte con pedidos y todos los carritos están vacíos. Los teléfonos no son reales. También se puede crear una cuenta nueva desde **Iniciar sesión → Crear cuenta**.

## 19. Solución de problemas

- **`The "POSTGRES_PASSWORD" variable is not set`:** falta el archivo `.env` en la raíz. Ejecuta `Copy-Item .env.example .env`, luego `docker compose down -v` y `docker compose up -d --build`.
- **"Falta configurar la URL de la API":** falta el archivo `frontend/.env`. Cópialo desde `frontend/.env.example` y, si estás en Android, vuelve a ejecutar `npm run build` y `npx cap sync android`.
- **La app en el emulador no conecta con la API:** verifica que `VITE_API_ANDROID` y `VITE_USUARIOS_ANDROID` usen `10.0.2.2` (no `127.0.0.1` ni `localhost`) y que los contenedores de Docker estén arriba. Si usas un teléfono físico, usa la IP local de tu PC y expón los puertos con `0.0.0.0` en `docker-compose.yml`.
- **No se ven los últimos cambios:** en Docker levanta con `docker compose up -d --build` y recarga con `Ctrl + F5`. En Android, recuerda ejecutar `npm run build` y `npx cap sync android` antes de presionar **Run ▶**.
- **"Address already in use":** cierra los procesos o contenedores que ocupen los puertos 5432, 8000, 8001 o 5173.
- **Base de datos vacía o con datos viejos:** los scripts de `backend/db/` solo se ejecutan cuando el volumen es nuevo; usa `docker compose down -v`.
- **"No fue posible conectar con la API":** revisa con `docker compose ps` que las dos APIs estén arriba.

## 20. Mejoras futuras

- Agregar **MongoDB** para las conversaciones entre comprador y vendedor (lo que pide el enunciado como NoSQL).
- Cifrar contraseñas e implementar **JWT** en lugar de la cabecera `X-Usuario-Id`.
- Subida de imágenes como archivos en lugar de base64.
- Reputación o calificación de vendedores después de cada entrega.
- Migrar las notificaciones móviles a **notificaciones push (Firebase Cloud Messaging)** para recibir alertas incluso con la app cerrada.
- Restringir CORS y usar un manejador de secretos para las credenciales en producción.

**INFRAGANTI MARKETPLACE** — Benjamin Farias, Benjamin Villarroel, Omar Millar y Frank Häfelin.
