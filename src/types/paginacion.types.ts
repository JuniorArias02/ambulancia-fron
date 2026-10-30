export interface ResultadoPaginado<T> {
  datos: T[];
  total: number;
  pagina: number;
  limite: number;
}
