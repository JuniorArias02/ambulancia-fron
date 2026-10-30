import { Paginacion } from '../../../components/data/paginacion';
import { EstadoError } from '../../../components/states/estado_error';
import { LIMITE_POR_PAGINA } from '../constants/turnos';
import { useTurnos } from '../hooks/use_turnos';
import { EsqueletoTurnos } from './esqueleto_turnos';
import { TablaTurnosFinalizados } from './tabla_turnos_finalizados';

export function TurnosFinalizados({ pagina, alCambiarPagina }: { pagina: number; alCambiarPagina: (pagina: number) => void }) {
  const turnos = useTurnos({ estado: 'finalizado', pagina, limite: LIMITE_POR_PAGINA });

  if (turnos.isPending) return <EsqueletoTurnos />;
  if (turnos.isError) {
    return (
      <EstadoError
        titulo="No fue posible cargar los turnos"
        mensaje={turnos.error.message}
        alReintentar={() => void turnos.refetch()}
      />
    );
  }
  if (turnos.data.datos.length === 0) {
    return <p className="px-5 py-16 text-center text-sm text-texto-secundario">Aún no hay turnos finalizados.</p>;
  }
  return (
    <>
      <div className={turnos.isFetching ? 'opacity-70 transition-opacity' : 'transition-opacity'}>
        <TablaTurnosFinalizados turnos={turnos.data.datos} />
      </div>
      <div className="border-t border-borde/70 px-5 py-4">
        <Paginacion
          pagina={turnos.data.pagina}
          limite={turnos.data.limite}
          total={turnos.data.total}
          deshabilitada={turnos.isFetching}
          alCambiarPagina={alCambiarPagina}
        />
      </div>
    </>
  );
}
