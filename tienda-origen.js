/*
 * Origen de la tienda para berakhahmedellin.shop (index.html y las fichas producto/<CÓDIGO>/).
 *
 * La tienda real corre en PythonAnywhere o en Render y se muestra dentro de un iframe.
 *   PRINCIPAL: la que ven todos los clientes. Para mudarse a Render basta cambiar 'pa' por 'render'.
 *   Respaldo:  si la principal no avisa que cargó a tiempo, se carga sola la otra.
 *   Pruebas:   ?origen=render · ?origen=pa · ?origen=auto (volver a lo normal). Queda guardado solo en ese navegador.
 */
window.BerakhahTienda = (function () {
  'use strict';

  var SERVIDORES = {
    pa: { nombre: 'PythonAnywhere', url: 'https://berakhahmedellin.pythonanywhere.com', espera: 12000 },
    render: { nombre: 'Render', url: 'https://berakahhshop.onrender.com', espera: 70000 } // Render gratis tarda ~1 min si estaba dormido
  };
  var PRINCIPAL = 'pa';
  var CLAVE = 'berakhah_origen';
  // Páginas de un pedido: el pedido solo existe en la tienda principal, así que no se cambia de servidor
  // (en la otra saldría "pedido no encontrado"). Se muestran apenas cargan.
  var SIN_RESPALDO = /^\/(seguimiento|pagar)(\/|\?|$)/;

  function leer() { try { return localStorage.getItem(CLAVE); } catch (e) { return null; } }
  function guardar(v) { try { if (v) localStorage.setItem(CLAVE, v); else localStorage.removeItem(CLAVE); } catch (e) {} }

  var params = new URLSearchParams(window.location.search);
  var pedido = (params.get('origen') || '').toLowerCase();
  if (pedido === 'auto') guardar(null);
  else if (SERVIDORES[pedido]) guardar(pedido);
  var forzado = SERVIDORES[leer()] ? leer() : null;

  function aviso(texto) {
    var el = document.getElementById('origen-aviso');
    if (!el) {
      el = document.createElement('div');
      el.id = 'origen-aviso';
      el.style.cssText = 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:10000;' +
        'max-width:calc(100vw - 32px);padding:8px 14px;border-radius:20px;background:rgba(20,18,15,.88);' +
        "color:#f1d37a;font:500 12px 'Outfit',sans-serif;text-align:center;pointer-events:none;";
      document.body.appendChild(el);
    }
    el.textContent = texto;
    el.hidden = false;
    clearTimeout(aviso.t);
    aviso.t = setTimeout(function () { el.hidden = true; }, 8000);
  }

  /**
   * iniciar({ iframe, ruta, alCargar, alNavegar })
   *   ruta:      ruta de la tienda a abrir, con sus datos (ej. '/producto/B-98' o '/seguimiento?pedido=1&tel=4567')
   *   alCargar:  la tienda respondió de verdad (no una página de error del hosting)
   *   alNavegar: la clienta cambió de página dentro de la tienda (recibe la ruta)
   */
  function iniciar(op) {
    var iframe = op.iframe;
    var ruta = op.ruta || '/';
    var actual = forzado || PRINCIPAL;
    var origen = '';
    var respondio = false;
    var temporizador = null;

    function cargar(clave) {
      actual = clave;
      origen = new URL(SERVIDORES[clave].url).origin; // event.origin nunca trae barra final
      respondio = false;
      iframe.src = origen + ruta;
      if (forzado) aviso('Tienda desde ' + SERVIDORES[clave].nombre + ' (solo en este navegador · ?origen=auto para volver)');
      else if (clave !== PRINCIPAL) aviso('Tienda de respaldo: ' + SERVIDORES[clave].nombre);
      clearTimeout(temporizador);
      if (SIN_RESPALDO.test(ruta)) {
        iframe.addEventListener('load', function listo() {
          iframe.removeEventListener('load', listo);
          respondio = true;
          if (op.alCargar) op.alCargar();
        });
        return;
      }
      temporizador = setTimeout(function () {
        if (respondio) return;
        if (!forzado && clave === PRINCIPAL) {
          var otra = clave === 'pa' ? 'render' : 'pa';
          console.warn('[Berakhah] ' + SERVIDORES[clave].nombre + ' no respondió; cargando ' + SERVIDORES[otra].nombre + '.');
          cargar(otra);
        } else if (op.alCargar) {
          op.alCargar(); // sin más opciones: se muestra lo que haya
        }
      }, SERVIDORES[clave].espera);
    }

    window.addEventListener('message', function (event) {
      if (event.origin !== origen || !event.data) return;
      var url = String(event.data.url || '');

      if (event.data.type === 'NAV') {
        if (!respondio) {
          respondio = true;
          clearTimeout(temporizador);
          if (op.alCargar) op.alCargar();
        }
        ruta = String(event.data.path || '/');
        if (op.alNavegar) op.alNavegar(ruta);
      } else if (event.data.type === 'WHATSAPP_REDIRECT') {
        if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(url)) window.location.href = url;
      } else if (event.data.type === 'RAPPI_OPEN') {
        // Chrome Android no deja que el iframe (otro dominio) abra la app de Rappi:
        // la navegación se hace desde esta página, que hereda el toque del usuario.
        if (/^(intent:\/\/com\.grability\.rappi|gbrappi:\/\/|https:\/\/www\.rappi\.com\.co\/)/.test(url)) {
          event.source.postMessage({ type: 'RAPPI_OPEN_ACK' }, event.origin);
          window.location.href = url;
        }
      }
    });

    cargar(actual);
  }

  return { iniciar: iniciar, SERVIDORES: SERVIDORES, PRINCIPAL: PRINCIPAL };
})();
