
console.log("Sistema de Vivimos con Imagen y Color iniciado");

// =====================================
// 1. TARJETAS PRINCIPALES
// =====================================

const tarjetaCaja = document.getElementById("tarjeta-caja");
const tarjetaVentas = document.getElementById("tarjeta-ventas");

if (tarjetaCaja) {
  tarjetaCaja.addEventListener("click", function () {
    alert("Has seleccionado Caja compartida.");
  });
}

if (tarjetaVentas) {
  tarjetaVentas.addEventListener("click", function () {
    alert("Has seleccionado Ventas.");
  });
}

// =====================================
// 2. DATOS DE LA SESIÓN DE CAJA
// =====================================

const CLAVE_CAJA = "vivimosCajaSesionV1";

function cargarSesion() {
  try {
    const datos = localStorage.getItem(CLAVE_CAJA);
    return datos ? JSON.parse(datos) : null;
  } catch (error) {
    console.error("No se pudo leer la sesión:", error);
    return null;
  }
}

let sesionCaja = cargarSesion();

function guardarSesion() {
  try {
    localStorage.setItem(
      CLAVE_CAJA,
      JSON.stringify(sesionCaja)
    );
    return true;
  } catch (error) {
    console.error("No se pudo guardar la sesión:", error);
    return false;
  }
}

// =====================================
// 3. ELEMENTOS DE LA PANTALLA
// =====================================

const tipoMovimiento = document.getElementById("tipo-movimiento");
const valorMovimiento = document.getElementById("valor-movimiento");
const botonRegistrar = document.getElementById("registrar-movimiento");
const efectivoActualTexto = document.getElementById("efectivo-actual");
const mensajeCaja = document.getElementById("mensaje-caja");
const listaHistorial = document.getElementById("historial-movimientos");

const campoInicial = document.getElementById("efectivo-inicial");
const botonAbrir = document.getElementById("abrir-caja");
const estadoCaja = document.getElementById("estado-caja");

const campoContado = document.getElementById("efectivo-contado");
const botonCerrar = document.getElementById("cerrar-caja");
const resultadoCierre = document.getElementById("resultado-cierre");

// =====================================
// 4. FUNCIONES AUXILIARES
// =====================================

function formatoCOP(valor) {
  return valor.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  });
}

function efectivoEsperado() {
  if (!sesionCaja) return 0;

  return sesionCaja.movimientos.reduce(function (saldo, item) {
    return saldo + (
      item.tipo === "entrada" ? item.valor : -item.valor
    );
  }, sesionCaja.efectivoInicial);
}

function mostrarHistorial() {
  if (!listaHistorial) return;

  listaHistorial.replaceChildren();

  if (!sesionCaja || sesionCaja.movimientos.length === 0) {
    const fila = document.createElement("li");
    fila.textContent = "Aún no hay movimientos en esta sesión.";
    listaHistorial.appendChild(fila);
    return;
  }

  sesionCaja.movimientos.forEach(function (item) {
    const fila = document.createElement("li");
    const nombreTipo = item.tipo === "entrada" ? "Entrada" : "Salida";

    fila.textContent =
      `${item.fecha} | ${nombreTipo}: ${formatoCOP(item.valor)} | ` +
      `Saldo: ${formatoCOP(item.saldoResultante)}`;

    listaHistorial.appendChild(fila);
  });
}

function actualizarPantalla() {
  const abierta = Boolean(sesionCaja && sesionCaja.estado === "abierta");

  if (efectivoActualTexto) {
    efectivoActualTexto.textContent = formatoCOP(efectivoEsperado());
  }

  if (estadoCaja) {
    estadoCaja.textContent = abierta
      ? "Caja abierta. Puedes registrar movimientos."
      : sesionCaja && sesionCaja.estado === "cerrada"
        ? "Caja cerrada."
        : "Caja cerrada. Registra el efectivo inicial para abrir.";
  }

  if (botonRegistrar) botonRegistrar.disabled = !abierta;
  if (tipoMovimiento) tipoMovimiento.disabled = !abierta;
  if (valorMovimiento) valorMovimiento.disabled = !abierta;

  if (botonAbrir) botonAbrir.disabled = abierta;
  if (campoInicial) campoInicial.disabled = abierta;

  if (botonCerrar) botonCerrar.disabled = !abierta;
  if (campoContado) campoContado.disabled = !abierta;

  mostrarHistorial();

  if (sesionCaja && sesionCaja.estado === "cerrada" && resultadoCierre) {
    resultadoCierre.textContent =
      `Cierre registrado. Esperado: ${formatoCOP(sesionCaja.efectivoEsperadoAlCerrar)}. ` +
      `Contado: ${formatoCOP(sesionCaja.efectivoContado)}. ` +
      `Diferencia: ${formatoCOP(sesionCaja.diferencia)}.`;
  }
}

