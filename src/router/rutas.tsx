import { createBrowserRouter, Navigate } from 'react-router';
import { PantallaCarga } from '../components/states/pantalla_carga';
import { RUTAS } from '../constants/rutas';
import { rutasAmbulancias } from '../features/ambulances/routes/rutas_ambulancias';
import { rutasAsignaciones } from '../features/assignments/routes/rutas_asignaciones';
import { rutasListasChequeo } from '../features/checklists/routes/rutas_listas_chequeo';
import { rutasAutenticacion } from '../features/authentication/routes/rutas_autenticacion';
import { rutasEmergencias } from '../features/emergencies/routes/rutas_emergencias';
import { rutasDashboard } from '../features/dashboard/routes/rutas_dashboard';
import { rutasInstituciones } from '../features/health_institutions/routes/rutas_instituciones';
import { rutasPerfil } from '../features/profile/routes/rutas_perfil';
import { rutasTurnos } from '../features/shifts/routes/rutas_turnos';
import { rutasUsuarios } from '../features/users/routes/rutas_usuarios';
import { rutasVerificaciones } from '../features/citizen_verifications/routes/rutas_verificaciones';
import { DisenoPrincipal } from '../layouts/diseno_principal';
import { RutaProtegida } from './ruta_protegida';
import { RutaPublica } from './ruta_publica';

// Cada feature declara sus rutas; aquí solo se decide su protección y su layout.
export const enrutador = createBrowserRouter([
  {
    hydrateFallbackElement: <PantallaCarga mensaje="Cargando…" />,
    children: [
      {
        element: <RutaPublica />,
        children: rutasAutenticacion,
      },
      {
        element: <RutaProtegida />,
        children: [
          {
            element: <DisenoPrincipal />,
            children: [
              ...rutasDashboard,
              ...rutasEmergencias,
              ...rutasAsignaciones,
              ...rutasTurnos,
              ...rutasAmbulancias,
              ...rutasInstituciones,
              ...rutasPerfil,
              ...rutasUsuarios,
              ...rutasVerificaciones,
              ...rutasListasChequeo,
            ],
          },
        ],
      },
      { path: '*', element: <Navigate to={RUTAS.inicio} replace /> },
    ],
  },
]);
