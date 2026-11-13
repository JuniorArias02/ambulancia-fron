import { useCallback } from 'react';
import { Outlet } from 'react-router';
import { BarraLateral } from '../components/layout/barra_lateral';
import { BarraSuperior } from '../components/layout/barra_superior';
import { AccesoRestringido } from '../components/states/acceso_restringido';
import { useSesion } from '../features/authentication/hooks/use_sesion';
import { usePendientesVerificacion } from '../features/citizen_verifications/hooks/use_verificaciones';
import { usePendientesRevision } from '../features/inventory/hooks/use_consultas_inventario';
import { IndicadorConexion } from '../features/realtime/components/indicador_conexion';
import { ProveedorTiempoReal } from '../features/realtime/providers/proveedor_tiempo_real';
import { useBarraLateral } from '../hooks/use_barra_lateral';
import { useMetadatosRuta } from '../hooks/use_metadatos_ruta';
import { RUTAS } from '../constants/rutas';

/**
 * Layout de las rutas autenticadas. Según la disposición de la ruta, la página ocupa el
 * área de contenido o se dibuja como lienzo de fondo bajo el sidebar y la barra superior.
 *
 * Expone `--lienzo-izquierda` y `--lienzo-superior` para que las páginas de lienzo
 * ubiquen sus controles en la zona que no tapan los paneles flotantes.
 */
export function DisenoPrincipal() {
  const { usuario, cerrarSesion, finalizarSesionLocal } = useSesion();
  const barraLateral = useBarraLateral();
  const metadatos = useMetadatosRuta();
  const alSesionInvalida = useCallback(() => finalizarSesionLocal('no_autorizado'), [finalizarSesionLocal]);
  // Solo el administrador revisa identidades; para los demás roles no se consulta.
  const pendientes = usePendientesVerificacion(usuario?.rol === 'administrador');
  // El inventario lo revisan el administrador y el despachador.
  const novedadesInventario = usePendientesRevision(usuario?.rol === 'administrador' || usuario?.rol === 'despachador');

  if (!usuario) return null;

  const accesoPermitido = !metadatos?.roles || metadatos.roles.includes(usuario.rol);
  const esLienzo = accesoPermitido && metadatos?.disposicion === 'lienzo';

  return (
    <ProveedorTiempoReal usuarioId={usuario.id} alSesionInvalida={alSesionInvalida}>
      <div
        className={`relative h-dvh overflow-hidden [--lienzo-izquierda:12px] [--lienzo-superior:88px] ${
          barraLateral.contraida ? 'md:[--lienzo-izquierda:100px]' : 'md:[--lienzo-izquierda:280px]'
        }`}
      >
        {esLienzo && (
          <main className="absolute inset-0 isolate">
            <Outlet />
          </main>
        )}

        <div
          className={`relative flex h-full gap-3 p-3 ${esLienzo ? 'pointer-events-none' : ''}`}
        >
          <div className="pointer-events-auto contents">
            <BarraLateral
              rolUsuario={usuario.rol}
              contadores={{ [RUTAS.verificaciones]: pendientes.data, [RUTAS.verificacionesInventario]: novedadesInventario.data }}
              contraida={barraLateral.contraida}
              abiertaMovil={barraLateral.abiertaMovil}
              alAlternarContraccion={barraLateral.alternarContraccion}
              alCerrarMovil={barraLateral.cerrarMovil}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="pointer-events-auto contents">
              <BarraSuperior
                titulo={metadatos?.titulo ?? null}
                usuario={usuario}
                menuMovilAbierto={barraLateral.abiertaMovil}
                alAbrirMenuMovil={barraLateral.abrirMovil}
                alCerrarSesion={cerrarSesion}
                indicadores={<IndicadorConexion />}
              />
            </div>

            {!esLienzo && (
              <main className="flex min-h-0 flex-1 flex-col">
                {accesoPermitido ? <Outlet /> : <AccesoRestringido />}
              </main>
            )}
          </div>
        </div>
      </div>
    </ProveedorTiempoReal>
  );
}
