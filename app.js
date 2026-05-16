const PRECIO_LAMINA = 700; // 💰 valor estimado

const dataInicial = {
   "Panini":[4,6,8],
    "Mexico": [2,6,8,10,12,16,13],
    "South Africa": [2,4,7,9,18,13],
    "Korea": [2,3,6,7,8,9,10,11,12,14,15,16,17,18,19,20],
    "Czechia": [8,12,17,18,19],
    "Canada": [1,4,7,10,11,13],
    "Bosnia": [3,5],
    "Qatar": [2,4,5,6,10,12,17,19],
    "Switzerland" :[2,4,5,6,12,14,15,16,17,18],
    "Brasil": [1,3,7,11,12,15,18,19],
    "Marocco": [1,2,4,6,8,9,10,12,17],
    "Haiti" : [1,12],
    "Scotland":[6,7,9,16,17,19],
    "USA": [3,9,11,14,16,18],
    "Paraguay" : [2,4,6,7,13,16,20],
    "Australia" : [1,2,6,8,9,14],
    "Turkiye" : [3,6,7,10,11,13,17,19],
    "Germany": [3,7,9,11,13,16,17],
    "Quracao": [1,4,5,9,11,13,14,18],
    "Cote d'ivoire": [7,17,20],
    "Ecuador": [3,5,6,10,15,19],
    "Netherlands" : [2,8,9,12,15,19,20],
    "Japan": [1,14,18],
    "Sweden" : [1,5,8,9,14,16,17],
    "Tunisia" : [2,3,10],
    "Belgium" : [1,7,10,12,14,18,19],
    "Egypt" : [1,5,13,18],
    "Ir Iran" : [3,7,11,16,20],
    "New Zealand" : [3,5,7,9,11,13,14,16],
    "Spain" : [4,5,8,13,16],
    "Cabo Verde" : [1,14,18],
    "Saudi Arabia" : [3,4,5,7,8,11,12,15,17,19,20],
    "Uruguay" : [4,5,7,11,13,14,16],
    "France" : [3,7,11,15,16,19],
    "Senegal" :[13,15,16,19],
    "Iraq" : [3,4,11,20],
    "Norway": [4,5,8,9,13,14,17,20],
    "Argentina": [8,13],
    "Algeria" : [2,6,7,10,11,15,16,19,20],
    "Austria" : [1,3,7,14],
    "Jordan" : [1,7],
    "Portugal" : [6,7,10,11,12,13,15,16,17,19,20],
    "Congo Dr" :[6,9,10,12,15,17,19],
    "Usbekistan" : [2,4,6,8,10,12,13,20],
    "Colombia" : [1,5,8,9,14,18],
    "England" : [3,7,11,15,16,19,20],
    "Croatia" : [1,2,4,5,6,9,12,13,14,18],
    "Ghana" : [2,6,10,15],
    "Panama" : [2,3,6,7,8,10,11,12,15,17,20],
    "History": [9,13,19],
    "CC": [1,2,3,4,5,6,7,8,9,10,11,12]
};


let data;
let repetidas;

// ✅ CARGA SEGURA
function cargarStorage(){
  try{
    data = JSON.parse(localStorage.getItem("data")) || dataInicial;
    repetidas = JSON.parse(localStorage.getItem("rep")) || {};
  }catch(e){
    data = dataInicial;
    repetidas = {};
  }
}

// ✅ CAMBIO DE PESTAÑAS
function cambiarTab(tab){
  document.querySelectorAll(".tab").forEach(x => x.classList.add("oculto"));
  document.getElementById(tab).classList.remove("oculto");

  if(tab === "intercambio") renderIntercambio();
}

// ✅ IMPORTANTE
function importante(n){
  return n === 1 || n === 13;
}

// ✅ MAX LÁMINAS
function getMax(eq){
  if(eq === "Panini") return 8;
  if(eq === "CC") return 14;
  return 20;
}

// ✅ SELECT EQUIPOS
function cargarEquipos(){
  let s = document.getElementById("equipoRep");
  s.innerHTML = "";
  for(let eq in data){
    s.innerHTML += `<option value="${eq}">${eq}</option>`;
  }
}

// ✅ GUARDAR
function guardar(){
  localStorage.setItem("data", JSON.stringify(data));
  localStorage.setItem("rep", JSON.stringify(repetidas));
  render();
}

