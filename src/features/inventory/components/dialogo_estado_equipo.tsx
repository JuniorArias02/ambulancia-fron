import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftRight, CircleDot, MessageSquareText, TriangleAlert } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoSelector } from '../../../components/forms/campo_selector';
import { CampoTexto } from '../../../components/forms/campo_texto';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { Dialogo } from '../../../components/ui/dialogo';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { ESTADOS_EQUIPO, ETIQUETAS_ESTADO_EQUIPO } from '../constants/catalogos_inventario';
import { useMutacionInventario } from '../hooks/use_mutacion_inventario';
import { esquemaEstadoEquipo, type EntradaEstadoEquipo, type FormularioEstadoEquipo } from '../schemas/catalogo.schema';
import { cambiarEstadoEquipo } from '../services/catalogo.service';
import type { Equipo } from '../types/inventario.types';

export function DialogoEstadoEquipo({ equipo, alCerrar }: { equipo: Equipo; alCerrar: () => void }) {
  const { notificar } = useNotificaciones();
  const mutacion = useMutacionInventario(({ estado, motivo }: FormularioEstadoEquipo) =>
    cambiarEstadoEquipo(equipo.id, estado, motivo),
  );
  const destinos = ESTADOS_EQUIPO.filter((estado) => estado !== equipo.estado);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EntradaEstadoEquipo, unknown, FormularioEstadoEquipo>({
    resolver: zodResolver(esquemaEstadoEquipo),
    defaultValues: { estado: destinos[0] ?? 'operativo', motivo: '' },
  });
  const estado = useWatch({ control, name: 'estado' });

  const enviar = (datos: FormularioEstadoEquipo) =>
    mutacion.mutate(datos, {
      onSuccess: (actualizado) => {
        notificar({
          tono: 'exito',
          titulo: 'Estado del equipo actualizado',
          descripcion: `${actualizado.numeroSerie}: ${ETIQUETAS_ESTADO_EQUIPO[actualizado.estado]}`,
        });
        alCerrar();
      },
    });

  return (
    <Dialogo
      abierto
      titulo="Cambiar estado del equipo"
      descripcion={`${equipo.insumoNombre ?? 'Equipo'} · Serie ${equipo.numeroSerie}`}
      cerrable={!mutacion.isPending}
      alCerrar={alCerrar}
    >
      <form onSubmit={handleSubmit(enviar)} noValidate>
        <fieldset disabled={mutacion.isPending} className="space-y-5 px-6 py-5">
          {mutacion.error && <AlertaError error={mutacion.error} />}
          <CampoSelector id="estado-equipo" etiqueta="Nuevo estado" icono={CircleDot} error={errors.estado?.message} {...register('estado')}>
            {destinos.map((destino) => (
              <option key={destino} value={destino}>
                {ETIQUETAS_ESTADO_EQUIPO[destino]}
              </option>
            ))}
          </CampoSelector>
          <CampoTexto id="motivo-equipo" etiqueta="Motivo" icono={MessageSquareText} obligatorio={false} maxLength={150} error={errors.motivo?.message} {...register('motivo')} />
          {estado === 'baja' ? (
            <p className="flex items-start gap-2.5 rounded-xl border border-critico/20 bg-critico/6 px-4 py-3 text-[13px] text-texto">
              <TriangleAlert aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-critico" />
              <span>
                <span className="font-semibold">La baja es definitiva:</span> el equipo no admitirá más cambios.
              </span>
            </p>
          ) : (
            estado !== 'operativo' && (
              <p className="rounded-xl bg-advertencia/8 px-4 py-3 text-[13px] text-texto">
                Un equipo que no está operativo no puede ir a una ambulancia, y si está en una deja de contar en su dotación.
              </p>
            )
          )}
        </fieldset>
        <PieFormulario
          textoEnviar="Cambiar estado"
          textoEnviando="Guardando…"
          icono={ArrowLeftRight}
          tono={estado === 'baja' ? 'peligro' : 'primario'}
          enviando={mutacion.isPending}
          alCancelar={alCerrar}
        />
      </form>
    </Dialogo>
  );
}
