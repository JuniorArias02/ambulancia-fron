import { zodResolver } from '@hookform/resolvers/zod';
import { ListChecks, Save, Text } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoTexto } from '../../../components/forms/campo_texto';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { Dialogo } from '../../../components/ui/dialogo';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { LONGITUDES_LISTA } from '../constants/listas_chequeo';
import { useActualizarListaChequeo } from '../hooks/use_mutaciones_lista_chequeo';
import { esquemaDatosLista, type FormularioDatosLista } from '../schemas/lista_chequeo.schema';
import type { DatosActualizarLista, ListaChequeo } from '../types/lista_chequeo.types';

interface PropiedadesDialogoDatosLista {
  lista: ListaChequeo;
  alCerrar: () => void;
}

export function DialogoDatosLista({ lista, alCerrar }: PropiedadesDialogoDatosLista) {
  const actualizacion = useActualizarListaChequeo(lista.id);
  const { notificar } = useNotificaciones();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormularioDatosLista>({
    resolver: zodResolver(esquemaDatosLista),
    defaultValues: { nombre: lista.nombre, descripcion: lista.descripcion ?? '' },
  });

  const enviar = ({ nombre, descripcion }: FormularioDatosLista) => {
    // Solo se envía lo que cambió.
    const cambios: DatosActualizarLista = {};
    if (nombre !== lista.nombre) cambios.nombre = nombre;
    if (descripcion !== (lista.descripcion ?? '')) cambios.descripcion = descripcion;
    if (Object.keys(cambios).length === 0) {
      alCerrar();
      return;
    }
    actualizacion.mutate(cambios, {
      onSuccess: (actualizada) => {
        notificar({ tono: 'exito', titulo: 'Datos actualizados', descripcion: actualizada.nombre });
        alCerrar();
      },
    });
  };

  return (
    <Dialogo
      abierto
      titulo="Editar datos de la lista"
      descripcion={lista.nombre}
      cerrable={!actualizacion.isPending}
      alCerrar={alCerrar}
    >
      <form onSubmit={handleSubmit(enviar)} noValidate>
        <fieldset disabled={actualizacion.isPending} className="space-y-5 px-6 py-5">
          {actualizacion.error && <AlertaError error={actualizacion.error} />}
          <CampoTexto
            id="nombre-lista"
            etiqueta="Nombre"
            icono={ListChecks}
            maxLength={LONGITUDES_LISTA.nombre}
            error={errors.nombre?.message}
            {...register('nombre')}
          />
          <CampoTexto
            id="descripcion-lista"
            etiqueta="Descripción"
            icono={Text}
            obligatorio={false}
            maxLength={LONGITUDES_LISTA.descripcion}
            error={errors.descripcion?.message}
            {...register('descripcion')}
          />
        </fieldset>
        <PieFormulario
          textoEnviar="Guardar"
          textoEnviando="Guardando…"
          icono={Save}
          enviando={actualizacion.isPending}
          deshabilitado={!isDirty}
          alCancelar={alCerrar}
        />
      </form>
    </Dialogo>
  );
}
