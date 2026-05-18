const PRECIO_LAMINA = 700;

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
"Jordan-JOR","Portugal-POR","Congo Dr-COD","Usbekistan-UZB",
"Colombia-COL","England-ENG","Croatia-CRO","Ghana-GHA","Panama-PAN",
"History-FWC","CC"
];


let guia = null;

// ✅ cargar archivo JSON
fetch("Guia_Coleccionista_Panini_2026.json")
  .then(res => res.json())
  .then(data => {
    guia = data;
  })
  .catch(err => {
    console.log("Error cargando guía", err);
  });


// ✅ DATA
let data = JSON.parse(localStorage.getItem("data")) || {};
let repetidas = JSON.parse(localStorage.getItem("rep")) || {};

// ✅ NORMALIZAR
equiposBase.forEach(eq=>{
  if(!data[eq] || !Array.isArray(data[eq])){
    data[eq] = [];
  }
});

// ✅ GUARDAR
function guardar(){
  localStorage.setItem("data", JSON.stringify(data));
  localStorage.setItem("rep", JSON.stringify(repetidas));
  render();
}

// ✅ MAX
function getMax(eq){
  if(eq==="Panini") return 8;
  if(eq==="History") return 19;
  if(eq==="CC") return 14;
  return 20;
}

// ✅ RENDER
function render(){

  let cont = document.getElementById("contenedor");
  cont.innerHTML = "";
  
  let falt = 0;

  for(let eq of equiposBase){

    let nombre = eq;
    let codigo = eq.includes("-")
      ? eq.split("-")[1]
      : eq.substring(0,3).toUpperCase();

    let html = `<div class="card equipo">
    <h3>${nombre}</h3><div class="grid">`;

    for(let i=1;i<=getMax(eq);i++){

      let f = data[eq].includes(i);

      html += `
      <div class="lamina ${f?"faltante":"conseguida"}"
      onclick="toggle('${eq}',${i})">
      ${codigo}-${i}
      </div>`;

      if(f) falt++;
    }

    html += "</div></div>";
    cont.innerHTML += html;
  }

  document.getElementById("progreso").innerText = `Faltan ${falt}`;

  renderRepetidas();
}

//✅ 1. IMPORTAR ALBUM
function importarDataArchivo(event){

  let archivo = event.target.files[0];
  if(!archivo) return;

  let reader = new FileReader();

  reader.onload = function(e){

    try{
      let dataImportada = JSON.parse(e.target.result);

      // ✅ validar estructura básica
      if(typeof dataImportada !== "object"){
        alert("Archivo inválido");
        return;
      }

      data = dataImportada;

      guardaNormalizada(); // ✅ importante (ver abajo)
      guardar();

      alert("✅ Álbum cargado correctamente");

    }catch(err){
      alert("Error al leer el archivo");
      console.log(err);
    }

  };

  reader.readAsText(archivo);
}

// ✅ TOGGLE Normalizar

function guardaNormalizada(){

  equiposBase.forEach(eq => {
    if(!data[eq] || !Array.isArray(data[eq])){
      data[eq] = [];
    }
  });

}


// ✅ TOGGLE
function toggle(eq,n){
  if(data[eq].includes(n)){
    data[eq] = data[eq].filter(x=>x!==n);
  }else{
    data[eq].push(n);
  }
  guardar();
}


// ✅ AGREGAR REPETIDA
function agregarRepetida(){

  let eq = document.getElementById("equipoRep").value;
  let num = Number(document.getElementById("numRep").value);

  if(!num) return;

  if(!repetidas[eq]) repetidas[eq] = {};

  if(!repetidas[eq][num]){
    repetidas[eq][num] = 0;
  }

  repetidas[eq][num]++;

  // eliminar de faltantes
  data[eq] = data[eq].filter(x=>x!==num);

  guardar(); // ✅ GUARDA AUTOMÁTICAMENTE
}


// ✅ USAR REPETIDA
function usarRepetida(eq,n){

  if(!repetidas[eq] || !repetidas[eq][n]) return;

  repetidas[eq][n]--;

  if(repetidas[eq][n] === 0){
    delete repetidas[eq][n];
  }

  guardar(); // ✅ GUARDA AUTOMÁTICAMENTE
}



