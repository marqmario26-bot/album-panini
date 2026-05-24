# Álbum Mundial 2026

Aplicación web para gestionar un álbum de láminas del Mundial 2026 con almacenamiento local en navegador, manejo de repetidas, intercambio sugerido, dashboard de progreso e importación/exportación de datos.

---

## Descripción general

El proyecto está construido con **HTML + CSS + JavaScript puro** y usa **`localStorage`** para mantener la información del álbum y las repetidas entre sesiones.

### Módulos principales

- **Álbum**: visualización y marcación de láminas conseguidas.
- **Repetidas**: registro, uso, importación y exportación de repetidas.
- **Intercambio sugerido**: listado de repetidas disponibles con guía visual en modal.
- **Dashboard**: resumen de progreso total y por equipo/sección.

---

## Estructura del proyecto

- `index.html` → estructura de la interfaz.
- `style.css` → estilos generales, layout responsive, cards, modal y componentes visuales.
- `app.js` → lógica del álbum, repetidas, intercambio, dashboard, filtros, persistencia e importación/exportación.
- `Guia_Coleccionista_Panini_2026.json` → guía externa usada en la sección de intercambio sugerido.
- `img/banner.JPG` → imagen del encabezado.

---

## Funcionalidades implementadas

### 1. Gestión del álbum

- Renderizado completo de equipos y secciones especiales:
  - `Panini-FWC`
  - selecciones nacionales
  - `History-FWC`
  - `CC`
- Marcación de láminas haciendo clic en cada ítem.
- Distinción visual entre:
  - **conseguida**
  - **faltante**
- Persistencia automática con `localStorage`.
- Importación y exportación del álbum en formato `.json`.
- Normalización del álbum mediante `guardaNormalizada()` para:
  - convertir valores a número,
  - eliminar duplicados,
  - filtrar láminas fuera del rango válido por equipo,
  - ordenar listas de láminas.


#### 2. Gestión de repetidas

- Registro de repetidas por equipo y número de lámina.
- Uso de repetidas directamente desde la vista de repetidas.
- Las repetidas registradas también se reflejan como conseguidas en el álbum.
- Importación de repetidas desde archivo .json.
- Exportación de repetidas en:
  - repetidas.json
  - repetidas.xlsx

✅ **NUEVAS MEJORAS:**
- Normalización de repetidas mediante `normalizarRepetidas()` para:
  - convertir valores a número,
  - validar rangos por equipo,
  - eliminar datos inconsistentes,
  - garantizar estructura uniforme.
  
- Mejora en ingreso de repetidas:
  - selección dinámica de lámina según el equipo (`select` en lugar de input manual),
  - reducción de errores de digitación,
  - mejor experiencia en móviles.



#### 3. Intercambio sugerido

- Construcción del listado a partir de las repetidas disponibles.
- Visualización por código de equipo + número de lámina.
- Búsqueda dentro del listado de intercambio sugerido.
- Modal de guía con información de canje basada en Guia_Coleccionista_Panini_2026.json.
- Cierre del modal con botón dedicado.

✅ **MEJORA RECIENTE:**
- Corrección de `renderIntercambio()` para soportar múltiples formatos de datos:
  - número (estructura actual),
  - string (datos antiguos/importados),
  - objeto (posibles ampliaciones futuras).
  
Esto garantiza que el intercambio sugerido siempre funcione correctamente incluso con datos importados o versiones anteriores.


### 4. Dashboard

- Cálculo de progreso total del álbum.
- Conteo de láminas faltantes.
- Resumen por equipo y secciones especiales.
- Agrupación visual para mejorar lectura.

### 5. Buscadores

La aplicación incluye buscadores independientes para:

- álbum,
- repetidas,
- intercambio sugerido.

Los filtros se reaplican después del render para conservar el criterio de búsqueda al modificar el contenido.

### 6. Importación y exportación

#### Álbum
- **Importar**: archivo `.json` con estructura basada en láminas conseguidas por equipo.
- **Exportar**: `album.json`.

#### Repetidas
- **Importar**: archivo `.json` con cantidades por equipo y número de lámina.
- **Exportar**:
  - `repetidas.json`
  - `repetidas.xlsx`

### 7. Persistencia local

Se guarda automáticamente en navegador:

- `data` → álbum
- `rep` → repetidas

---

## Estructura de datos

### Álbum (`data`)
`data` representa **láminas conseguidas** por equipo.

Ejemplo:

```json
{
  "Colombia-COL": [1, 2, 5, 9],
  "Mexico-MEX": [1, 3, 7]
}
```

### Repetidas (`repetidas`)
`repetidas` representa **cantidades de repetidas** por equipo y número.

Ejemplo:

```json
{
  "Colombia-COL": {
    "5": 2,
    "9": 1
  },
  "Mexico-MEX": {
    "3": 4
  }
}
```

> **Importante:** actualmente `repetidas` guarda **solo cantidades**. El selector `tipoRep` sigue visible en la interfaz, pero todavía no modifica la estructura persistida.

---

## Flujo funcional

