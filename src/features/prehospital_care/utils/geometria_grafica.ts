/** Escala lineal de un dominio a un rango de píxeles. */
export function escalaLineal([d0, d1]: [number, number], [r0, r1]: [number, number]) {
  const ancho = d1 - d0 || 1;
  return (valor: number) => r0 + ((valor - d0) / ancho) * (r1 - r0);
}

/** Paso "redondo" (1, 2 o 5 por potencia de 10) para unas 3–4 marcas. */
function pasoRedondo(rango: number, marcas: number): number {
  const bruto = rango / Math.max(marcas, 1);
  const potencia = 10 ** Math.floor(Math.log10(bruto || 1));
  const normalizado = bruto / potencia;
  const factor = normalizado <= 1 ? 1 : normalizado <= 2 ? 2 : normalizado <= 5 ? 5 : 10;
  return factor * potencia;
}

/** Dominio del eje y que incluye los valores y la banda normal, con marcas limpias. */
export function dominioConMarcas(valores: readonly number[], banda: [number, number]) {
  const todos = [...valores, ...banda.filter(Number.isFinite)];
  let minimo = Math.min(...todos);
  let maximo = Math.max(...todos);
  if (minimo === maximo) {
    minimo -= 1;
    maximo += 1;
  }
  const paso = pasoRedondo(maximo - minimo, 3);
  const inicio = Math.floor(minimo / paso) * paso;
  const fin = Math.ceil(maximo / paso) * paso;
  const marcas: number[] = [];
  for (let valor = inicio; valor <= fin + paso / 2; valor += paso) marcas.push(Number(valor.toFixed(6)));
  const dominio: [number, number] = [inicio, fin];
  return { dominio, marcas };
}

/** Tramos continuos de una serie: un valor nulo corta la línea en lugar de inventar un dato. */
export function tramos<T>(puntos: readonly T[], tieneValor: (punto: T) => boolean): T[][] {
  const resultado: T[][] = [];
  let actual: T[] = [];
  for (const punto of puntos) {
    if (tieneValor(punto)) actual.push(punto);
    else if (actual.length > 0) {
      resultado.push(actual);
      actual = [];
    }
  }
  if (actual.length > 0) resultado.push(actual);
  return resultado;
}

/** Índice del punto más cercano en x, para el cursor de la gráfica. */
export function indiceMasCercano(posiciones: readonly number[], x: number): number {
  let mejor = 0;
  let distancia = Infinity;
  posiciones.forEach((posicion, indice) => {
    const actual = Math.abs(posicion - x);
    if (actual < distancia) {
      distancia = actual;
      mejor = indice;
    }
  });
  return mejor;
}