// ✅ RENDER REPETIDAS
function renderRepetidas(){

  let cont = document.getElementById("contenedorRep");
  cont.innerHTML="";

  for(let eq of equiposBase){

    let max = getMax(eq);
    let lista = repetidas[eq] || {};

    
let nombre = eq;

let html = `<div class="card"><h3>${eq}</h3><div class="grid">`;


    for(let i=1;i<=max;i++){

      let cant = lista[i] || 0;

      html+=`
      <div class="lamina ${cant>0?"repetida":""}" 
           onclick="usarRepetida('${eq}',${i})">
        ${i} ${cant>0?`(${cant})`:""}
      </div>`;
    }

    html+="</div></div>";

    cont.innerHTML+=html;
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

      if(typeof repetidasImportadas !== "object"){
        alert("Archivo inválido");
        return;
      }

      repetidas = repetidasImportadas;

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


function renderIntercambio(){

  let cont = document.getElementById("resultado");
  if(!cont) return;

  cont.innerHTML = "";

  let sugerencias = [];

  for(let eq of equiposBase){

    let nombre = eq.split("-")[0];

    // ✅ calcular faltantes reales
    let faltantes = [];
    for(let i=1; i<=getMax(eq); i++){
      if(!data[eq].includes(i)){
        faltantes.push(i);
      }
    }

    let total = getMax(eq);
    let falt = faltantes.length;

    let prioridad = falt / total;

    let reps = repetidas[eq] || {};

    faltantes.forEach(n => {

      let info = reps[n];

      if(info && info > 0){

        sugerencias.push({
          eq,
          nombre,
          lamina: n,
          cantidad: info,
          prioridad
        });

      }

    });
  }
  
if(sugerencias.length === 0){
  cont.innerHTML = `
    <div class="card">
      No hay intercambios sugeridos
    </div>`;
}

 
 
// ✅ RENDER SIMPLE CON INFO

sugerencias.forEach(s => {

  let textoGuia = "";

  if(guia){
    let ref = guia.tablas?.find(t => t.tabla === 3);
    if(ref){
      textoGuia = ref.rows
        .slice(0,3)
        .map(r => `${r.Tipo} → ${r["Cambio recomendado"]}`)
        .join("<br>");
    }
  }

  cont.innerHTML += `
  <div class="card intercambio-card">

    <strong>${s.nombre}</strong> - ${s.lamina}
    <div>🔁 ${s.cantidad} disponibles</div>

    <div class="info-guia">
      💡 Referencia:
      <br>${textoGuia || "Cargando guía..."}
    </div>

    <button onclick="hacerIntercambio('${s.eq}',${s.lamina})">✅</button>

  </div>`;
});


}
// ✅ HACER INTERCAMBIO
function hacerIntercambio(eq,n){

  let info = repetidas[eq][n];
  if(!info || info.intercambio===0) return;

  info.intercambio--;

  if(info.intercambio===0 && info.venta===0){
    delete repetidas[eq][n];
  }

  data[eq] = data[eq].filter(x=>x!==n);

  guardar();
}

// ✅ EXPORT
function descargarJSON(obj,nombre){

  const blob = new Blob([JSON.stringify(obj,null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();

  URL.revokeObjectURL(url);
}

function exportarData(){
  descargarJSON(data,"album.json");
}

function exportarRepetidas(){
  descargarJSON(repetidas,"repetidas.json");
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
    let total = getMax(eq);
    let falt = data[eq].length;

    totalGeneral += total;
    faltantesGeneral += falt;

    let progreso = ((total - falt)/total*100).toFixed(1);

    if(["Panini","History","CC"].includes(nombre)){
      cont.innerHTML += `<div>${nombre}: ${progreso}%</div>`;
    } else {

      grupo.push(`${nombre}: ${progreso}%`);

      if(grupo.length===4){
        cont.innerHTML += `<div>${grupo.join(" | ")}</div>`;
        grupo = [];
      }
    }
  }

  if(grupo.length>0){
    cont.innerHTML += `<div>${grupo.join(" | ")}</div>`;
  }

  let progresoTotal = ((totalGeneral - faltantesGeneral) / totalGeneral * 100).toFixed(1);

  cont.innerHTML = `
    <div class="dashboard-total">
      🌎 Progreso total del álbum: ${progresoTotal}%
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

function cambiarTab(tab){
  document.querySelectorAll(".tab").forEach(t=>t.classList.add("oculto"));
  document.getElementById(tab).classList.remove("oculto");

  if(tab==="intercambio") renderIntercambio();
  if(tab==="dashboard") renderDashboard();
}

// ✅ BUSCADOR (AGREGAR AQUÍ)// ✅ BUSCADOR 
function filtrarEquipos(){

  let txt = document.getElementById("buscar").value.toLowerCase();

  document.querySelectorAll(".equipo").forEach(card => {

    let nombre = card.querySelector("h3").textContent.toLowerCase();

    if(nombre.includes(txt)){
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }

  });
}

function filtrarRepetidas(){

  let txt = document.getElementById("buscarRep").value.toLowerCase();

  document.querySelectorAll("#contenedorRep .card").forEach(card => {

    let nombre = card.querySelector("h3").textContent.toLowerCase();

    if(nombre.includes(txt)){
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }

  });
}

function init(){
  cargarEquipos();
  render();
}

init();




