let puntaje = 0;
let nombreJugador = "";
let cantidadPreguntas = 10;

document.getElementById("btnCargar").addEventListener("click", pedirDatos);
document.getElementById("btnCerrar").addEventListener("click", cerrarModal);

function pedirDatos() {
  nombreJugador = prompt("Ingresa tu nombre:");
  cantidadPreguntas = parseInt(prompt("¿Cuántas preguntas quieres? (10, 20, 30, 40)"), 10);

  if (!nombreJugador) {
    alert("Debes ingresar un nombre.");
    return;
  }
  if (![10, 20, 30, 40].includes(cantidadPreguntas)) {
    alert("Cantidad inválida. Debes elegir 10, 20, 30 o 40.");
    return;
  }

  cargarSeleccion();
}

async function cargarSeleccion() {
  const seleccionados = [...document.querySelectorAll('input[name="lenguaje"]:checked')]
    .map(cb => cb.value);

  const contenedor = document.getElementById('contenedor');
  const form = document.getElementById('formLenguajes');
  const titulo = document.getElementById('titulo');

  contenedor.innerHTML = '';
  puntaje = 0;

  if (!seleccionados.length) {
    contenedor.innerHTML = "<p>Por favor selecciona al menos un lenguaje.</p>";
    return;
  }

  form.style.display = "none";
  titulo.textContent = "Ejercicios proporcionados";

  let todosEjercicios = [];

  for (const lenguaje of seleccionados) {
    try {
      const response = await fetch(`ejercicios/${lenguaje}.json`);
      const ejercicios = await response.json();
      todosEjercicios.push(...ejercicios);
    } catch (error) {
      console.error(`Error al cargar ${lenguaje}.json`, error);
    }
  }

  const ejerciciosSeleccionados = mezclarArray(todosEjercicios).slice(0, cantidadPreguntas);

  ejerciciosSeleccionados.forEach(ej => crearEjercicio(ej, contenedor));

  const btnTerminar = document.createElement('button');
  btnTerminar.textContent = "Terminar";
  btnTerminar.addEventListener("click", mostrarModal);
  contenedor.appendChild(btnTerminar);
}

function crearEjercicio(ejercicio, contenedor) {
  const div = document.createElement('div');
  div.className = 'ejercicio';

  const pregunta = document.createElement('p');
  pregunta.textContent = ejercicio.pregunta;
  div.appendChild(pregunta);

  mezclarArray([...ejercicio.opciones]).forEach(op => {
    const btn = document.createElement('button');
    btn.textContent = op;
    btn.addEventListener("click", () => evaluarRespuesta(btn, op, ejercicio.respuesta, div));
    div.appendChild(btn);
  });

  contenedor.appendChild(div);
}

function evaluarRespuesta(btn, opcion, respuestaCorrecta, div) {
  div.querySelectorAll('button').forEach(b => b.disabled = true);
  if (opcion === respuestaCorrecta) {
    btn.style.backgroundColor = "green";
    puntaje++;
  } else {
    btn.style.backgroundColor = "red";
  }
}

function mezclarArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

function mostrarModal() {
  const modal = document.getElementById("modal");
  const resultado = document.getElementById("resultado");
  resultado.textContent = `${nombreJugador} elegiste ${cantidadPreguntas} preguntas y tu puntuación final es: ${puntaje} / ${cantidadPreguntas}`;
  modal.style.display = "flex";

  guardarClasificacion(nombreJugador, puntaje, cantidadPreguntas);
}

function cerrarModal() {
  document.getElementById("modal").style.display = "none";
  mostrarRanking();
}

// 🔹 Guardar puntaje en el servidor (Netlify Function)
async function guardarClasificacion(nombre, puntaje, cantidad) {
  try {
    await fetch("/.netlify/functions/saveScore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, puntaje, cantidad }),
    });
  } catch (error) {
    console.error("Error al guardar puntaje:", error);
  }
}

// 🔹 Obtener ranking desde el servidor (Netlify Function)
async function mostrarRanking() {
  const contenedor = document.getElementById("contenedor");
  contenedor.innerHTML = "<h2>Tabla de Clasificación</h2>";

  try {
    const response = await fetch("/.netlify/functions/getScores");
    const ranking = await response.json();

    const tabla = document.createElement("table");
    tabla.innerHTML = `
      <tr><th>Jugador</th><th>Puntaje</th><th>Preguntas</th></tr>
      ${ranking.map(r => `<tr><td>${r.nombre}</td><td>${r.puntaje}</td><td>${r.cantidad}</td></tr>`).join("")}
    `;
    contenedor.appendChild(tabla);
  } catch (error) {
    console.error("Error al obtener ranking:", error);
    contenedor.innerHTML += "<p>No se pudo cargar la tabla de clasificación.</p>";
  }
}
