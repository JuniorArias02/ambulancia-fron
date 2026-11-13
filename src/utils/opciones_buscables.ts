export interface OpcionBuscable {
  valor: string;
  texto: string;
  /** Segunda línea más tenue (código, vencimiento, cantidad…); también se busca en ella. */
  detalle?: string;
  deshabilitada?: boolean;
}

/** Sin mayúsculas ni tildes, para buscar «gasa» y encontrar «Gasa estéril». */
function normalizar(texto: string): string {
  return texto.toLocaleLowerCase('es').normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

/** Cada palabra escrita debe aparecer en el texto o el detalle, en cualquier orden. */
export function filtrarOpciones(opciones: readonly OpcionBuscable[], consulta: string): OpcionBuscable[] {
  const palabras = normalizar(consulta).split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return [...opciones];
  return opciones.filter((opcion) => {
    const objetivo = normalizar(`${opcion.texto} ${opcion.detalle ?? ''}`);
    return palabras.every((palabra) => objetivo.includes(palabra));
  });
}
