import { zodResolver } from '@hookform/resolvers/zod';
import { Hash, MapPin, Plus, Save, UserRound, Warehouse } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoBuscable } from '../../../components/forms/campo_buscable';
import { CampoTexto } from '../../../components/forms/campo_texto';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { ETIQUETAS_ROL } from '../../../constants/roles';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { esRolInterno } from '../../../types/rol.types';
import { useUsuarios } from '../../users/hooks/use_usuarios';
import { LIMITE_MAXIMO } from '../constants/catalogos_inventario';
import { useMutacionInventario } from '../hooks/use_mutacion_inventario';
import { esquemaBodega, type EntradaBodega, type FormularioBodega as Datos } from '../schemas/bodegas.schema';
import { actualizarBodega, crearBodega } from '../services/bodegas.service';
import type { Bodega, DatosBodega } from '../types/inventario.types';
import { soloCambios } from '../utils/cambios';

interface PropiedadesFormularioBodega {
  bodega: Bodega | null;
  /** `GET /usuarios` es solo del administrador: sin él no se puede elegir el responsable. */
  puedeElegirResponsable: boolean;
  alCambiarSinGuardar: (sinGuardar: boolean) => void;
  alTerminar: () => void;
  alCancelar: () => void;
}

export function FormularioBodega({
  bodega,
  puedeElegirResponsable,
  alCambiarSinGuardar,
  alTerminar,
  alCancelar,
}: PropiedadesFormularioBodega) {
  const { notificar } = useNotificaciones();
  const usuarios = useUsuarios({ estado: 'activo', pagina: 1, limite: LIMITE_MAXIMO }, puedeElegirResponsable);
  // El responsable debe ser personal interno activo, nunca un ciudadano.
  const personal = usuarios.data?.datos.filter((usuario) => esRolInterno(usuario.rol)) ?? [];

  const mutacion = useMutacionInventario((datos: DatosBodega) =>
    bodega ? actualizarBodega(bodega.id, soloCambios<DatosBodega>(bodega, datos)) : crearBodega(datos),
  );
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isDirty },
  } = useForm<EntradaBodega, unknown, Datos>({
    resolver: zodResolver(esquemaBodega),
    defaultValues: {
      codigo: bodega?.codigo ?? '',
      nombre: bodega?.nombre ?? '',
      ubicacion: bodega?.ubicacion ?? '',
      responsableId: bodega?.responsableId ?? '',
    },
  });

  useEffect(() => alCambiarSinGuardar(isDirty), [isDirty, alCambiarSinGuardar]);

  const enviar = ({ responsableId, ...datos }: Datos) =>
    // Sin permiso para elegirlo, el responsable no se toca.
    mutacion.mutate(puedeElegirResponsable ? { ...datos, responsableId } : datos, {
      onSuccess: (guardada) => {
        notificar({ tono: 'exito', titulo: bodega ? 'Bodega actualizada' : 'Bodega creada', descripcion: guardada.nombre });
        alTerminar();
      },
      onError: (error) => {
        if (error.estado === 409) setError('codigo', { message: error.message });
        else if (error.estado === 422 && /responsable/i.test(error.message)) setError('responsableId', { message: error.message });
      },
    });

  const enCampo = mutacion.error?.estado === 409 || (mutacion.error?.estado === 422 && /responsable/i.test(mutacion.error.message));

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="flex min-h-full flex-col">
      <fieldset disabled={mutacion.isPending} className="flex-1 space-y-5 px-6 py-6">
        {mutacion.error && !enCampo && <AlertaError error={mutacion.error} />}
        <div className="grid gap-5 sm:grid-cols-2">
          <CampoTexto id="codigo-bodega" etiqueta="Código" icono={Hash} placeholder="BOD-01" maxLength={50} error={errors.codigo?.message} {...register('codigo')} />
          <CampoTexto id="nombre-bodega" etiqueta="Nombre" icono={Warehouse} placeholder="Bodega central" maxLength={150} error={errors.nombre?.message} {...register('nombre')} />
        </div>
        <CampoTexto id="ubicacion-bodega" etiqueta="Dirección o referencia" icono={MapPin} obligatorio={false} maxLength={250} error={errors.ubicacion?.message} {...register('ubicacion')} />
        {puedeElegirResponsable ? (
          <Controller
            control={control}
            name="responsableId"
            render={({ field }) => (
              <CampoBuscable
                id="responsable"
                etiqueta="Responsable"
                icono={UserRound}
                obligatorio={false}
                opciones={[
                  { valor: '', texto: 'Sin responsable' },
                  ...personal.map((usuario) => ({
                    valor: usuario.id,
                    texto: `${usuario.nombres} ${usuario.apellidos}`,
                    detalle: `${ETIQUETAS_ROL[usuario.rol]} · ${usuario.correo}`,
                  })),
                ]}
                valor={field.value}
                alCambiar={field.onChange}
                alSalir={field.onBlur}
                placeholder="Busca por nombre, rol o correo"
                textoSinResultados="Nadie del personal coincide"
                deshabilitado={!usuarios.isSuccess}
                ayuda={usuarios.isPending ? 'Cargando personal…' : 'Personal interno activo.'}
                error={errors.responsableId?.message}
              />
            )}
          />
        ) : (
          bodega?.responsableNombre && (
            <p className="text-[13px] text-texto-secundario">
              Responsable: <span className="font-medium text-texto">{bodega.responsableNombre}</span>. Solo un administrador puede cambiarlo.
            </p>
          )
        )}
        {!bodega && (
          <p className="rounded-xl bg-primario/5 px-4 py-3 text-[13px] text-texto">
            Al crearla se habilita su ubicación de inventario: ya puede recibir entradas y transferencias.
          </p>
        )}
      </fieldset>
      <PieFormulario
        textoEnviar={bodega ? 'Guardar cambios' : 'Crear bodega'}
        textoEnviando="Guardando…"
        icono={bodega ? Save : Plus}
        enviando={mutacion.isPending}
        deshabilitado={bodega !== null && !isDirty}
        alCancelar={alCancelar}
      />
    </form>
  );
}
