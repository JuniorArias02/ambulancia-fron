import { Power, PowerOff } from 'lucide-react';
import type { FormEvent } from 'react';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { Dialogo } from '../../../components/ui/dialogo';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { useCambiarEstadoInstitucion } from '../hooks/use_instituciones';
import type { InstitucionSalud } from '../types/institucion.types';

interface PropiedadesDialogoEstadoInstitucion {
  institucion: InstitucionSalud;
  alCerrar: () => void;
}

export function DialogoEstadoInstitucion({ institucion, alCerrar }: PropiedadesDialogoEstadoInstitucion) {
  const cambio = useCambiarEstadoInstitucion();
  const { notificar } = useNotificaciones();
  const activar = !institucion.activa;

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    cambio.mutate(
      { id: institucion.id, activa: activar },
      {
        onSuccess: (actualizada) => {
          notificar({
            tono: 'exito',
            titulo: actualizada.activa ? 'Institución activada' : 'Institución inactivada',
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
      titulo={activar ? 'Activar institución' : 'Inactivar institución'}
      descripcion={institucion.nombre}
      cerrable={!cambio.isPending}
      alCerrar={alCerrar}
    >
      <form onSubmit={enviar}>
        <div className="space-y-4 px-6 py-5">
          {cambio.error && <AlertaError error={cambio.error} />}
          <p className="text-sm text-texto">
            {activar
              ? 'Volverá a aparecer como destino disponible para los traslados.'
              : 'Dejará de aparecer como destino para los traslados. Su información se conserva y puedes activarla de nuevo.'}
          </p>
        </div>
        <PieFormulario
          textoEnviar={activar ? 'Activar' : 'Inactivar'}
          textoEnviando="Guardando…"
          icono={activar ? Power : PowerOff}
          tono={activar ? 'primario' : 'peligro'}
          enviando={cambio.isPending}
          alCancelar={alCerrar}
        />
      </form>
    </Dialogo>
  );
}
