const PRECIO_LAMINA = 700;

// ✅ EQUIPOS BASE (SIN LÁMINAS)
const equiposBase = [
"Panini","Mexico-MEX","South Africa-RSA","Korea-KOR","Czechia-CZE",
"Canada-CAN","Bosnia-BIH","Qatar-QAT","Switzerland-SUI",
"Brasil-BRA","Marocco-MAR","Haiti-HAI","Scotland-SCO","USA-USA",
"Paraguay-PAR","Australia-AUS","Turkiye-TUR","Germany-GER",
"Quracao-CUW","Cote d'ivoire-CIV","Ecuador-ECU","Netherlands-NED",
"Japan-JPN","Sweden-SWE","Tunisia-TUN","Belgium-BEL","Egypt-EGY",
"Ir Iran-IRN","New Zealand-NZL","Spain-ESP","Cabo Verde-CPV",
"Saudi Arabia-KSA","Uruguay-URU","France-FRA","Senegal-SEN",
"Iraq-IRQ","Norway-NOR","Argentina-ARG","Algeria-ALG","Austria-AUT",
"Jordan-JOR","Portugal-POR","Congo Dr-COD","Usbekistan-UZB",
"Colombia-COL","England-ENG","Croatia-CRO","Ghana-GHA","Panama-PAN",
"History","CC"
];

let data = JSON.parse(localStorage.getItem("data")) || {};
let repetidas = JSON.parse(localStorage.getItem("rep")) || {};

// ✅ CREAR ESTRUCTURA
equiposBase.forEach(eq=>{
  if(!data[eq]) data[eq] = [];
});

// ✅ GUARDAR
function guardar(){
  localStorage.setItem("data", JSON.stringify(data));
  localStorage.setItem("rep", JSON.stringify(repetidas));
  render();
}

// ✅ MAX LÁMINAS
function getMax(eq){
  if(eq === "Panini") return 8;
  if(eq === "CC") return 12;
  return 20;
}

// ✅ RENDER
function render(){

  let cont = document.getElementById("contenedor");
  cont.innerHTML = "";

  let falt = 0;

  for(let eq in data){

    let nombre = eq.split("-")[0];
    let codigo = eq.includes("-") ? eq.split("-")[1] : eq.substring(0,3).toUpperCase();

    let html = `<div class="card equipo">
      <h3>${nombre}</h3>
      <div class="grid">`;

    for(let i=1; i<=getMax(eq); i++){

      let f = data[eq].includes(i);

      // ✅ SOLO CAMBIO AQUÍ: mostrar solo código (3 letras)
      html += `
      <div class="lamina ${f ? "faltante" : "conseguida"}"
      onclick="toggle('${eq}', ${i})">
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

// ✅ TOGGLE
function toggle(eq, n){
  if(data[eq].includes(n)){
    data[eq] = data[eq].filter(x => x !== n);
  } else {
    data[eq].push(n);
  }
  guardar();
}

// ✅ REPETIDAS
function agregarRepetida(){

  let eq = document.getElementById("equipoRep").value;
  let num = Number(document.getElementById("numRep").value);
  let tipo = document.getElementById("tipoRep").value;

  if(!num) return;

  if(!repetidas[eq]) repetidas[eq] = {};

  if(!repetidas[eq][num]){
    repetidas[eq][num] = { cantidad:0, tipo };
  }

  repetidas[eq][num].cantidad++;

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
      <h3>${nombre}</h3>
      <div class="grid">`;

    for(let n in repetidas[eq]){

      let info = repetidas[eq][n];

      if(info.tipo === "venta"){
        total += info.cantidad * PRECIO_LAMINA;
      }

      html += `
      <div class="lamina repetida">
        ${n} (${info.cantidad}) ${info.tipo === "venta" ? "💰" : "🔁"}
      </div>`;
    }

    html += "</div></div>";
    cont.innerHTML += html;
  }

  document.getElementById("valorTotal").innerText = `💰 $${total}`;
}

// ✅ BUSCAR
function filtrarEquipos(){

  let txt = document.getElementById("buscar").value.toLowerCase();

  document.querySelectorAll(".equipo").forEach(e=>{
    e.style.display = e.innerText.toLowerCase().includes(txt)
      ? "block" : "none";
  });
}

// ✅ DASHBOARD
function renderDashboard(){

  let cont = document.getElementById("dashboardData");
  cont.innerHTML = "";
  let grupo = [];

  for(let eq of equiposBase){

    let nombre = eq.split("-")[0];

    let total = getMax(eq);
    let falt = data[eq] ? data[eq].length : 0;

    let prog = ((total - falt) / total * 100).toFixed(1);

    if(["Panini","History","CC"].includes(nombre)){
      cont.innerHTML += `<div>${nombre}: ${prog}%</div>`;
    } else {

      grupo.push(`${nombre}: ${prog}%`);

      if(grupo.length === 4){
        cont.innerHTML += `<div>${grupo.join(" | ")}</div>`;
        grupo = [];
      }
    }
  }
}

// ✅ EXPORT
function exportarData(){
  descargarJSON(data, "album.json");
}

function exportarRepetidas(){
  descargarJSON(repetidas, "repetidas.json");
}

function descargarJSON(obj, nombre){
  let blob = new Blob([JSON.stringify(obj)], {type:"application/json"});
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = nombre;
  a.click();
}

// ✅ IMPORT
function importarDataArchivo(e){
  let file = e.target.files[0];
  let reader = new FileReader();

  reader.onload = function(x){
    data = JSON.parse(x.target.result);
    guardar();
  };

  reader.readAsText(file);
}

function importarRepetidasArchivo(e){
  let file = e.target.files[0];
  let reader = new FileReader();

  reader.onload = function(x){
    repetidas = JSON.parse(x.target.result);
    guardar();
  };

  reader.readAsText(file);
}

// ✅ INIT
function cargarEquipos(){
  let s = document.getElementById("equipoRep");
  s.innerHTML = "";

  equiposBase.forEach(e=>{
    s.innerHTML += `<option>${e}</option>`;
  });
}

function cambiarTab(tab){
  document.querySelectorAll(".tab").forEach(t => t.classList.add("oculto"));
  document.getElementById(tab).classList.remove("oculto");

  if(tab === "dashboard") renderDashboard();
}

function init(){
  cargarEquipos();
  render();
}

init();



