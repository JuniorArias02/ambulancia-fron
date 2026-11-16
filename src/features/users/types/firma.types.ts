export type EstadoFirma = 'vigente' | 'reemplazada' | 'desactivada';

/** Metadatos de una versión de la firma. La imagen se descarga aparte, con el token. */
export interface FirmaUsuario {
  id: string;
  usuarioId: string;
  estado: EstadoFirma;
  tipoMime: string;
  tamanoBytes: number;
  anchoPx: number;
  altoPx: number;
  huellaSha256: string;
  registradaEn: string;
  reemplazadaEn: string | null;
  desactivadaEn: string | null;
  motivoDesactivacion: string | null;
}
