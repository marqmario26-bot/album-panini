// ✅ EQUIPOS BASE
const equiposBase = [
"Panini-FWC","Mexico-MEX","South Africa-RSA","Korea-KOR","Czechia-CZE",
"Canada-CAN","Bosnia-BIH","Qatar-QAT","Switzerland-SUI",
"Brasil-BRA","Marocco-MAR","Haiti-HAI","Scotland-SCO","USA-USA",
"Paraguay-PAR","Australia-AUS","Turkiye-TUR","Germany-GER",
"Curacao-CUW","Cote Divoire-CIV","Ecuador-ECU","Netherlands-NED",
"Japan-JPN","Sweden-SWE","Tunisia-TUN","Belgium-BEL","Egypt-EGY",
"Ir Iran-IRN","New Zealand-NZL","Spain-ESP","Cabo Verde-CPV",
"Saudi Arabia-KSA","Uruguay-URU","France-FRA","Senegal-SEN",
"Iraq-IRQ","Norway-NOR","Argentina-ARG","Algeria-ALG","Austria-AUT",
"Jordan-JOR","Portugal-POR","Congo Dr-COD","Uzbekistan-UZB",
"Colombia-COL","England-ENG","Croatia-CRO","Ghana-GHA","Panama-PAN",
"History-FWC","CC"
];


let guia = null;

// ✅ cargar archivo JSON

fetch("Guia_Coleccionista_Panini_2026.json")
  .then(res => {
    if (!res.ok) {
      throw new Error("No se pudo cargar la guía");
    }
    return res.json();
  })
  .then(json => {
    guia = json;
  })
  .catch(err => {
    console.log("Error cargando guía", err);
  });


// ✅ DATA

let repetidas = JSON.parse(localStorage.getItem("rep")) || {};
let data = JSON.parse(localStorage.getItem("data")) || {};

// ✅ NORMALIZAR ÁLBUM

function guardaNormalizada() {
  let limpio = {};

  equiposBase.forEach(eq => {
    let lista = Array.isArray(data[eq]) ? data[eq] : [];
    let inicio = getInicio(eq);
    let max = getMax(eq);

    limpio[eq] = [...new Set(
      lista
        .map(v => Number(v))
        .filter(n => Number.isInteger(n) && n >= inicio && n <= max)
    )].sort((a, b) => a - b);
  });

  data = limpio;
}


// ✅ ejecutar una vez al iniciar
guardaNormalizada()

function convertirAlbumSiVieneComoFaltantes(dataImportada) {
  let convertido = {};
  let totalEsperado = 0;
  let totalImportado = 0;

  equiposBase.forEach(eq => {
    let inicio = getInicio(eq);
    let max = getMax(eq);
    let totalEq = max - inicio + 1;
    totalEsperado += totalEq;

    let lista = Array.isArray(dataImportada[eq]) ? dataImportada[eq].map(Number) : [];
    totalImportado += lista.length;
  });

  // Si el archivo trae demasiados valores, probablemente representa faltantes
  let pareceFaltantes = totalImportado > (totalEsperado * 0.6);

  if (!pareceFaltantes) {
    return dataImportada;
  }

  equiposBase.forEach(eq => {
    let inicio = getInicio(eq);
    let max = getMax(eq);

    let faltantes = Array.isArray(dataImportada[eq])
      ? dataImportada[eq].map(Number)
      : [];

    let conseguidas = [];
    for (let i = inicio; i <= max; i++) {
      if (!faltantes.includes(i)) {
        conseguidas.push(i);
      }
    }

    convertido[eq] = conseguidas;
  });

  return convertido;
}

// ✅ GUARDAR

function guardar() {
  let tabActiva = obtenerTabActiva();

  localStorage.setItem("data", JSON.stringify(data));
  localStorage.setItem("rep", JSON.stringify(repetidas));

  render();

  // volver a renderizar secciones dinámicas si están activas
  if (tabActiva === "intercambio") {
    renderIntercambio();
  }

  if (tabActiva === "dashboard") {
    renderDashboard();
  }

  // reaplicar filtros después del render
  reaplicarFiltrosActivos();

  // mantener visible la pestaña activa
  cambiarTab(tabActiva, false);
}


// ✅ MAX

function getMax(eq){
  if(eq.startsWith("Panini")) return 8;
  if(eq.startsWith("History")) return 19;
  if(eq==="CC") return 14;
  return 20;
}


function getInicio(eq){
  if(eq.startsWith("Panini")) return 0;
  if(eq.startsWith("History")) return 9; // ✅ AQUÍ ESTA EL CAMBIO
  return 1;
}



// ✅ RENDER




