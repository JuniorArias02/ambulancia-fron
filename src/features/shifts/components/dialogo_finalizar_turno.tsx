import { Info, Square } from 'lucide-react';
import type { FormEvent } from 'react';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { Dialogo } from '../../../components/ui/dialogo';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import type { EstadoOperativo } from '../../ambulances/types/ambulancia.types';
import { useFinalizarTurno } from '../hooks/use_mutaciones_turno';
import type { Turno } from '../types/turno.types';

interface PropiedadesDialogoFinalizarTurno {
  turno: Turno;
  /** Estado conocido de la ambulancia, para explicar qué pasará con ella. */
  estadoAmbulancia?: EstadoOperativo;
  alCerrar: () => void;
}

export function DialogoFinalizarTurno({ turno, estadoAmbulancia, alCerrar }: PropiedadesDialogoFinalizarTurno) {
  const finalizacion = useFinalizarTurno();
  const { notificar } = useNotificaciones();
  const codigo = turno.ambulanciaCodigo ?? 'La ambulancia';

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    finalizacion.mutate(turno.id, {
      onSuccess: () => {
        notificar({ tono: 'exito', titulo: 'Turno finalizado', descripcion: codigo });
        alCerrar();
      },
    });
  };

  return (
    <Dialogo
      abierto
      titulo="Finalizar turno"
      descripcion={`${codigo} · ${turno.integrantes.length} tripulantes`}
      cerrable={!finalizacion.isPending}
      alCerrar={alCerrar}
    >
      <form onSubmit={enviar}>
        <div className="space-y-4 px-6 py-5">
          {finalizacion.error && <AlertaError error={finalizacion.error} />}
          <p className="flex items-start gap-2.5 rounded-xl bg-primario/5 px-4 py-3 text-[13px] text-texto">
            <Info aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-primario" />
            {estadoAmbulancia === 'en_servicio'
              ? 'La ambulancia está atendiendo un servicio: finalízalo antes de cerrar el turno.'
              : estadoAmbulancia === 'disponible'
                ? 'La ambulancia está disponible y pasará a fuera de servicio, con el motivo "Fin de turno".'
                : 'La ambulancia quedará sin tripulación hasta que se inicie otro turno.'}
          </p>
        </div>
        <PieFormulario
          textoEnviar="Finalizar turno"
          textoEnviando="Finalizando…"
          icono={Square}
          tono="peligro"
          enviando={finalizacion.isPending}
          deshabilitado={estadoAmbulancia === 'en_servicio'}
          alCancelar={alCerrar}
        />
      </form>
    </Dialogo>
  );
}
