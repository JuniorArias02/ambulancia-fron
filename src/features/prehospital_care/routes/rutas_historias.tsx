import { RUTAS } from '../../../constants/rutas';
import type { RutaAplicacion } from '../../../types/ruta.types';
import { DisenoHistorias } from '../providers/diseno_historias';

const SOLO_ADMINISTRADOR = ['administrador'] as const;

/**
 * La bandeja, el expediente, el ingreso, los pacientes y los indicadores comparten un layout que guarda en memoria los textos
 * de búsqueda (documento, nombre…) mientras se navega dentro del módulo.
 */
export const rutasHistorias: RutaAplicacion[] = [
  {
    element: <DisenoHistorias />,
    children: [
      {
        path: RUTAS.historiasClinicas,
        handle: { titulo: 'Historias clínicas', roles: SOLO_ADMINISTRADOR },
        lazy: async () => {
          const { PaginaHistorias } = await import('../pages/pagina_historias');
          return { Component: PaginaHistorias };
        },
      },
      {
        path: RUTAS.expediente,
        handle: { titulo: 'Expediente', roles: SOLO_ADMINISTRADOR },
        lazy: async () => {
          const { PaginaExpediente } = await import('../pages/pagina_expediente');
          return { Component: PaginaExpediente };
        },
      },
      {
        path: RUTAS.pacientes,
        handle: { titulo: 'Pacientes', roles: SOLO_ADMINISTRADOR },
        lazy: async () => {
          const { PaginaPacientes } = await import('../pages/pagina_pacientes');
          return { Component: PaginaPacientes };
        },
      },
      {
        path: RUTAS.fichaPaciente,
        handle: { titulo: 'Ficha del paciente', roles: SOLO_ADMINISTRADOR },
        lazy: async () => {
          const { PaginaFichaPaciente } = await import('../pages/pagina_ficha_paciente');
          return { Component: PaginaFichaPaciente };
        },
      },
      {
        path: RUTAS.indicadoresClinicos,
        handle: { titulo: 'Indicadores clínicos', roles: SOLO_ADMINISTRADOR },
        lazy: async () => {
          const { PaginaIndicadores } = await import('../pages/pagina_indicadores');
          return { Component: PaginaIndicadores };
        },
      },
      {
        path: RUTAS.ingreso,
        handle: { titulo: 'Ingreso', roles: SOLO_ADMINISTRADOR },
        lazy: async () => {
          const { PaginaIngreso } = await import('../pages/pagina_ingreso');
          return { Component: PaginaIngreso };
        },
      },
    ],
  },
];