function render() {
  let cont = document.getElementById("contenedor");
  cont.innerHTML = "";

  let falt = 0;

  for (let eq of equiposBase) {
    let nombre = eq;
    let codigo = eq.includes("-")
      ? eq.split("-")[1]
      : eq.substring(0, 3).toUpperCase();

    let html = `<div class="card equipo">
      <h3>${nombre}</h3><div class="grid">`;

    for (let i = getInicio(eq); i <= getMax(eq); i++) {
      let f = data[eq].includes(i);

      html += `
        <div class="lamina ${f ? "conseguida" : "faltante"}"
             onclick="toggle('${eq}',${i})">
          ${codigo}-${i}
        </div>`;

      if (!f) falt++;
    }

    html += "</div></div>";
    cont.innerHTML += html;
  }

  document.getElementById("progreso").innerHTML = `
    <small>App v1.0 · Desarrollado por Mario Márquez © 2026</small>
  `;

  renderRepetidas();
}




//✅ 1. IMPORTAR ALBUM


function importarDataArchivo(event) {
  let archivo = event.target.files[0];
  if (!archivo) return;

  if (!archivo.name.toLowerCase().endsWith(".json")) {
    alert("Selecciona un archivo JSON válido");
    return;
  }

  let reader = new FileReader();

  reader.onload = function(e) {
    try {
      let dataImportada = JSON.parse(e.target.result);

      if (!dataImportada || typeof dataImportada !== "object" || Array.isArray(dataImportada)) {
        alert("Archivo inválido");
        return;
      }

      // ✅ compatibilidad con archivos viejos
      data = convertirAlbumSiVieneComoFaltantes(dataImportada);

      guardaNormalizada();
      guardar();

      alert("✅ Álbum cargado correctamente");
    } catch (err) {
      alert("Error al leer el archivo");
      console.log(err);
    }
  };

  reader.readAsText(archivo);
}



// ✅ TOGGLE
function toggle(eq,n){
  if (!data[eq] || !Array.isArray(data[eq])) {
    data[eq] = [];
  }

  if(data[eq].includes(n)){
    data[eq] = data[eq].filter(x => x !== n);
  }else{
    data[eq].push(n);
  }

  guardar();
}



// ✅ AGREGAR REPETIDA

function agregarRepetida(){

  let eq = document.getElementById("equipoRep").value;
  let num = Number(document.getElementById("numRep").value);

  if(!eq || !num) return;

  if (!data[eq] || !Array.isArray(data[eq])) {
    data[eq] = [];
  }

  if(!repetidas[eq] || typeof repetidas[eq] !== "object" || Array.isArray(repetidas[eq])) {
    repetidas[eq] = {};
  }

  if(!repetidas[eq][num]){
    repetidas[eq][num] = 0;
  }

  repetidas[eq][num]++;

  // asegurar que también figure como conseguida
  if(!data[eq].includes(num)){
    data[eq].push(num);
  }

  guardar();
}


// ✅ USAR REPETIDA


function usarRepetida(eq,n){

  if(!repetidas[eq] || !repetidas[eq][n]) return;

  if (!data[eq] || !Array.isArray(data[eq])) {
    data[eq] = [];
  }

  repetidas[eq][n]--;

  if(repetidas[eq][n] <= 0){
    delete repetidas[eq][n];
  }

  if(!data[eq].includes(n)){
    data[eq].push(n);
  }

  guardar();
}





// ✅ RENDER REPETIDAS


function renderRepetidas(){

  let cont = document.getElementById("contenedorRep");
  if(!cont) return;

  cont.innerHTML = "";

  for(let eq of equiposBase){

    let max = getMax(eq);
    let lista = (repetidas[eq] && typeof repetidas[eq] === "object" && !Array.isArray(repetidas[eq]))
      ? repetidas[eq]
      : {};

    let html = `<div class="card"><h3>${eq}</h3><div class="grid">`;

    for(let i = getInicio(eq); i <= max; i++){

      let cant = lista[i] || 0;

      html += `
      <div class="lamina ${cant > 0 ? "repetida" : ""}" 
           onclick="usarRepetida('${eq}',${i})">
        ${i} ${cant > 0 ? `(${cant})` : ""}
      </div>`;
    }

    html += "</div></div>";
    cont.innerHTML += html;
  }
}


// ✅ IMPORTAR REPETIDAS


