import { CircleCheck, CircleSlash, Info, TriangleAlert } from 'lucide-react';
import type { FormEvent } from 'react';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { Dialogo } from '../../../components/ui/dialogo';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { useCambiarEstadoListaChequeo } from '../hooks/use_mutaciones_lista_chequeo';
import type { ListaChequeo } from '../types/lista_chequeo.types';

interface PropiedadesDialogoEstadoLista {
  lista: Pick<ListaChequeo, 'id' | 'nombre' | 'activa'>;
  /** Nombre de la lista activa actual, si se conoce, para avisar cuál deja de usarse. */
  nombreActiva?: string;
  alCerrar: () => void;
}

/** Activar o desactivar una lista. Solo hay una activa: activar desactiva la anterior. */
export function DialogoEstadoLista({ lista, nombreActiva, alCerrar }: PropiedadesDialogoEstadoLista) {
  const cambio = useCambiarEstadoListaChequeo();
  const { notificar } = useNotificaciones();
  const activar = !lista.activa;

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    cambio.mutate(
      { id: lista.id, activa: activar },
      {
        onSuccess: (actualizada) => {
          notificar({
            tono: 'exito',
            titulo: actualizada.activa ? 'Lista activada' : 'Lista desactivada',
            descripcion: actualizada.nombre,
          });
          alCerrar();
        },
      },
    );
  };

  return (
    <Dialogo
      abierto
      titulo={activar ? 'Activar lista' : 'Desactivar lista'}
      descripcion={lista.nombre}
      cerrable={!cambio.isPending}
      alCerrar={alCerrar}
    >
      <form onSubmit={enviar}>
        <div className="space-y-4 px-6 py-5">
          {cambio.error && <AlertaError error={cambio.error} />}
          {activar ? (
            <>
              <p className="flex items-start gap-2.5 rounded-xl border border-advertencia/25 bg-advertencia/8 px-4 py-3 text-[13px] text-texto">
                <TriangleAlert aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-advertencia" />
                <span>
                  La lista activa actual dejará de usarse
                  {nombreActiva && (
                    <>
                      : <span className="font-medium">{nombreActiva}</span>
                    </>
                  )}
                  .
                </span>
              </p>
              <p className="text-[13px] text-texto-secundario">
                Desde ahora, los conductores harán el chequeo diario con esta lista.
              </p>
            </>
          ) : (
            <p className="flex items-start gap-2.5 rounded-xl bg-primario/5 px-4 py-3 text-[13px] text-texto">
              <Info aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-primario" />
              Los conductores no tendrán una lista de chequeo hasta que actives otra.
            </p>
          )}
        </div>
        <PieFormulario
          textoEnviar={activar ? 'Activar' : 'Desactivar'}
          textoEnviando="Guardando…"
          icono={activar ? CircleCheck : CircleSlash}
          enviando={cambio.isPending}
          alCancelar={alCerrar}
        />
      </form>
    </Dialogo>
  );
}
