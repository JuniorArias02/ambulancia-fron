interface ImportMetaEnv {
  readonly VITE_NOMBRE_APLICACION?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_TIEMPO_REAL_URL?: string;
  readonly VITE_CIUDAD_OPERACION?: string;
  readonly VITE_GEOAPIFY_API_KEY?: string;
  readonly VITE_MAPA_CENTRO_LATITUD?: string;
  readonly VITE_MAPA_CENTRO_LONGITUD?: string;
  readonly VITE_MAPA_ZOOM?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
