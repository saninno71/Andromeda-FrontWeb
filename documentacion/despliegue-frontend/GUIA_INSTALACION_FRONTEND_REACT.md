# Instalación y publicación de Andromeda React con Nginx en Docker, Nginx directo o IIS

## 1. Objetivo

Esta guía describe, paso a paso, qué debe instalar y configurar el equipo de infraestructura para publicar el frontend de Andromeda WEB dentro de la red de la empresa.

El alcance termina en la comunicación del navegador con la API. La instalación de SQL Server y la publicación de la API quedan a cargo de sus responsables.

## 2. Arquitectura propuesta

La opción principal acordada para Andromeda React es **Nginx dentro de un contenedor Docker sobre Linux**. La guía conserva Nginx instalado directamente en Linux e Internet Information Services (IIS) sobre Windows Server como alternativas.

```text
PC del usuario
    |
    | HTTPS 443
    v
Servidor Linux
    |
    v
Docker Engine
    |
    v
Contenedor Nginx - Andromeda React
    |  entrega index.html, JavaScript, CSS, imágenes y fuentes
    |
    | HTTPS 443
    v
Servidor de la API
    |
    v
SQL Server
```

React no queda ejecutándose en el servidor. Vite compila el proyecto y genera archivos estáticos en la carpeta `dist`. La imagen Docker incorpora esos archivos y el contenedor Nginx solamente los publica.

Por lo tanto:

- En la opción principal, el servidor Linux ejecuta Docker Engine y el plugin Docker Compose.
- Nginx se obtiene desde su imagen oficial y se ejecuta dentro de un contenedor.
- Node.js y npm se necesitan en la máquina que genera la compilación, no en el servidor web si allí solamente se copia el resultado.
- No se debe ejecutar `npm run dev` ni `npm run preview` como servicio de producción.
- En el servidor web se aloja únicamente el contenido generado dentro de `dist`; no hace falta copiar `src`, `node_modules` ni el repositorio completo.

## 3. Datos que infraestructura debe definir antes de comenzar

Completar esta tabla antes de preparar la publicación:

| Dato | Ejemplo | Responsable |
|---|---|---|
| Nombre DNS del frontend | `andromedaweb.empresa.local` | Infraestructura |
| URL pública del frontend | `https://andromedaweb.empresa.local/Andromeda-FrontWeb/` | Infraestructura |
| URL pública de la API | `https://andromeda-api.empresa.local` | Equipo de API/Infraestructura |
| Certificado TLS del frontend | Certificado para `andromedaweb.empresa.local` | Infraestructura |
| Origen habilitado en CORS | `https://andromedaweb.empresa.local` | Equipo de API |
| Carpeta física en Nginx/Linux | `/var/www/andromeda/Andromeda-FrontWeb` | Infraestructura |
| Carpeta física en IIS/Windows | `C:\inetpub\AndromedaWeb\Andromeda-FrontWeb` | Infraestructura |
| Carpeta del despliegue Docker | `/opt/andromeda/frontend` | Infraestructura |
| Carpeta de certificados Docker | `/opt/andromeda/tls` | Infraestructura |
| Registro de imágenes | Registro interno o imágenes locales versionadas | Infraestructura |
| Puerto publicado | `443` | Infraestructura |

La URL de CORS contiene esquema, host y puerto; no incluye `/Andromeda-FrontWeb/`.

## 4. Decisión de ubicación del frontend

### Modalidad recomendada para la primera instalación

Publicar Andromeda bajo esta ruta, independientemente de si el servidor es Nginx o IIS:

```text
https://andromedaweb.empresa.local/Andromeda-FrontWeb/
```

El proyecto ya tiene esta configuración en `vite.config.js`:

```js
base: "/Andromeda-FrontWeb/"
```

Esto hace que el HTML compilado busque los recursos en `/Andromeda-FrontWeb/assets/...`.

### Alternativa: publicar en la raíz de un dominio exclusivo

Si se quiere usar:

```text
https://andromedaweb.empresa.local/
```

antes de compilar se debe cambiar `base` a `/` en `vite.config.js` y generar nuevamente `dist`. No se debe publicar en la raíz un paquete compilado con `base: "/Andromeda-FrontWeb/"`, porque los archivos JavaScript y CSS devolverán 404.

La propiedad `homepage` de `package.json` corresponde a la publicación anterior en GitHub Pages y no define la ruta usada por Vite. Para esta instalación manda `base` en `vite.config.js`.

## 5. Software necesario antes de comenzar

Primero se debe decidir **dónde se compilará** el proyecto. Las herramientas de desarrollo se instalan en una máquina de compilación; el servidor web recibe solamente el resultado terminado.

### 5.1. Qué se instala en cada máquina

| Componente | Qué es | Para qué se usa | Máquina de compilación | Servidor web |
|---|---|---|---:|---:|
| Node.js LTS | Entorno que ejecuta herramientas JavaScript fuera del navegador | Ejecutar npm y Vite durante la compilación | Sí | No |
| npm | Administrador de paquetes incluido con Node.js | Descargar las versiones definidas en `package-lock.json` y ejecutar scripts | Sí | No |
| Vite | Herramienta de compilación del proyecto | Transformar el código fuente en archivos estáticos dentro de `dist` | Sí, como dependencia local | No |
| React | Biblioteca con la que está construida la interfaz | Forma parte del código que Vite empaqueta para el navegador | Sí, como dependencia local | No |
| Git | Sistema de control de versiones | Obtener el repositorio y seleccionar el commit aprobado | Sí, si se trabaja desde el repositorio | No |
| Docker Engine | Motor de contenedores sobre Linux | Ejecutar y supervisar el contenedor del frontend | No | Sí, en la opción principal |
| Docker Compose plugin | Herramienta declarativa de Docker | Crear, actualizar y consultar el contenedor mediante `compose.yaml` | No | Sí, en la opción principal |
| Nginx | Servidor web incluido en la imagen oficial | Entregar `index.html`, JavaScript, CSS, imágenes y fuentes | No | Dentro del contenedor |
| IIS | Servidor web de Windows | Entregar `index.html`, JavaScript, CSS, imágenes y fuentes | No | Sí, en la opción IIS |

