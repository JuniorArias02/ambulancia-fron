import { createContext, useContext } from 'react';

/** Textos de búsqueda que identifican a un paciente: nunca van a la URL ni al navegador. */
export interface TextosBusqueda {
  ingreso?: string;
  numeroHistoria?: string;
  documento?: string;
  nombre?: string;
  eps?: string;
}

/** Búsqueda del índice de pacientes: también identifica a la persona. */
export interface TextosPacientes {
  documento?: string;
  nombre?: string;
}

export interface ValorContextoBusqueda {
  textos: TextosBusqueda;
  setTextos: (textos: TextosBusqueda) => void;
  textosPacientes: TextosPacientes;
  setTextosPacientes: (textos: TextosPacientes) => void;
}

export const ContextoBusqueda = createContext<ValorContextoBusqueda | null>(null);

export function useTextosBusqueda(): ValorContextoBusqueda {
  const valor = useContext(ContextoBusqueda);
  if (!valor) throw new Error('useTextosBusqueda debe usarse dentro de DisenoHistorias');
  return valor;
}