### Álbum
1. Se cargan equipos base.
2. Se leen datos de `localStorage`.
3. Se normaliza el contenido del álbum.
4. Se renderiza el álbum.
5. Al hacer clic sobre una lámina, se alterna entre conseguida y faltante.

### Repetidas
1. Se selecciona un equipo.
2. Se indica número de lámina.
3. Se registra la repetida.
4. El sistema incrementa la cantidad.
5. Si la lámina no estaba en el álbum, se agrega como conseguida.

### Intercambio sugerido
1. Se recorren las repetidas disponibles.
2. Se construye una lista de sugerencias.
3. Se muestra la guía de canje al pulsar el botón del modal.

### Dashboard
1. Se calcula total de láminas por equipo/sección.
2. Se calcula cuántas están conseguidas.
3. Se calcula faltante y porcentaje.
4. Se muestra resumen total y detalle agrupado.

---

## Funciones principales

### Álbum
- `getMax(eq)`
- `getInicio(eq)`
- `guardaNormalizada()`
- `render()`
- `toggle(eq, n)`
- `importarDataArchivo(event)`
- `exportarData()`

### Repetidas
- `agregarRepetida()`
- `usarRepetida(eq, n)`
- `renderRepetidas()`
- `importarRepetidasArchivo(event)`
- `exportarRepetidas()`

### Intercambio sugerido
- `renderIntercambio()`
- `mostrarGuiaModal(btn)`
- `cerrarModalGuia()`

### Dashboard
- `renderDashboard()`

### Navegación y filtros
- `cambiarTab(tab, renderizar = true)`
- `obtenerTabActiva()`
- `filtrarLista(...)`
- `filtrarEquipos()`
- `filtrarRepetidas()`
- `filtrarIntercambio()`
- `reaplicarFiltrosActivos()`

### Inicialización
- `cargarEquipos()`
- `init()`

---

## Interfaz y experiencia visual

### Visual actual

- Tema oscuro con predominio de azules.
- Banner superior animado.
- Cards por equipo.
- Láminas circulares.
- Scroll interno para álbum, repetidas e intercambio.
- Modal para guía de intercambio.
- Vista adaptable en móviles.

### Mejoras visuales incorporadas / consideradas

- Selector de archivo con mejor integración visual.
- Ajustes responsivos para celulares.
- Modal estilizado para guía de intercambio.
- Mejora del buscador para conservar el filtro después de renderizar.

> Algunas mejoras visuales conversadas (como selección más elegante de lámina repetida o refactor visual del picker de archivos) pueden implementarse como evolución adicional sin alterar la lógica central.

---

## Consideraciones técnicas importantes

1. `data` representa **láminas conseguidas**, no faltantes.
2. Los archivos de importación del álbum deben ser coherentes con ese modelo.
3. `repetidas` guarda cantidades, no objetos complejos.
4. El módulo de intercambio sugerido es actualmente un módulo de **consulta/recomendación**, no de ejecución automática del intercambio.
5. La persistencia depende de `localStorage`, por lo que los datos son locales al navegador/dispositivo.

---

## Importación y compatibilidad

### Álbum
Para que el álbum importe correctamente, el archivo JSON debe respetar la estructura esperada por `data`.

Cada equipo debe apuntar a una lista de números enteros válidos dentro del rango permitido por ese equipo.

### Repetidas
Cada equipo debe apuntar a un objeto cuyas claves son números de lámina y cuyos valores son cantidades.

---

## Recomendaciones de uso

- Exportar periódicamente el álbum y las repetidas como respaldo.
- Usar los buscadores para localizar rápidamente equipos o repetidas.
- Verificar que la guía JSON esté disponible para que el intercambio sugerido muestre información completa.
- Mantener el mismo formato de exportación/importación para evitar inconsistencias en el álbum.

---

## Mejores prácticas aplicadas

El proyecto integra de forma práctica:

- **Variables**
- **Condicionales**
- **Ciclos**
- **Funciones**
- **Arreglos**
- **Manejo de cadenas**
- **Tablas hash / objetos indexados**
- **Complejidad algorítmica básica**
- **Flujo lineal de procesamiento**

---

## Pendientes / mejoras futuras

- Guardar también el tipo de repetida (`intercambio` / `venta`).
- Mejorar visualmente el formulario de repetidas, idealmente con selección dinámica de número de lámina por equipo.
- Consolidar fases de compatibilidad para importaciones antiguas del álbum.
- Seguir refinando el CSS del modal y del selector de archivos para dejar una sola versión limpia.
- Agregar documentación visual o capturas dentro del README.

---

## Cómo ejecutar

1. Mantén en la misma carpeta:
   - `index.html`
   - `style.css`
   - `app.js`
   - `Guia_Coleccionista_Panini_2026.json`
   - carpeta `img/` con `banner.JPG`
2. Abre `index.html` en el navegador.
3. Usa la app normalmente.

> Si la guía no carga, la aplicación sigue funcionando, pero el modal de intercambio mostrará texto por defecto o quedará sin la guía esperada.

---

## Licencia / uso

Proyecto orientado a uso personal, académico o demostrativo.



