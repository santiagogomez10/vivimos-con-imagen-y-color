console.log("Sistema de Vivimos con Imagen y Color iniciado");

const tarjetaCaja = document.getElementById("tarjeta-caja");

tarjetaCaja.addEventListener("click", function () {
  alert("Has seleccionado la caja compartida de Vivimos con Imagen y Color.");
});

const tarjetaVentas = document.getElementById("tarjeta-ventas");

tarjetaVentas.addEventListener("click", function () {
  alert("Has seleccionado Ventas de Vivimos con Imagen y Color.");
});


let efectivoActual = 0;

const tipoMovimiento = document.getElementById("tipo-movimiento");
const valorMovimiento = document.getElementById("valor-movimiento");
const botonRegistrar = document.getElementById("registrar-movimiento");
const efectivoActualTexto = document.getElementById("efectivo-actual");
const mensajeCaja = document.getElementById("mensaje-caja");

botonRegistrar.addEventListener("click", function () {
  const valor = Number(valorMovimiento.value);

  if (!Number.isSafeInteger(valor) || valor <= 0) {
    mensajeCaja.textContent = "Ingresa un valor entero mayor que cero.";
    return;
  }

  if (tipoMovimiento.value === "salida" && valor > efectivoActual) {
    mensajeCaja.textContent = "No hay suficiente efectivo en esta caja de prueba.";
    return;
  }

  if (tipoMovimiento.value === "entrada") {
    efectivoActual += valor;
  } else {
    efectivoActual -= valor;
  }

  efectivoActualTexto.textContent =
    efectivoActual.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    });

  mensajeCaja.textContent = "Movimiento aplicado correctamente.";
  valorMovimiento.value = "";
});
