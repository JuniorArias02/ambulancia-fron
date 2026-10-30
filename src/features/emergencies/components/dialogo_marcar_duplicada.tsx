import { ArrowRight, CopyCheck } from 'lucide-react';
import type { FormEvent } from 'react';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { Dialogo } from '../../../components/ui/dialogo';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { useMarcarDuplicada } from '../hooks/use_mutaciones_emergencia';
import type { Emergencia } from '../types/emergencia.types';

interface PropiedadesDialogoMarcarDuplicada {
  /** La llamada repetida, que quedará cancelada. */
  repetida: Emergencia;
  /** La emergencia que sí se atiende. */
  principal: Emergencia;
  alCerrar: () => void;
}

export function DialogoMarcarDuplicada({ repetida, principal, alCerrar }: PropiedadesDialogoMarcarDuplicada) {
  const marcado = useMarcarDuplicada();
  const { notificar } = useNotificaciones();

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    marcado.mutate(
      { id: repetida.id, emergenciaPrincipalId: principal.id },
      {
        onSuccess: () => {
          notificar({
            tono: 'exito',
            titulo: 'Marcada como duplicada',
            descripcion: `${repetida.numeroEmergencia} quedó vinculada a ${principal.numeroEmergencia}.`,
          });
          alCerrar();
        },
      },
    );
  };

  return (
    <Dialogo
      abierto
      titulo="¿Es la misma emergencia?"
      descripcion="Confirma que ambas llamadas reportan el mismo incidente."
      cerrable={!marcado.isPending}
      alCerrar={alCerrar}
    >
      <form onSubmit={enviar}>
        <div className="space-y-4 px-6 py-5">
          {marcado.error && <AlertaError error={marcado.error} />}

          <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
            <div className="rounded-xl border border-borde/80 bg-white/60 px-4 py-3">
              <p className="text-xs text-texto-secundario">Llamada repetida</p>
              <p className="mt-0.5 text-sm font-semibold text-texto tabular-nums">{repetida.numeroEmergencia}</p>
              <p className="mt-1 text-xs text-texto-secundario">Se cancelará</p>
            </div>
            <ArrowRight aria-hidden strokeWidth={1.75} className="mx-auto size-4 rotate-90 text-texto-secundario sm:rotate-0" />
            <div className="rounded-xl border border-primario/30 bg-primario/6 px-4 py-3">
              <p className="text-xs text-texto-secundario">Se atiende</p>
              <p className="mt-0.5 text-sm font-semibold text-texto tabular-nums">{principal.numeroEmergencia}</p>
              <p className="mt-1 truncate text-xs text-texto-secundario">{principal.descripcion}</p>
            </div>
          </div>
        </div>

        <PieFormulario
          textoEnviar="Es la misma emergencia"
          textoEnviando="Guardando…"
          icono={CopyCheck}
          enviando={marcado.isPending}
          alCancelar={alCerrar}
        />
      </form>
    </Dialogo>
  );
}