function importarRepetidasArchivo(event){

  let archivo = event.target.files[0];
  if(!archivo) return;

  let reader = new FileReader();

  reader.onload = function(e){

    try{
      let repetidasImportadas = JSON.parse(e.target.result);

      if (!repetidasImportadas || typeof repetidasImportadas !== "object" || Array.isArray(repetidasImportadas)) {
        alert("Archivo inválido");
        return;
      }

      repetidas = repetidasImportadas;

      equiposBase.forEach(eq => {
        if (!repetidas[eq] || typeof repetidas[eq] !== "object" || Array.isArray(repetidas[eq])) {
          repetidas[eq] = {};
        }
      });

      guardar();

      alert("✅ Repetidas cargadas correctamente");

    }catch(err){
      alert("Error al leer el archivo");
      console.log(err);
    }

  };

  reader.readAsText(archivo);
}



// ✅ INTERCAMBIO


function renderIntercambio() {
  let cont = document.getElementById("resultado");
  if (!cont) return;

  cont.innerHTML = "";

  let sugerencias = [];

  for (let eq of equiposBase) {
    let codigo = eq.includes("-")
      ? eq.split("-")[1]
      : eq.substring(0, 3).toUpperCase();

    let listaRep = repetidas[eq];

    // validar que exista objeto de repetidas para ese equipo
    if (!listaRep || typeof listaRep !== "object" || Array.isArray(listaRep)) {
      continue;
    }

    Object.keys(listaRep).forEach(num => {
      let cantidad = Number(listaRep[num]) || 0;

      if (cantidad > 0) {
        sugerencias.push({
          eq,
          codigo,
          lamina: Number(num),
          cantidad
        });
      }
    });
  }

  // ordenar por equipo y número
  sugerencias.sort((a, b) => {
    if (a.eq !== b.eq) return a.eq.localeCompare(b.eq);
    return a.lamina - b.lamina;
  });

  if (sugerencias.length === 0) {
    cont.innerHTML = `
      <div class="card">
        No hay intercambios sugeridos
      </div>`;
    return;
  }

  let textoGuia = "Cargando guía...";
  if (guia && Array.isArray(guia.tablas)) {
    let ref = guia.tablas.find(t => Number(t.tabla) === 3);
    if (ref && Array.isArray(ref.rows)) {
      textoGuia = ref.rows
        .map(r => `${r.Tipo} → ${r["Cambio recomendado"]}`)
        .join("<br>");
    }
  }

  let html = "";

  sugerencias.forEach(s => {
    html += `
      <div class="intercambio-item">
        <span class="info-principal">
          ${s.codigo}-${s.lamina} 🔁 ${s.cantidad}
        </span>

        <button
          data-lamina="${s.codigo}-${s.lamina}"
          data-guia="${encodeURIComponent(textoGuia)}"
          onclick="mostrarGuiaModal(this)">
          💡
        </button>
      </div>`;
  });

  cont.innerHTML = html;
}

function mostrarGuiaModal(btn) {
  let seccionIntercambio = document.getElementById("intercambio");
  if (!seccionIntercambio || seccionIntercambio.classList.contains("oculto")) return;

  let modal = document.getElementById("modalGuia");
  let titulo = document.getElementById("modalTitulo");
  let texto = document.getElementById("modalTexto");

  if (!modal || !titulo || !texto) return;

  let lamina = btn.dataset.lamina || "💡 Intercambio sugerido";
  let guiaTexto = btn.dataset.guia
    ? decodeURIComponent(btn.dataset.guia)
    : "No hay guía disponible";

  titulo.textContent = `💡 ${lamina}`;
  texto.innerHTML = guiaTexto;

  modal.classList.remove("oculto");
}

function cerrarModalGuia() {
  let modal = document.getElementById("modalGuia");
  if (modal) {
    modal.classList.add("oculto");
  }
}


// ✅ EXPORT

function descargarJSON(obj, nombre) {
  if (!nombre) nombre = "archivo.json";

  const contenido = JSON.stringify(obj ?? {}, null, 2);
  const blob = new Blob([contenido], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // revocar después para evitar que se corte la descarga
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportarData() {
  descargarJSON(data, "album.json");
}

function exportarRepetidas() {
  // ✅ exportar primero JSON
  descargarJSON(repetidas, "repetidas.json");

  // ✅ validar librería XLSX
  if (typeof XLSX === "undefined") {
    console.log("XLSX no está disponible. Solo se exportó el JSON.");
    return;
  }

  let filas = [];
  filas.push(["Equipo", "Lamina", "Cantidad"]);

  for (let eq of equiposBase) {
    let lista = repetidas[eq];

    if (!lista || typeof lista !== "object" || Array.isArray(lista)) {
      continue;
    }

    Object.keys(lista).forEach(num => {
      let valor = lista[num];
      let cantidad = 0;

      // ✅ compatible con esquema actual (número)
      if (typeof valor === "number") {
        cantidad = valor;
      }
      // ✅ compatible con esquema futuro (objeto)
      else if (valor && typeof valor === "object" && !Array.isArray(valor)) {
        cantidad = Number(valor.cantidad) || 0;
      }

      if (cantidad > 0) {
        filas.push([eq, Number(num), cantidad]);
      }
    });
  }

  // ✅ crear hoja Excel
  let ws = XLSX.utils.aoa_to_sheet(filas);
  let wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Repetidas");

  let wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  let blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });

  let url = URL.createObjectURL(blob);

  let a = document.createElement("a");
  a.href = url;
  a.download = "repetidas.xlsx";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}




