import { ArrowLeft, CircleCheck, CircleSlash, ListChecks, Info, LoaderCircle, Pencil } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { EstadoError } from '../../../components/states/estado_error';
import { RUTAS } from '../../../constants/rutas';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import { DialogoDatosLista } from '../components/dialogo_datos_lista';
import { DialogoEstadoLista } from '../components/dialogo_estado_lista';
import { InsigniaEstadoLista } from '../components/insignia_estado_lista';
import { SeccionOpciones } from '../components/seccion_opciones';
import { SeccionPreguntas } from '../components/seccion_preguntas';
import { claseBotonPrimario, claseBotonSecundario } from '../constants/estilos_listas';
import { useListaChequeo, useListasChequeo } from '../hooks/use_listas_chequeo';

type AccionActiva = 'datos' | 'estado';

function EnlaceVolver() {
  return (
    <Link
      to={RUTAS.listasChequeo}
      className="inline-flex items-center gap-1.5 rounded-lg text-[13px] font-medium text-texto-secundario transition-colors duration-150 hover:text-primario focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none"
    >
      <ArrowLeft aria-hidden strokeWidth={1.75} className="size-4" />
      Listas de chequeo
    </Link>
  );
}

export function PaginaListaChequeo() {
  const { id = '' } = useParams();
  const navegar = useNavigate();
  const consulta = useListaChequeo(id);
  const activa = useListasChequeo({ activa: true, pagina: 1, limite: 1 });
  const [accion, setAccion] = useState<AccionActiva | null>(null);
  const cerrar = () => setAccion(null);

  if (consulta.isPending) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div role="status" aria-label="Cargando lista" className="animate-pulse space-y-3">
          <div className="vidrio h-32 rounded-2xl" />
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
            <div className="vidrio h-80 rounded-2xl" />
            <div className="vidrio h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (consulta.isError) {
    const noExiste = consulta.error.estado === 404 || consulta.error.estado === 400;
    return (
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="vidrio rounded-2xl">
          <EstadoError
            titulo={noExiste ? 'Lista no encontrada' : 'No fue posible cargar la lista'}
            mensaje={noExiste ? 'Puede que el enlace no sea correcto.' : consulta.error.message}
            alReintentar={noExiste ? undefined : () => void consulta.refetch()}
            accionSecundaria={{ etiqueta: 'Volver a las listas', alPulsar: () => void navegar(RUTAS.listasChequeo) }}
          />
        </div>
      </div>
    );
  }

  const lista = consulta.data;
  const listaActiva = activa.data?.datos[0];

  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
      <section aria-labelledby="titulo-lista" className="vidrio rounded-2xl px-5 pt-4 pb-5">
        <EnlaceVolver />
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span
              aria-hidden
              className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${
                lista.activa ? 'bg-exito/10 text-exito' : 'bg-primario/10 text-primario'
              }`}
            >
              <ListChecks strokeWidth={1.75} className="size-6" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h2 id="titulo-lista" className="truncate text-2xl font-semibold tracking-tight text-texto">
                  {lista.nombre}
                </h2>
                <InsigniaEstadoLista activa={lista.activa} />
                {consulta.isFetching && (
                  <LoaderCircle aria-label="Actualizando" className="size-4 animate-spin text-texto-secundario" />
                )}
              </div>
              <p className="mt-1 text-sm text-texto-secundario">
                {lista.descripcion ?? 'Sin descripción'}
                <span aria-hidden> · </span>
                {lista.actualizadaEn ? 'Editada' : 'Creada'} el{' '}
                {formatearFechaHora(lista.actualizadaEn ?? lista.creadaEn)}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button type="button" onClick={() => setAccion('datos')} className={claseBotonSecundario}>
              <Pencil aria-hidden strokeWidth={1.75} className="size-4" />
              Editar datos
            </button>
            {lista.activa ? (
              <button type="button" onClick={() => setAccion('estado')} className={claseBotonSecundario}>
                <CircleSlash aria-hidden strokeWidth={1.75} className="size-4" />
                Desactivar
              </button>
            ) : (
              <button type="button" onClick={() => setAccion('estado')} className={claseBotonPrimario}>
                <CircleCheck aria-hidden strokeWidth={1.75} className="size-4" />
                Activar lista
              </button>
            )}
          </div>
        </div>
        <p className="mt-4 flex items-start gap-2.5 rounded-xl bg-primario/5 px-4 py-3 text-[13px] text-texto">
          <Info aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-primario" />
          {lista.activa
            ? 'Los cambios se aplican de inmediato a los chequeos de los conductores. Nada se borra: lo que ya no uses, desactívalo.'
            : 'Nada se borra: lo que ya no uses, desactívalo. Deben quedar al menos 1 pregunta y 2 opciones activas.'}
        </p>
      </section>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:items-start">
        <SeccionPreguntas lista={lista} />
        <SeccionOpciones lista={lista} />
      </div>

      {accion === 'datos' && <DialogoDatosLista lista={lista} alCerrar={cerrar} />}
      {accion === 'estado' && (
        <DialogoEstadoLista
          lista={lista}
          nombreActiva={listaActiva?.id === lista.id ? undefined : listaActiva?.nombre}
          alCerrar={cerrar}
        />
      )}
    </div>
  );
}