// ✅ RENDER PRINCIPAL
function render(){

  let cont = document.getElementById("contenedor");
  cont.innerHTML = "";

  let falt = 0;

  for(let eq in data){

    let max = getMax(eq);
    let html = `<div class="card"><h3>${eq}</h3><div class="grid">`;

    for(let i=1;i<=max;i++){

      let f = data[eq].includes(i);
      let clase = f ? "faltante" : "conseguida";

      if(importante(i)) clase += " importante";

      html += `
      <div class="lamina ${clase}" onclick="toggle('${eq}',${i})">
        ${i}
      </div>`;

      if(f) falt++;
    }

    html += "</div></div>";
    cont.innerHTML += html;
  }

  renderRepetidas();

  document.getElementById("progreso").innerText = `Faltan ${falt}`;
}

// ✅ TOGGLE
function toggle(eq,n){

  if(data[eq].includes(n)){
    data[eq] = data[eq].filter(x=>x!==n);
  } else {
    data[eq].push(n);
  }

  guardar();
}

// ✅ AGREGAR REPETIDA
function agregarRepetida(){

  let eq = document.getElementById("equipoRep").value;
  let num = Number(document.getElementById("numRep").value);
  let tipo = document.getElementById("tipoRep")?.value || "intercambio";

  if(!num) return;

  if(!repetidas[eq]) repetidas[eq] = {};

  if(!repetidas[eq][num]){
    repetidas[eq][num] = {cantidad:0, tipo: tipo};
  }

  repetidas[eq][num].cantidad++;

  data[eq] = data[eq].filter(x=>x!==num);

  guardar();
}

// ✅ RENDER REPETIDAS
function renderRepetidas(){

  let cont = document.getElementById("contenedorRep");
  cont.innerHTML = "";

  for(let eq in data){

    let max = getMax(eq);
    let lista = repetidas[eq] || {};

    let html = `<div class="card"><h3>${eq}</h3><div class="grid">`;

    for(let i=1;i<=max;i++){

      let info = lista[i];
      let cant = info ? info.cantidad : 0;
      let tipo = info ? info.tipo : "";

      html += `
      <div class="lamina ${cant>0?"repetida":""}" onclick="usarRepetida('${eq}',${i})">
        ${i} ${cant>0?`(${cant})`:""} ${tipo==="venta"?"💰":""}
      </div>`;
    }

    html += "</div></div>";
    cont.innerHTML += html;
  }
}

// ✅ USAR REPETIDA
function usarRepetida(eq,n){

  if(!repetidas[eq] || !repetidas[eq][n]) return;

  repetidas[eq][n].cantidad--;

  if(repetidas[eq][n].cantidad === 0){
    delete repetidas[eq][n];
  }

  guardar();
}

// ✅ INTERCAMBIO MEJORADO (CORREGIDO)
function renderIntercambio(){

  let cont = document.getElementById("resultado");
  cont.innerHTML = "";

  for(let eq in data){

    let faltantes = data[eq];
    let reps = repetidas[eq] || {};

    let tieneIntercambio = false;

    let html = `<div class="card"><h3>${eq}</h3>`;
    html += `<p><strong>Faltantes:</strong> ${faltantes.join(", ") || "Ninguna"}</p>`;
    html += `<ul>`;

    faltantes.forEach(n=>{

      let info = reps[n];

      if(info && info.tipo === "intercambio" && info.cantidad > 0){

        tieneIntercambio = true;

        html += `
        <li>
          ${eq} ${n} 🔁 x${info.cantidad}
          <button onclick="hacerIntercambio('${eq}',${n})">✅</button>
        </li>`;
      }
    });

    html += "</ul>";

    if(!tieneIntercambio){
      html += "<p>Sin intercambios disponibles</p>";
    }

    html += "</div>";
    cont.innerHTML += html;
  }
}

// ✅ EJECUTAR INTERCAMBIO
function hacerIntercambio(eq,n){

  let info = repetidas[eq][n];

  if(!info || info.tipo !== "intercambio") return;

  info.cantidad--;

  if(info.cantidad === 0){
    delete repetidas[eq][n];
  }

  data[eq] = data[eq].filter(x=>x!==n);

  guardar();
}

// ✅ INIT
function init(){
  cargarStorage();
  cargarEquipos();
  render();
}

init();