// ✅ DASHBOARD (CORREGIDO)

 
function renderDashboard(){

  let cont = document.getElementById("dashboardData");
  if(!cont) return;

  cont.innerHTML = "";

  let grupo = [];

  let totalGeneral = 0;
  let faltantesGeneral = 0;

  for(let eq of equiposBase){

    let nombre = eq.split("-")[0];
    let total = getMax(eq) - getInicio(eq) + 1;
    let conseguidas = data[eq].length;
    let falt = total - conseguidas;

    totalGeneral += total;
    faltantesGeneral += falt;

    let progreso = ((conseguidas / total) * 100).toFixed(1);

    if(["Panini","History","CC"].includes(nombre)){
      cont.innerHTML += `<div>${nombre}: ${progreso}%</div>`;
    } else {

      grupo.push(`${nombre}: ${conseguidas}/${total} (${progreso}%)`);

      if(grupo.length===4){
        cont.innerHTML += `<div>${grupo.join(" | ")}</div>`;
        grupo = [];
      }
    }
  }

  if(grupo.length > 0){
    cont.innerHTML += `<div>${grupo.join(" | ")}</div>`;
  }

  let conseguidasGeneral = totalGeneral - faltantesGeneral;
  let progresoTotal = ((conseguidasGeneral / totalGeneral) * 100).toFixed(1);

  cont.innerHTML = `
    <div class="dashboard-total">
      🌎 Progreso total del álbum: ${progresoTotal}% 
      <br>
      🌎 Faltan: ${faltantesGeneral}
    </div>
  ` + cont.innerHTML;
}




// ✅ INIT
function cargarEquipos(){
  let s=document.getElementById("equipoRep");
  s.innerHTML="";
  equiposBase.forEach(e=>{
    s.innerHTML+=`<option>${e}</option>`;
  });
}



function cambiarTab(tab, renderizar = true) {
  document.querySelectorAll(".tab").forEach(t => t.classList.add("oculto"));
  document.getElementById(tab).classList.remove("oculto");

  cerrarModalGuia();

  if (renderizar) {
    if (tab === "intercambio") renderIntercambio();
    if (tab === "dashboard") renderDashboard();
  }

  // reaplicar filtro de la pestaña actual
  if (tab === "album") filtrarEquipos();
  if (tab === "repetidas") filtrarRepetidas();
  if (tab === "intercambio") filtrarIntercambio();
}

function obtenerTabActiva() {
  let activa = document.querySelector(".tab:not(.oculto)");
  return activa ? activa.id : "album";
}
 



// ✅ BUSCADOR GENÉRICO MEJORADO
function filtrarLista(inputId, selectorItems, modoTexto = "titulo", displayVisible = "block") {
  let input = document.getElementById(inputId);
  if (!input) return;

  let txt = input.value.toLowerCase().trim();

  document.querySelectorAll(selectorItems).forEach(card => {
    let textoBase = "";

    if (modoTexto === "titulo") {
      let titulo = card.querySelector("h3");
      textoBase = titulo ? titulo.textContent.toLowerCase() : "";
    } 
    else if (modoTexto === "principal") {
      let principal = card.querySelector(".info-principal");
      textoBase = principal ? principal.textContent.toLowerCase() : "";
    } 
    else {
      textoBase = card.textContent.toLowerCase();
    }

    if (textoBase.includes(txt)) {
      card.style.display = displayVisible;
    } else {
      card.style.display = "none";
    }
  });
}

// ✅ BUSCAR EN ÁLBUM
function filtrarEquipos() {
  filtrarLista("buscar", ".equipo", "titulo", "block");
}

// ✅ BUSCAR EN REPETIDAS
function filtrarRepetidas() {
  filtrarLista("buscarRep", "#contenedorRep .card", "titulo", "block");
}

// ✅ BUSCAR EN INTERCAMBIO SUGERIDO
function filtrarIntercambio() {
  filtrarLista("buscarInter", "#resultado .intercambio-item", "principal", "flex");
}

function reaplicarFiltrosActivos() {
  filtrarEquipos();
  filtrarRepetidas();
  filtrarIntercambio();
}

function init(){
  cargarEquipos();
  render();
}

init();

init();



