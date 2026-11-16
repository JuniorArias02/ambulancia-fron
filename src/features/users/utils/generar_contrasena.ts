// Sin caracteres que se confunden al dictarla o copiarla a mano (l, I, O, 0, 1).
const LETRAS = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
const DIGITOS = '23456789';
const TODOS = LETRAS + DIGITOS;

export const LONGITUD_CONTRASENA_GENERADA = 14;

/** Índice uniforme en [0, maximo) con el generador criptográfico, sin sesgo de módulo. */
function indiceAleatorio(maximo: number): number {
  const limite = Math.floor(0x1_0000_0000 / maximo) * maximo;
  const valor = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(valor);
    const [numero = 0] = valor;
    if (numero < limite) return numero % maximo;
  }
}

function caracterDe(conjunto: string): string {
  return conjunto.charAt(indiceAleatorio(conjunto.length));
}

/**
 * Contraseña aleatoria que cumple la política del sistema: al menos una letra y un número.
 * Se mezcla con Fisher-Yates para que la letra y el número obligatorios no queden al inicio.
 */
export function generarContrasena(longitud = LONGITUD_CONTRASENA_GENERADA): string {
  const caracteres = [caracterDe(LETRAS), caracterDe(DIGITOS)];
  while (caracteres.length < longitud) caracteres.push(caracterDe(TODOS));

  for (let i = caracteres.length - 1; i > 0; i -= 1) {
    const j = indiceAleatorio(i + 1);
    const actual = caracteres[i] ?? '';
    caracteres[i] = caracteres[j] ?? '';
    caracteres[j] = actual;
  }
  return caracteres.join('');
}
