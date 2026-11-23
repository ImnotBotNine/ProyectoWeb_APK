// Hito 4: característica móvil extra con el plugin @capacitor/local-notifications.
// Mientras la app está abierta, cada 15 segundos consulta "Mis ventas" en la API
// (GET /usuarios/{id}/ventas). Si llega un pedido pendiente nuevo, el celular
// muestra una notificación al vendedor. No cambia nada del backend.
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { pedidosApi } from "./api";

const SEGUNDOS_ENTRE_REVISIONES = 15;

export function vigilarVentas(idUsuario) {
  // En el navegador no se hace nada: es solo para la app Android
  if (!Capacitor.isNativePlatform()) {
    return () => {};
  }

  // Ids de los pedidos pendientes que ya conocemos. Los que existían al abrir
  // la app no se notifican, solo los que llegan después.
  let conocidos = null;

  async function revisar() {
    try {
      const ventas = await pedidosApi.ventas(idUsuario);
      const pendientes = ventas.filter((pedido) => pedido.estado === "pendiente");

      if (conocidos === null) {
        conocidos = new Set(pendientes.map((pedido) => pedido.id));
        return;
      }

      for (const pedido of pendientes) {
        if (!conocidos.has(pedido.id)) {
          conocidos.add(pedido.id);
          const productos = pedido.detalle.map((item) => item.nombre).join(", ");
          await LocalNotifications.schedule({
            notifications: [
              {
                id: pedido.id,
                title: "Nuevo pedido en Infraganti",
                body: `${pedido.comprador} quiere comprar: ${productos}`,
                foreground: true,
                isExactNotification: false
              }
            ]
          });
        }
      }
    } catch (error) {
      // Si la API no responde se vuelve a intentar en la próxima revisión
      console.log(error);
    }
  }

  // Pide permiso de notificaciones (Android 13 o superior lo exige) y parte
  LocalNotifications.requestPermissions().then(revisar);
  const intervalo = setInterval(revisar, SEGUNDOS_ENTRE_REVISIONES * 1000);

  // Al cerrar sesión se deja de revisar
  return () => clearInterval(intervalo);
}
