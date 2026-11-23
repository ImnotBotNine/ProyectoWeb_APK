import type { CapacitorConfig } from '@capacitor/cli';

// Configuración de Capacitor para empaquetar el React de Infraganti como app Android.
// webDir apunta a la carpeta que genera "npm run build" (Vite).
const config: CapacitorConfig = {
  appId: 'cl.infraganti.marketplace',
  appName: 'Infraganti',
  webDir: 'dist',
  // Solo laboratorio: la API corre por HTTP sin TLS en el computador.
  // Eliminar estas dos opciones si la API se publica con HTTPS.
  server: { cleartext: true },
  android: { allowMixedContent: true },
};

export default config;
