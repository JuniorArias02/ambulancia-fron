import { z } from 'zod';

// Se usa sessionStorage para que el token no sobreviva al cierre del navegador.
// Solo se guarda el token y su expiración; los datos del usuario se piden al backend.
const CLAVE = 'ambulancias_galenos.credencial';

const esquemaCredencial = z.object({
  tokenAcceso: z.string().min(1),
  expiraEn: z.iso.datetime({ offset: true }),
});

export type Credencial = z.infer<typeof esquemaCredencial>;

export function credencialVigente(credencial: Credencial): boolean {
  return Date.parse(credencial.expiraEn) > Date.now();
}

export function eliminarCredencial(): void {
  try {
    sessionStorage.removeItem(CLAVE);
  } catch {
    // Almacenamiento no disponible: no hay nada que eliminar.
  }
}

export function leerCredencial(): Credencial | null {
  try {
    const crudo = sessionStorage.getItem(CLAVE);
    if (!crudo) return null;
    const resultado = esquemaCredencial.safeParse(JSON.parse(crudo));
    if (resultado.success && credencialVigente(resultado.data)) {
      return resultado.data;
    }
  } catch {
    // Valor corrupto o almacenamiento bloqueado.
  }
  eliminarCredencial();
  return null;
}

export function guardarCredencial(credencial: Credencial): void {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(credencial));
  } catch {
    // Sin almacenamiento la sesión dura solo mientras la pestaña siga abierta.
  }
}
