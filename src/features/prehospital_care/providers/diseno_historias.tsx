import { useMemo, useState } from 'react';
import { Outlet } from 'react-router';
import { ContextoBusqueda, type TextosBusqueda, type TextosPacientes } from './contexto_busqueda';

/**
 * Envuelve la bandeja, el expediente, el ingreso, los pacientes y los indicadores. Guarda en memoria los textos de búsqueda
 * (documento, nombre…) para conservarlos al ir y volver del expediente; al salir del módulo se
 * desmonta y se pierden, sin pasar por la URL ni por el almacenamiento del navegador.
 */
export function DisenoHistorias() {
  const [textos, setTextos] = useState<TextosBusqueda>({});
  const [textosPacientes, setTextosPacientes] = useState<TextosPacientes>({});
  const valor = useMemo(() => ({ textos, setTextos, textosPacientes, setTextosPacientes }), [textos, textosPacientes]);
  return (
    <ContextoBusqueda.Provider value={valor}>
      <Outlet />
    </ContextoBusqueda.Provider>
  );
}