No hace falta descargar React o Vite manualmente ni instalar Vite globalmente. Ambos están declarados en `package.json` y se descargan con `npm ci` en las versiones registradas por el proyecto.

El navegador de cada usuario ejecuta el JavaScript ya compilado. No necesita Node.js, npm, Vite ni React instalados en la PC.

### 5.2. Instalar Node.js y npm en la máquina de compilación

**Qué es:** Node.js es el entorno que permite ejecutar el proceso de compilación. npm es el administrador de paquetes y se instala junto con Node.js.

**Por qué es necesario:** los comandos `npm ci`, `npm run lint` y `npm run build` se ejecutan mediante Node.js. El resultado de esos comandos es la carpeta `dist` que después se copia al servidor web.

**De dónde se obtiene:** descargar únicamente desde la [página oficial de Node.js](https://nodejs.org/en/download). La documentación oficial de npm también explica la [instalación conjunta de Node.js y npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/).

**Versión:** elegir la versión marcada **LTS**. El proyecto usa Vite 8, que exige Node.js 20.19 o superior, o 22.12 o superior. Para una instalación nueva debe preferirse una versión LTS vigente y con soporte, por ejemplo Node.js 22 LTS o 24 LTS, en lugar de una versión `Current` o una versión EOL.

Instalación en Windows:

1. Entrar en `https://nodejs.org/en/download`.
2. Seleccionar la versión **LTS**.
3. Descargar **Windows Installer (.msi)** para la arquitectura del equipo, normalmente x64.
4. Ejecutar el instalador con una cuenta autorizada.
5. Mantener habilitada la incorporación de Node.js al `PATH`.
6. Completar la instalación con las opciones estándar.
7. Cerrar y volver a abrir PowerShell para que tome el nuevo `PATH`.
8. Verificar:

```powershell
node --version
npm --version
```

Ambos comandos deben devolver una versión. No se necesita descargar npm por separado.

### 5.3. Instalar Git en la máquina de compilación

**Qué es:** Git permite descargar el repositorio, seleccionar una rama o un commit y registrar exactamente qué versión se publicó.

**Cuándo es necesario:** se instala si la máquina de compilación obtiene el código desde Git. Si el área de desarrollo entrega el código fuente por otro mecanismo controlado, Git no es indispensable para compilar.

Instalación en Windows:

1. Descargar Git desde la [página oficial de Git para Windows](https://git-scm.com/download/win).
2. Ejecutar el instalador.
3. Mantener las opciones corporativas definidas por infraestructura; para un equipo sin una política particular sirven las opciones estándar.
4. Cerrar y volver a abrir PowerShell.
5. Verificar:

```powershell
git --version
```

### 5.4. Instalar Vite, React y las demás dependencias del proyecto

**Qué son:** React es la biblioteca de interfaz y Vite es la herramienta que prepara la versión productiva. No son programas que deban instalarse mediante un asistente de Windows.

**De dónde se obtienen:** npm los descarga desde el registro configurado en la empresa. Sus nombres y versiones están definidos en `package.json` y `package-lock.json`.

Desde la raíz del proyecto ejecutar:

```powershell
npm ci
```

Ese comando crea localmente la carpeta `node_modules` e instala Vite, React y el resto de las dependencias. La carpeta `node_modules` sirve para compilar y no se copia al servidor web.

No ejecutar:

```powershell
npm install -g vite
```

Una instalación global podría usar una versión diferente de la aprobada por el proyecto. Los scripts de `package.json` usan automáticamente la copia local instalada por `npm ci`.

Para comprobar que Vite local quedó disponible se puede ejecutar:

```powershell
npx vite --version
```

### 5.5. Acceso a Internet o registro npm interno

La primera ejecución de `npm ci` necesita acceder al registro npm configurado o a un repositorio interno que contenga las dependencias.

Hay dos modalidades válidas:

1. **Máquina de compilación con acceso controlado:** descarga dependencias, compila y entrega el paquete `dist` al servidor web.
2. **Red sin acceso a Internet:** infraestructura debe proveer un registro npm interno o recibir desde desarrollo un paquete `dist` ya compilado e identificado.

No es necesario habilitar acceso a Internet desde Nginx o IIS para publicar el frontend.

### 5.6. Verificación previa de herramientas

En la máquina de compilación ejecutar:

```powershell
node --version
npm --version
git --version
```

Después, dentro del proyecto:

```powershell
npm ci
npx vite --version
```

La preparación está completa cuando todos los comandos terminan correctamente. Git puede omitirse solamente cuando el código se recibe por otro medio controlado.

## 6. Opción IIS: preparar el servidor Windows

Este apartado y los apartados 9 y 10 corresponden solamente a la alternativa IIS. Para la opción principal Docker/Nginx, realizar los apartados comunes 7 y 8 y continuar en el apartado 11. Para Nginx instalado directamente, continuar en el apartado 12.

### Paso 6.1: instalar IIS

1. Abrir **Server Manager**.
2. Elegir **Add roles and features**.
3. Seleccionar **Role-based or feature-based installation**.
4. Seleccionar el servidor de destino.
5. Marcar **Web Server (IIS)**.
6. Dentro de **Web Server > Common HTTP Features**, habilitar:
   - **Static Content**.
   - **Default Document**.
   - **HTTP Errors**.
7. Dentro de **Health and Diagnostics**, habilitar **HTTP Logging**.
8. Dentro de **Management Tools**, habilitar **IIS Management Console**.
9. Completar la instalación.
10. Abrir **IIS Manager** y verificar que el servicio esté iniciado.

No se necesita ASP.NET, .NET Hosting Bundle ni Node.js para servir este frontend estático. Esos componentes podrían ser necesarios para la API, pero pertenecen a la instalación del servidor de aplicaciones.

### Paso 6.2: preparar DNS y red

1. Crear el registro DNS acordado, por ejemplo `andromedaweb.empresa.local`.
2. Hacer que el registro apunte a la IP del servidor IIS o al balanceador que se encuentre delante de IIS.
3. Habilitar entrada TCP 443 desde las redes de usuarios.
4. No publicar los puertos de desarrollo 5173 o 4173.
5. Verificar desde una PC usuaria que el nombre DNS resuelva a la IP esperada.

### Paso 6.3: instalar el certificado HTTPS

1. Abrir **IIS Manager**.
2. Seleccionar el servidor.
3. Abrir **Server Certificates**.
4. Importar el certificado emitido para el nombre DNS definido.
5. Al crear el sitio, agregar un binding HTTPS en el puerto 443 y elegir ese certificado.
6. Si varias aplicaciones comparten IP y puerto, configurar el host name y SNI según la política de infraestructura.

El frontend y la API deben publicarse por HTTPS. Un navegador puede bloquear una llamada HTTP a la API cuando la pantalla fue cargada por HTTPS.

## 7. Preparar la configuración de producción del frontend

Este paso es obligatorio antes de compilar.

Actualmente `src/config/AndromedaFrontConfig.js` contiene:

```js
export const API_URL_LOCAL = "http://localhost:5062";
export const API_URL_CLOUD = "https://andromeda-backend-7eko.onrender.com";
```

En una PC usuaria, `localhost:5062` significa **esa PC**, no el servidor de la API. El paquete de producción debe apuntar al nombre real acordado, por ejemplo:

```js
export const API_URL_LOCAL = "https://andromeda-api.empresa.local";
```

Antes de generar el paquete:

1. Confirmar la URL definitiva de la API.
2. Ajustar la configuración del frontend para usar esa URL.
3. Pedir al equipo de API que permita en CORS el origen del frontend, por ejemplo `https://andromedaweb.empresa.local`.
4. Confirmar desde una PC usuaria que la URL de la API sea accesible.
5. Confirmar que el certificado de la API sea confiable para los navegadores corporativos.

La versión actual no lee la URL de la API desde una variable `VITE_API_URL` ni desde un archivo externo. El valor está incorporado al código durante la compilación. Hasta que se implemente una configuración externa, cada ambiente necesita su propio paquete `dist` generado con la URL correspondiente.

## 8. Generar el paquete de publicación

Realizar estos pasos en una máquina de compilación o desarrollo controlada.

### Paso 8.1: comprobar las herramientas de compilación

Las instalaciones están explicadas en el apartado 5. Antes de compilar, verificar:

```powershell
node --version
npm --version
```

### Paso 8.2: obtener una versión identificable del código

1. Obtener la rama, etiqueta o commit aprobado para producción.
2. Registrar el identificador del commit que se publicará.
3. Confirmar la ruta base y la URL de la API antes de compilar.

### Paso 8.3: instalar dependencias y compilar

Desde la raíz del proyecto:

```powershell
cd C:\ruta\del\proyecto\andromeda_React
npm ci
npm run build
```

Como control adicional, ejecutar:

```powershell
npm run lint
```

El comando `npm run build` debe finalizar correctamente y crear:

```text
andromeda_React\dist\
├── index.html
├── assets\
├── images\
└── otros archivos estáticos
```

### Paso 8.4: revisar el paquete

1. Confirmar que `dist\index.html` exista.
2. Confirmar que existan los archivos JavaScript y CSS dentro de `dist\assets`.
3. Abrir `dist\index.html` como texto y verificar que las referencias comiencen con `/Andromeda-FrontWeb/` para la modalidad recomendada.
4. Comprimir **el contenido de `dist`**, conservando su estructura.
5. Nombrar el paquete con fecha y versión, por ejemplo `AndromedaFront_2026-09-21_commit-abc123.zip`.

`npm run preview` puede utilizarse solamente para revisar el paquete en la máquina de compilación. La documentación oficial de Vite aclara que no es un servidor de producción.

## 9. Opción IIS: crear la carpeta de publicación

En el servidor IIS:

1. Crear:

```text
C:\inetpub\AndromedaWeb\Andromeda-FrontWeb
```

2. Crear una carpeta separada para respaldos, por ejemplo:

```text
C:\inetpub\AndromedaWeb\backups
```

3. Dar permiso de **Lectura y ejecución** sobre la carpeta publicada a la identidad del application pool, por ejemplo:

```text
IIS AppPool\AndromedaFrontPool
```

4. No otorgar permiso de escritura a los usuarios del sitio.
5. Descomprimir el contenido de `dist` directamente dentro de `Andromeda-FrontWeb`.

El resultado correcto es:

```text
C:\inetpub\AndromedaWeb\Andromeda-FrontWeb\index.html
C:\inetpub\AndromedaWeb\Andromeda-FrontWeb\assets\...
```

El resultado incorrecto es:

```text
C:\inetpub\AndromedaWeb\Andromeda-FrontWeb\dist\index.html
```

## 10. Opción IIS: configurar IIS

### Paso 10.1: crear el application pool

1. En **Application Pools**, elegir **Add Application Pool**.
2. Usar el nombre `AndromedaFrontPool`.
3. Seleccionar **No Managed Code**.
4. Usar **Integrated** como pipeline mode.
5. Dejar el pool iniciado.

El frontend no ejecuta código .NET; por eso el pool no necesita CLR.

### Paso 10.2: crear el sitio contenedor

Si ya existe un sitio corporativo para el host definido, se puede usar ese sitio. Si no existe:

1. En **Sites**, elegir **Add Website**.
2. Asignar un nombre, por ejemplo `AndromedaWeb`.
3. Seleccionar una carpeta raíz del sitio, por ejemplo `C:\inetpub\AndromedaWeb\wwwroot`.
4. Configurar el binding HTTPS, host name, puerto 443 y certificado.
5. Iniciar el sitio.

### Paso 10.3: crear la aplicación `/Andromeda-FrontWeb`

1. Hacer clic derecho sobre el sitio contenedor.
2. Elegir **Add Application**.
3. Usar como alias `Andromeda-FrontWeb`.
4. Seleccionar `AndromedaFrontPool`.
5. Elegir como physical path:

```text
C:\inetpub\AndromedaWeb\Andromeda-FrontWeb
```

6. Confirmar la creación.
7. Abrir **Default Document** y comprobar que `index.html` esté habilitado.
8. Probar **Browse** sobre la aplicación.

La URL final será:

```text
https://andromedaweb.empresa.local/Andromeda-FrontWeb/
```

### Paso 10.4: comprobar tipos de contenido estático

IIS normalmente ya incluye los tipos necesarios. Verificar que entregue sin error:

- `.html`
- `.js`
- `.css`
- `.json`
- `.svg`
- `.png`
- `.woff` y `.woff2`, si el paquete los contiene

Si IIS responde 404.3 para una extensión, revisar **MIME Types** y agregar únicamente el tipo faltante.

### Paso 10.5: enrutamiento de la aplicación

La versión actual navega internamente mediante estado de React y no usa rutas de navegador con React Router. Por eso la primera instalación no necesita URL Rewrite ni una regla general que redirija todas las URLs a `index.html`.

Si en el futuro se agregan rutas como `/asientos/123` y se pretende abrirlas o refrescarlas directamente, habrá que instalar URL Rewrite y configurar el fallback a `index.html`. No se debe agregar esa regla preventivamente sin probar las rutas y las llamadas a la API.

## 11. Opción principal: Nginx en Docker sobre Linux

### 11.1. Componentes y responsabilidades

El servidor de producción ejecuta:

- Linux soportado por infraestructura.
- Docker Engine.
- El plugin Docker Compose, que se usa con el comando `docker compose`.
- Una imagen versionada de Andromeda Front basada en la imagen oficial de Nginx.
- Un contenedor creado desde esa imagen.

La compilación de React se realiza antes. El contenedor recibe solamente `dist` y la configuración de Nginx; no contiene el código fuente, Node.js, npm, Vite ni `node_modules`.

Docker no reemplaza a Nginx. Docker ejecuta y aísla el proceso Nginx que publica los archivos.

### 11.2. Instalar Docker Engine y Docker Compose

Usar el repositorio oficial de Docker o el repositorio interno aprobado por la empresa. No usar el script de conveniencia `get.docker.com` en producción; Docker lo recomienda solamente para pruebas y desarrollo.

En Ubuntu o Debian:

1. Verificar que la versión de Linux esté soportada.
2. Quitar paquetes Docker conflictivos siguiendo la guía oficial.
3. Configurar la clave y el repositorio oficial de Docker:
   - [Docker Engine para Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
   - [Docker Engine para Debian](https://docs.docker.com/engine/install/debian/)
4. Instalar:

```bash
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

En Red Hat Enterprise Linux:

1. Configurar el repositorio según [Docker Engine para RHEL](https://docs.docker.com/engine/install/rhel/).
2. Instalar:

```bash
sudo dnf install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker
```

Verificar en cualquier distribución:

```bash
sudo systemctl status docker
sudo docker run --rm hello-world
sudo docker version
sudo docker compose version
```

El acceso al grupo `docker` equivale prácticamente a privilegios administrativos sobre el host. Infraestructura debe limitarlo a las cuentas autorizadas; la guía utiliza `sudo docker` para hacerlo explícito.

### 11.3. Revisar firewall y puertos

Publicar:

- TCP 80 solamente para redirigir a HTTPS.
- TCP 443 para los usuarios.

Docker advierte que los puertos publicados por contenedores pueden eludir reglas administradas únicamente por `ufw` o `firewalld`. Infraestructura debe revisar sus reglas en el firewall perimetral y, cuando corresponda, en la cadena `DOCKER-USER`.

No publicar hacia la red:

- El daemon Docker.
- Puertos 5173 o 4173 de Vite.
- Puertos administrativos sin restricción.

### 11.4. Preparar la estructura del despliegue

Crear:

```bash
sudo mkdir -p /opt/andromeda/frontend/dist
sudo mkdir -p /opt/andromeda/tls
sudo mkdir -p /opt/andromeda/backups
```

La estructura será:

```text
/opt/andromeda/
├── frontend/
│   ├── Dockerfile
│   ├── compose.yaml
│   ├── nginx.conf
│   ├── .dockerignore
│   ├── .env
│   └── dist/
│       ├── index.html
│       ├── assets/
│       └── ...
├── tls/
│   ├── andromedaweb.fullchain.pem
│   └── andromedaweb.key
└── backups/
```

La clave TLS queda fuera del contexto de construcción y nunca se copia dentro de la imagen.

### 11.5. Crear `nginx.conf`

Crear `/opt/andromeda/frontend/nginx.conf`:

```nginx
server {
    listen 80;
    server_name andromedaweb.empresa.local;

    location = /healthz {
        access_log off;
        default_type text/plain;
        return 200 "ok\n";
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name andromedaweb.empresa.local;
    server_tokens off;

    ssl_certificate     /etc/nginx/tls/andromedaweb.fullchain.pem;
    ssl_certificate_key /etc/nginx/tls/andromedaweb.key;
    ssl_protocols       TLSv1.2 TLSv1.3;

    root /usr/share/nginx/html;
    index index.html;
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    access_log /dev/stdout;
    error_log  /dev/stderr warn;

    location = / {
        return 302 /Andromeda-FrontWeb/;
    }

    location = /Andromeda-FrontWeb {
        return 301 /Andromeda-FrontWeb/;
    }

    location ^~ /Andromeda-FrontWeb/assets/ {
        try_files $uri =404;
        add_header Cache-Control "public, max-age=31536000, immutable" always;
    }

    location = /Andromeda-FrontWeb/index.html {
        try_files $uri =404;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    }

    location /Andromeda-FrontWeb/ {
        try_files $uri $uri/ =404;
    }
}
```

Reemplazar el dominio y los nombres de los certificados. La ruta coincide con `base: "/Andromeda-FrontWeb/"` del proyecto.

### 11.6. Crear el `Dockerfile`

Crear `/opt/andromeda/frontend/Dockerfile`:

```dockerfile
ARG NGINX_IMAGE=nginx:stable-alpine
FROM ${NGINX_IMAGE}

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/ /usr/share/nginx/html/Andromeda-FrontWeb/
```

Para la primera prueba se puede usar `nginx:stable-alpine`. Para producción se debe registrar y aprobar una versión o digest concreto de la [imagen oficial de Nginx](https://hub.docker.com/_/nginx). Usar un digest evita que una reconstrucción futura incorpore silenciosamente otra imagen base.

Obtener el digest:

```bash
sudo docker pull nginx:stable-alpine
sudo docker image inspect nginx:stable-alpine --format '{{index .RepoDigests 0}}'
```

Luego colocar ese valor en `NGINX_IMAGE` dentro de `.env`.

### 11.7. Crear `.dockerignore`

Crear `/opt/andromeda/frontend/.dockerignore`:

```text
.git
.env
node_modules
src
*.key
*.pem
backups
```

Esto impide incorporar archivos innecesarios o secretos al contexto enviado al daemon Docker.

### 11.8. Crear `compose.yaml`

Crear `/opt/andromeda/frontend/compose.yaml`:

```yaml
name: andromeda-front

services:
  frontend:
    image: "andromeda-front:${ANDROMEDA_VERSION}"
    build:
      context: .
      args:
        NGINX_IMAGE: "${NGINX_IMAGE}"
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /opt/andromeda/tls:/etc/nginx/tls:ro
    healthcheck:
      test: ["CMD-SHELL", "wget -q -O - http://127.0.0.1/healthz >/dev/null || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "5"
```

El montaje `:ro` permite leer los certificados sin modificarlos. Los logs de Nginx se envían a stdout y stderr y Docker limita su rotación.

### 11.9. Crear `.env` e identificar la versión

Crear `/opt/andromeda/frontend/.env`:

```dotenv
ANDROMEDA_VERSION=2026-09-22-commit-abc123
NGINX_IMAGE=nginx:stable-alpine
```

Reemplazar `ANDROMEDA_VERSION` por la fecha y el commit reales. Reemplazar `NGINX_IMAGE` por la versión o digest aprobado antes de la publicación definitiva.

No incluir `.env`, certificados ni claves en el repositorio público.

### 11.10. Copiar el paquete `dist`

1. Compilar el frontend siguiendo el apartado 8.
2. Confirmar que se usó la URL definitiva de la API.
3. Vaciar solamente `/opt/andromeda/frontend/dist`.
4. Copiar dentro de esa carpeta el contenido del `dist` aprobado.
5. Confirmar que exista:

```text
/opt/andromeda/frontend/dist/index.html
/opt/andromeda/frontend/dist/assets/...
```

No copiar la carpeta como `dist/dist`.

### 11.11. Construir y validar la imagen

Desde `/opt/andromeda/frontend`:

```bash
cd /opt/andromeda/frontend
sudo docker compose config
sudo docker compose build --pull
sudo docker image ls andromeda-front
```

La compilación Docker no vuelve a compilar React; solamente empaqueta el `dist` previamente generado.

### 11.12. Iniciar el contenedor

```bash
sudo docker compose up -d
sudo docker compose ps
sudo docker compose logs --tail=100 frontend
sudo docker compose exec frontend nginx -t
```

El estado debe terminar en `healthy`. Probar:

```bash
curl -I http://127.0.0.1/healthz
curl -I https://andromedaweb.empresa.local/Andromeda-FrontWeb/
```

Después ejecutar la verificación funcional del apartado 14 desde una PC usuaria.

### 11.13. HTTPS terminado fuera del contenedor

Si un balanceador, proxy corporativo o appliance termina TLS delante del contenedor:

1. Infraestructura debe definir el puerto interno que recibirá HTTP.
2. Se elimina el bloque HTTPS y el montaje de certificados del contenedor.
3. Se publica solamente el puerto interno necesario.
4. El proxy externo debe conservar el host y enviar `X-Forwarded-Proto: https`.
5. El acceso directo al puerto del contenedor debe quedar restringido a la red del proxy.

No se deben habilitar simultáneamente ambas modalidades sin una decisión explícita de infraestructura.

### 11.14. Actualizar una versión

1. Conservar la imagen actualmente activa.
2. Generar y copiar el nuevo `dist`.
3. Cambiar `ANDROMEDA_VERSION` por un identificador nuevo.
4. Ejecutar:

```bash
sudo docker compose config
sudo docker compose build --pull
sudo docker compose up -d
sudo docker compose ps
sudo docker compose logs --tail=100 frontend
```

Compose recreará el contenedor usando la nueva imagen. No reutilizar la misma etiqueta para dos compilaciones diferentes.

### 11.15. Volver a la versión anterior

1. Cambiar `ANDROMEDA_VERSION` en `.env` por la etiqueta anterior.
2. Verificar que la imagen siga disponible:

```bash
sudo docker image ls andromeda-front
```

3. Levantarla sin reconstruir:

```bash
sudo docker compose up -d --no-build
sudo docker compose ps
```

4. Repetir la prueba funcional.

No eliminar la imagen anterior hasta que la nueva versión haya sido aceptada.

### 11.16. Operación y diagnóstico

Comandos habituales:

```bash
sudo docker compose ps
sudo docker compose logs -f frontend
sudo docker compose restart frontend
sudo docker compose exec frontend nginx -t
sudo docker inspect andromeda-front-frontend-1
```

El nombre real del contenedor puede variar; `docker compose ps` muestra el nombre correcto.

Para renovar certificados montados desde el host:

1. Reemplazar los archivos en `/opt/andromeda/tls`.
2. Validar la configuración.
3. Reiniciar el servicio del compose:

```bash
sudo docker compose exec frontend nginx -t
sudo docker compose restart frontend
```

### 11.17. Alternativa con registro interno

Para un proceso más controlado:

1. CI/CD compila React.
2. CI/CD construye la imagen con el `dist`.
3. La imagen se publica con una etiqueta inmutable en el registro interno.
4. Producción ejecuta `docker compose pull` y `docker compose up -d`.
5. El servidor productivo no recibe código fuente ni construye imágenes.

Esta es la modalidad recomendada cuando infraestructura disponga de un registro y pipeline corporativos.

## 12. Alternativa: Nginx instalado directamente en Linux

### 12.1. Plataforma recomendada

Para Nginx se recomienda una distribución Linux soportada por infraestructura, por ejemplo Ubuntu Server, Debian, Red Hat Enterprise Linux, Rocky Linux o AlmaLinux.

La versión oficial de Nginx para Windows es considerada beta por el propio proyecto, utiliza mecanismos de conexión más limitados y no está diseñada como servicio de Windows. Para un servidor Windows de producción se recomienda conservar IIS. Si infraestructura elige Nginx, la opción preferida es Linux.

### 12.2. Qué se instala en el servidor Nginx

En el servidor web se instala:

- Nginx desde un repositorio aprobado.
- El certificado y la clave TLS entregados por infraestructura.
- El contenido de la carpeta `dist` generado previamente.

No se instalan Node.js, npm, React, Vite, Git ni `node_modules` en el servidor, salvo que el mismo equipo haya sido designado también como máquina de compilación. Se recomienda mantener separadas ambas funciones.

### 12.3. Instalar Nginx en Ubuntu o Debian

Usando el repositorio aprobado por infraestructura:

```bash
sudo apt update
sudo apt install nginx
sudo systemctl enable nginx
sudo systemctl start nginx
nginx -v
```

La [documentación oficial de paquetes Nginx para Linux](https://nginx.org/en/linux_packages.html) explica cómo configurar el repositorio oficial y verificar su clave de firma. Si la empresa usa un repositorio interno, se deben utilizar los paquetes aprobados allí.

### 12.4. Instalar Nginx en RHEL, Rocky Linux o AlmaLinux

Usando el repositorio aprobado por infraestructura:

```bash
sudo dnf install nginx
sudo systemctl enable nginx
sudo systemctl start nginx
nginx -v
```

Después de la instalación, habilitar entrada TCP 80 solamente si se redirigirá a HTTPS y entrada TCP 443 para el acceso de los usuarios.

### 12.5. Crear la carpeta de publicación

Crear estas carpetas:

```bash
sudo mkdir -p /var/www/andromeda/Andromeda-FrontWeb
sudo mkdir -p /var/www/andromeda/backups
```

Copiar directamente el contenido de `dist` dentro de `Andromeda-FrontWeb`. El resultado debe ser:

```text
/var/www/andromeda/Andromeda-FrontWeb/index.html
/var/www/andromeda/Andromeda-FrontWeb/assets/...
```

No debe quedar así:

```text
/var/www/andromeda/Andromeda-FrontWeb/dist/index.html
```

Aplicar permisos de solo lectura para el servicio web:

```bash
sudo chown -R root:root /var/www/andromeda/Andromeda-FrontWeb
sudo find /var/www/andromeda/Andromeda-FrontWeb -type d -exec chmod 755 {} \;
sudo find /var/www/andromeda/Andromeda-FrontWeb -type f -exec chmod 644 {} \;
```

En distribuciones con SELinux activo, infraestructura también debe verificar el contexto de seguridad de `/var/www/andromeda`.

### 12.6. Instalar el certificado HTTPS

Infraestructura debe entregar:

- El certificado del servidor y su cadena, por ejemplo `/etc/nginx/tls/andromedaweb.fullchain.pem`.
- La clave privada, por ejemplo `/etc/nginx/tls/andromedaweb.key`.

La clave privada debe quedar accesible solamente para `root` y el proceso de Nginx según la política de la empresa. No debe copiarse al repositorio React ni incluirse dentro de `dist`.

### 12.7. Crear la configuración de Andromeda

Crear `/etc/nginx/conf.d/andromeda-front.conf`. Si la distribución utiliza `sites-available` y `sites-enabled`, infraestructura puede ubicar allí el mismo bloque `server`.

Configuración base para la ruta actual `/Andromeda-FrontWeb/`:

```nginx
server {
    listen 80;
    server_name andromedaweb.empresa.local;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name andromedaweb.empresa.local;

    ssl_certificate     /etc/nginx/tls/andromedaweb.fullchain.pem;
    ssl_certificate_key /etc/nginx/tls/andromedaweb.key;
    ssl_protocols       TLSv1.2 TLSv1.3;

    root /var/www/andromeda;
    index index.html;
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    access_log /var/log/nginx/andromeda-front.access.log;
    error_log  /var/log/nginx/andromeda-front.error.log;

    location = / {
        return 302 /Andromeda-FrontWeb/;
    }

    location = /Andromeda-FrontWeb {
        return 301 /Andromeda-FrontWeb/;
    }

    location ^~ /Andromeda-FrontWeb/assets/ {
        try_files $uri =404;
        add_header Cache-Control "public, max-age=31536000, immutable" always;
    }

    location = /Andromeda-FrontWeb/index.html {
        try_files $uri =404;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    }

    location /Andromeda-FrontWeb/ {
        try_files $uri $uri/ =404;
    }
}
```

Reemplazar el nombre DNS y las rutas del certificado por los valores definitivos.

Esta configuración coincide con `base: "/Andromeda-FrontWeb/"` del proyecto. Si se decide publicar en la raíz del dominio, primero se debe compilar con `base: "/"` y luego cambiar la configuración de Nginx para servir `dist` desde `/`.

### 12.8. Validar y activar la configuración

Antes de recargar Nginx:

```bash
sudo nginx -t
```

Si el resultado indica que la sintaxis es correcta:

```bash
sudo systemctl reload nginx
sudo systemctl status nginx
```

Nginx valida la nueva configuración antes de recargarla. No se debe ejecutar el `reload` si `nginx -t` informa errores.

### 12.9. Enrutamiento de React

La versión actual de Andromeda navega mediante estado interno y no utiliza React Router con URLs del navegador. Por eso se usa:

```nginx
try_files $uri $uri/ =404;
```

Si en el futuro se incorporan rutas navegables y se necesita refrescarlas directamente, el bloque deberá evaluarse para usar un fallback similar a:

```nginx
try_files $uri $uri/ /Andromeda-FrontWeb/index.html;
```

Ese cambio se debe realizar cuando existan esas rutas y después de probar que no oculte errores 404 reales.

### 12.10. Relación con la API

Nginx no necesita actuar como proxy de la API para esta primera instalación. El frontend llama a la URL absoluta configurada en `AndromedaFrontConfig.js`.

Por lo tanto:

1. El frontend debe compilarse con la URL real de la API.
2. La PC del usuario debe poder resolver y acceder a esa URL.
3. La API debe permitir por CORS el origen `https://andromedaweb.empresa.local`.
4. Tanto el frontend como la API deben usar certificados confiables.

Un proxy inverso para publicar frontend y API bajo el mismo dominio es una arquitectura posible, pero requiere acordar rutas, cabeceras, límites y timeouts con el equipo de API. No forma parte de esta primera configuración.

### 12.11. Verificar Nginx

Ejecutar en el servidor:

```bash
curl -I https://andromedaweb.empresa.local/Andromeda-FrontWeb/
curl -I https://andromedaweb.empresa.local/Andromeda-FrontWeb/index.html
```

Revisar:

```text
/var/log/nginx/andromeda-front.access.log
/var/log/nginx/andromeda-front.error.log
```

Después realizar desde una PC usuaria la verificación funcional del apartado 14.

## 13. Primera publicación

Para Docker/Nginx se utiliza el procedimiento versionado de los apartados 11.10 a 11.15. Los pasos siguientes se aplican a IIS y Nginx directo y sirven además como lista general de control de publicación.

1. Informar una ventana breve de publicación.
2. Evitar que queden mezclados archivos de dos compilaciones. En IIS se puede detener temporalmente el sitio o la aplicación. En Nginx, si se reemplazan archivos directamente, se puede detener brevemente el servicio; una automatización futura puede usar carpetas versionadas y un cambio atómico.
3. Si ya existe una publicación, copiarla a la carpeta de respaldo correspondiente: `/var/www/andromeda/backups/<fecha-version>` en Nginx o `C:\inetpub\AndromedaWeb\backups\<fecha-version>` en IIS.
4. Vaciar la carpeta de publicación actual.
5. Copiar dentro de ella el contenido del nuevo `dist`.
6. Confirmar permisos de lectura y ejecución.
7. Habilitar nuevamente el servicio correspondiente: iniciar el sitio y el application pool en IIS, o iniciar Nginx y ejecutar `nginx -t` si se modificó su configuración.
8. Abrir la URL desde el propio servidor.
9. Abrir la URL desde una PC usuaria.
10. Registrar fecha, versión/commit, responsable y paquete publicado.

## 14. Verificación funcional posterior

Ejecutar esta lista desde una PC de la misma red que los usuarios:

1. Abrir `https://andromedaweb.empresa.local/Andromeda-FrontWeb/`.
2. Confirmar que el certificado sea válido y no aparezcan advertencias.
3. Confirmar que se vea la pantalla inicial, el logo, los iconos y los estilos.
4. Abrir las herramientas del navegador y revisar **Network**.
5. Confirmar que `index.html`, JavaScript, CSS e imágenes respondan 200.
6. Confirmar que las llamadas se dirijan al servidor real de la API y no a `localhost:5062`.
7. Confirmar que no existan errores de CORS ni contenido mixto HTTP/HTTPS.
8. Ejecutar el diagnóstico de estado de capas de Andromeda.
9. Iniciar sesión.
10. Abrir Asientos y ejecutar una consulta controlada.
11. Abrir un asiento en consulta y en edición según corresponda.
12. Cerrar y volver a abrir el navegador para confirmar que el acceso siga funcionando.
13. Registrar el resultado de la prueba y la hora.

## 15. Actualizaciones posteriores

Para cada nueva versión:

1. Obtener el commit aprobado.
2. Confirmar que `base` y la URL de la API correspondan al ambiente.
3. Ejecutar `npm ci` y `npm run build` en la máquina de compilación.
4. Identificar y conservar el paquete generado.
5. Respaldar la publicación vigente.
6. Reemplazar el contenido publicado por el contenido del nuevo `dist`.
7. Verificar permisos.
8. Ejecutar nuevamente la lista de verificación funcional.
9. Conservar por lo menos el paquete anterior para volver atrás.

No es necesario reinstalar Nginx, IIS ni Node.js en cada publicación.

## 16. Vuelta atrás

Si la validación de una versión falla:

1. Detener temporalmente el sitio o la aplicación en IIS, o Nginx si el reemplazo se realiza directamente sobre la carpeta publicada.
2. Retirar los archivos de la versión fallida.
3. Restaurar el contenido completo del último respaldo aprobado.
4. Iniciar el sitio y el application pool en IIS, o iniciar Nginx y verificar su estado.
5. Repetir las pruebas de acceso, recursos estáticos y comunicación con la API.
6. Registrar la causa y la versión retirada.

No mezclar archivos de dos compilaciones. Los nombres generados dentro de `assets` están relacionados con el `index.html` de la misma compilación.

## 17. Diagnóstico rápido de problemas

| Síntoma | Causa probable | Revisión |
|---|---|---|
| IIS muestra 404 al abrir la aplicación | Alias o carpeta física incorrectos | Confirmar aplicación `Andromeda-FrontWeb` y que `index.html` esté en la raíz física |
| Nginx devuelve 404 | `root`, `location` o carpeta física incorrectos | Ejecutar `nginx -T`, verificar `/var/www/andromeda/Andromeda-FrontWeb/index.html` y revisar `error.log` |
| Nginx no recarga | Error de sintaxis o archivo TLS inaccesible | Ejecutar `sudo nginx -t` y corregir el error antes del `reload` |
| El contenedor reinicia continuamente | Configuración Nginx inválida, certificado ausente o puerto ocupado | Ejecutar `docker compose ps` y `docker compose logs frontend` |
| El contenedor está `unhealthy` | `/healthz` no responde dentro del contenedor | Ejecutar `docker compose exec frontend wget -q -O - http://127.0.0.1/healthz` |
| Docker no puede publicar 80 o 443 | Otro proceso usa el puerto | Revisar sockets del host y decidir qué componente termina HTTP/HTTPS |
| Una actualización muestra archivos mezclados | Se reutilizó una etiqueta o se modificó el contenedor en ejecución | Construir una imagen con etiqueta nueva y recrear mediante Compose |
| La pantalla queda blanca y los recursos responden 404 | `base` no coincide con la URL de publicación | Publicar bajo `/Andromeda-FrontWeb/` o recompilar con `base: "/"` |
| El frontend intenta llamar a `localhost:5062` | Se compiló con la configuración local | Corregir la URL de la API y volver a generar `dist` |
| La API responde desde Swagger pero el navegador informa CORS | La API no permite el origen del frontend | Habilitar el origen exacto `https://host[:puerto]` en CORS |
| El navegador informa contenido mixto | Frontend HTTPS y API HTTP | Publicar la API por HTTPS y recompilar con esa URL |
| Los cambios nuevos no aparecen | Caché del navegador o se copió un paquete anterior | Confirmar versión publicada y recargar sin caché |
| Un archivo devuelve 404.3 | MIME type no habilitado | Revisar Static Content y MIME Types |
| La raíz del dominio abre, pero `/Andromeda-FrontWeb/` no | No se creó la aplicación o el alias no coincide | Revisar el paso 10.3 |
| La pantalla abre pero todas las operaciones fallan | Red, DNS, certificado o URL de API | Revisar Network del navegador y conectividad a la API |

Los logs de Nginx o IIS registran la entrega del frontend. Los errores de una consulta o actualización pertenecen a la API y deben correlacionarse con sus logs y el identificador de transacción cuando esté disponible.

## 18. Responsabilidades

| Área | Responsabilidad |
|---|---|
| Desarrollo frontend | Definir `base`, configurar la URL de API, compilar y entregar `dist` identificado |
| Infraestructura web | Docker Engine, Compose, Nginx o IIS, registro de imágenes, DNS, certificado, firewall, permisos, publicación, backup y logs |
| Equipo de API | Publicar la API, HTTPS, CORS y disponibilidad de endpoints |
| Equipo SQL | SQL Server, base, permisos y rendimiento |
| Usuario funcional/QA | Validar login, navegación y operaciones representativas |

## 19. Criterio de instalación terminada

La instalación queda completa cuando:

- La URL HTTPS definitiva abre desde las PCs usuarias.
- En la opción Docker, el contenedor figura activo y `healthy`.
- La imagen publicada tiene una etiqueta única y se conserva la imagen anterior.
- Todos los archivos estáticos responden correctamente.
- El frontend llama a la URL real de la API.
- No existen errores de certificado, CORS ni contenido mixto.
- El diagnóstico de capas responde.
- Login, consulta de Asientos y apertura de un asiento fueron validados.
- El paquete, commit, fecha y procedimiento de vuelta atrás quedaron registrados.

## 20. Referencias oficiales

- [Vite: despliegue de un sitio estático](https://vite.dev/guide/static-deploy.html)
- [Vite: requisitos actuales de Node.js](https://vite.dev/guide/)
- [Node.js: descarga oficial](https://nodejs.org/en/download)
- [npm: instalación de Node.js y npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/)
- [Git para Windows: descarga oficial](https://git-scm.com/download/win)
- [Microsoft Learn: instalación de IIS en Windows Server](https://learn.microsoft.com/en-us/iis/install/installing-iis-85/installing-iis-85-on-windows-server-2012-r2)
- [Microsoft Learn: configuración de SSL/TLS en IIS](https://learn.microsoft.com/en-us/iis/manage/configuring-security/how-to-set-up-ssl-on-iis)
- [Nginx: guía básica y publicación de contenido estático](https://nginx.org/en/docs/beginners_guide.html)
- [Nginx: paquetes oficiales para Linux](https://nginx.org/en/linux_packages.html)
- [Nginx: configuración de servidores HTTPS](https://nginx.org/en/docs/http/configuring_https_servers.html)
- [Nginx para Windows: funcionamiento y limitaciones](https://nginx.org/en/docs/windows.html)
- [Docker Engine: instalación oficial en Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
- [Docker Engine: instalación oficial en Debian](https://docs.docker.com/engine/install/debian/)
- [Docker Engine: instalación oficial en RHEL](https://docs.docker.com/engine/install/rhel/)
- [Docker Compose: instalación del plugin en Linux](https://docs.docker.com/compose/install/linux/)
- [Docker Hub: imagen oficial de Nginx](https://hub.docker.com/_/nginx)


