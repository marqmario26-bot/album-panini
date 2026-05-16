const PRECIO_LAMINA = 700;

// ✅ EQUIPOS BASE
const equiposBase = [
"Panini","Mexico-MEX","South Africa-RSA","Korea-KOR","Czechia-CZE",
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
"History","CC"
];


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

    let nombre = eq.split("-")[0];
    let codigo = eq.includes("-") ? eq.split("-")[1] : eq.substring(0,3).toUpperCase();

    let html = `<div class="card equipo">
    <h3>${nombre}</h3><div class="grid">`;

    for(let i=1;i<=getMax(eq);i++){

      let f = data[eq].includes(i);

      html+=`
      <div class="lamina ${f?"faltante":"conseguida"}"
      onclick="toggle('${eq}',${i})">
      ${codigo}-${i}
      </div>`;

      if(f) falt++;
    }

    html+="</div></div>";
    cont.innerHTML+=html;
  }

  document.getElementById("progreso").innerText=`Faltan ${falt}`;

  renderRepetidas();
}

// ✅ TOGGLE
function toggle(eq,n){
  if(data[eq].includes(n)){
    data[eq]=data[eq].filter(x=>x!==n);
  }else{
    data[eq].push(n);
  }
  guardar();
}

// ✅ REPETIDAS (INGRESO)
function agregarRepetida(){

  let eq = document.getElementById("equipoRep").value;
  let num = Number(document.getElementById("numRep").value);
  let tipo = document.getElementById("tipoRep").value;

  if(!num) return;

  if(!repetidas[eq]){
    repetidas[eq] = {};
  }

  if(!repetidas[eq][num]){
    repetidas[eq][num] = {intercambio:0, venta:0};
  }

  if(tipo==="venta"){
    repetidas[eq][num].venta++;
  }else{
    repetidas[eq][num].intercambio++;
  }

  guardar();
}

// ✅ SALIDA CORRECTA
function usarRepetida(eq,n,tipo){

  let info = repetidas[eq]?.[n];
  if(!info) return;

  if(tipo==="venta" && info.venta>0){
    info.venta--;
  }

  if(tipo==="intercambio" && info.intercambio>0){
    info.intercambio--;
  }

  if(info.venta===0 && info.intercambio===0){
    delete repetidas[eq][n];
  }

  guardar();
}

// ✅ RENDER REPETIDAS
function renderRepetidas(){

  let cont = document.getElementById("contenedorRep");
  cont.innerHTML = "";

  let total = 0;

  for(let eq in repetidas){

    let nombre = eq.split("-")[0];

    let html = `<div class="card">
    <h3>${nombre}</h3><div class="grid">`;

    for(let n in repetidas[eq]){

      let info = repetidas[eq][n];

      if(info.venta){
        total += info.venta * PRECIO_LAMINA;
      }

      html+=`
      <div class="lamina repetida">

        <span onclick="usarRepetida('${eq}',${n},'intercambio')">
        🔁 ${info.intercambio || 0}
        </span>

        <br>

        <span onclick="usarRepetida('${eq}',${n},'venta')">
        💰 ${info.venta || 0}
        </span>

        <br>${n}

      </div>`;
    }

    html+="</div></div>";
    cont.innerHTML+=html;
  }

  document.getElementById("valorTotal").innerText=`💰 $${total}`;
}

// ✅ INTERCAMBIO FUNCIONAL
function renderIntercambio(){

  let cont=document.getElementById("resultado");
  cont.innerHTML="";

  for(let eq of equiposBase){

    let faltantes=data[eq];
    let reps=repetidas[eq]||{};

    let html=`<div class="card">
    <h3>${eq.split("-")[0]}</h3><ul>`;

    let hay=false;

    faltantes.forEach(n=>{

      let info=reps[n];

      if(info && info.intercambio>0){

        hay=true;

        html+=`
        <li>
          ${n} 🔁(${info.intercambio})
          <button onclick="hacerIntercambio('${eq}',${n})">✅</button>
        </li>`;
      }
    });

    html+="</ul>";

    if(!hay) html+="Sin intercambio";

    html+="</div>";

    cont.innerHTML+=html;
  }
}

// ✅ EJECUTAR INTERCAMBIO
function hacerIntercambio(eq,n){

  let info = repetidas[eq][n];
  if(!info || info.intercambio===0) return;

  info.intercambio--;

  if(info.intercambio===0 && info.venta===0){
    delete repetidas[eq][n];
  }

  data[eq]=data[eq].filter(x=>x!==n);

  guardar();
}

// ✅ ✅ ✅ EXPORT (SOLUCION DESCARGA)
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

// ✅ ✅ ✅ renderDashboard
function renderDashboard(){function render cont = document.getElementById("dashboardData");

  if(!cont) return; // ✅ evita error silencioso

  cont.innerHTML = "";

  let grupo = [];

  for(let eq of equiposBase){

    let nombre = eq.split("-")[0];

    let total = getMax(eq);

    // ✅ protección segura
    let falt = Array.isArray(data[eq]) ? data[eq].length : 0;

    let progreso = ((total - falt) / total * 100).toFixed(1);

    // ✅ separados
    if(["Panini","History","CC"].includes(nombre)){
      cont.innerHTML += `<div>${nombre}: ${progreso}%</div>`;
    } 
    else {

      grupo.push(`${nombre}: ${progreso}%`);

      if(grupo.length === 4){
        cont.innerHTML += `<div>${grupo.join(" | ")}</div>`;
        grupo = [];
      }
    }
  }

  // ✅ Renderiza resto
  if(grupo.length > 0){
    cont.innerHTML += `<div>${grupo.join(" | ")}</div>`;
  }
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

  if(tab === "intercambio"){
    renderIntercambio();
  }

  if(tab === "dashboard"){
    renderDashboard();
  }
}

function init(){
  cargarEquipos();
  render();
}

init();