// =====================================
// 5. ABRIR CAJA
// =====================================

if (botonAbrir) {
  botonAbrir.addEventListener("click", function () {
    const inicial = Number(campoInicial.value);

    if (!Number.isSafeInteger(inicial) || inicial < 0) {
      estadoCaja.textContent =
        "Ingresa un efectivo inicial válido, igual o mayor que cero.";
      return;
    }

    if (sesionCaja && sesionCaja.estado === "abierta") {
      estadoCaja.textContent = "Ya hay una caja abierta.";
      return;
    }

    sesionCaja = {
      estado: "abierta",
      fechaApertura: new Date().toLocaleString("es-CO"),
      efectivoInicial: inicial,
      movimientos: []
    };

    if (!guardarSesion()) {
      sesionCaja = null;
      estadoCaja.textContent = "No se pudo guardar la sesión.";
      return;
    }

    if (resultadoCierre) {
      resultadoCierre.textContent = "Todavía no se ha realizado el cierre.";
    }

    if (mensajeCaja) mensajeCaja.textContent = "Caja abierta correctamente.";

    actualizarPantalla();
  });
}

// =====================================
// 6. REGISTRAR MOVIMIENTOS
// =====================================

if (botonRegistrar) {
  botonRegistrar.addEventListener("click", function () {
    if (!sesionCaja || sesionCaja.estado !== "abierta") {
      mensajeCaja.textContent = "Primero debes abrir la caja.";
      return;
    }

    const valor = Number(valorMovimiento.value);
    const tipo = tipoMovimiento.value;

    if (!Number.isSafeInteger(valor) || valor <= 0) {
      mensajeCaja.textContent =
        "Ingresa un valor entero mayor que cero.";
      return;
    }

    if (tipo === "salida" && valor > efectivoEsperado()) {
      mensajeCaja.textContent =
        "No hay suficiente efectivo en esta caja.";
      return;
    }

    const saldoResultante = efectivoEsperado() +
      (tipo === "entrada" ? valor : -valor);

    const movimiento = {
      tipo: tipo,
      valor: valor,
      saldoResultante: saldoResultante,
      fecha: new Date().toLocaleString("es-CO")
    };

    sesionCaja.movimientos.push(movimiento);

    if (!guardarSesion()) {
      sesionCaja.movimientos.pop();
      mensajeCaja.textContent =
        "No se pudo guardar el movimiento. Intenta de nuevo.";
      return;
    }

    valorMovimiento.value = "";
    mensajeCaja.textContent = "Movimiento registrado correctamente.";

    actualizarPantalla();
  });
}

// =====================================
// 7. CERRAR CAJA
// =====================================

if (botonCerrar) {
  botonCerrar.addEventListener("click", function () {
    if (!sesionCaja || sesionCaja.estado !== "abierta") {
      resultadoCierre.textContent = "No hay una caja abierta.";
      return;
    }

    const contado = Number(campoContado.value);

    if (!Number.isSafeInteger(contado) || contado < 0) {
      resultadoCierre.textContent =
        "Ingresa un efectivo contado válido, igual o mayor que cero.";
      return;
    }

    const esperado = efectivoEsperado();

    sesionCaja.estado = "cerrada";
    sesionCaja.fechaCierre = new Date().toLocaleString("es-CO");
    sesionCaja.efectivoEsperadoAlCerrar = esperado;
    sesionCaja.efectivoContado = contado;
    sesionCaja.diferencia = contado - esperado;

    if (!guardarSesion()) {
      sesionCaja.estado = "abierta";
      delete sesionCaja.fechaCierre;
      delete sesionCaja.efectivoEsperadoAlCerrar;
      delete sesionCaja.efectivoContado;
      delete sesionCaja.diferencia;

      resultadoCierre.textContent = "No se pudo guardar el cierre.";
      return;
    }

    resultadoCierre.textContent =
      `Esperado: ${formatoCOP(esperado)}. ` +
      `Contado: ${formatoCOP(contado)}. ` +
      `Diferencia: ${formatoCOP(contado - esperado)}.`;

    if (mensajeCaja) {
      mensajeCaja.textContent =
        "Caja cerrada. No se permiten más movimientos en esta sesión.";
    }

    actualizarPantalla();
  });
}

// =====================================
// 8. INICIALIZAR LA PANTALLA
// =====================================

actualizarPantalla();
