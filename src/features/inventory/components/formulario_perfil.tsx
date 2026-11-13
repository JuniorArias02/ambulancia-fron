import { zodResolver } from '@hookform/resolvers/zod';
import { Ambulance, CalendarCheck, CalendarX, Hash, ListChecks, Plus, Text } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoSelector } from '../../../components/forms/campo_selector';
import { CampoTexto } from '../../../components/forms/campo_texto';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { useTiposAmbulancia } from '../../ambulances/hooks/use_tipos_ambulancia';
import { useMutacionInventario } from '../hooks/use_mutacion_inventario';
import { esquemaCrearPerfil, type EntradaCrearPerfil, type FormularioCrearPerfil } from '../schemas/perfil.schema';
import { crearPerfil } from '../services/perfiles.service';
import type { PerfilDotacion } from '../types/inventario.types';

interface PropiedadesFormularioPerfil {
  alCambiarSinGuardar: (sinGuardar: boolean) => void;
  alCrear: (perfil: PerfilDotacion) => void;
  alCancelar: () => void;
}

/** Crea la versión 1 de un perfil, inactiva y sin elementos: se completan en el editor. */
export function FormularioPerfil({ alCambiarSinGuardar, alCrear, alCancelar }: PropiedadesFormularioPerfil) {
  const { notificar } = useNotificaciones();
  const tipos = useTiposAmbulancia();
  const mutacion = useMutacionInventario((datos: FormularioCrearPerfil) => crearPerfil(datos));
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<EntradaCrearPerfil, unknown, FormularioCrearPerfil>({
    resolver: zodResolver(esquemaCrearPerfil),
    defaultValues: { tipoAmbulanciaId: '', codigo: '', nombre: '', descripcion: '', vigenteDesde: '', vigenteHasta: '' },
  });

  useEffect(() => alCambiarSinGuardar(isDirty), [isDirty, alCambiarSinGuardar]);

  const enviar = (datos: FormularioCrearPerfil) =>
    mutacion.mutate(datos, {
      onSuccess: (perfil) => {
        notificar({ tono: 'exito', titulo: 'Perfil creado', descripcion: `${perfil.codigo} v${perfil.version}: agrega sus elementos y actívalo.` });
        alCrear(perfil);
      },
      onError: (error) => {
        if (error.estado === 409) {
          setError('codigo', { message: 'Ese código ya existe para este tipo. Abre el perfil y crea una «Nueva versión».' });
        }
      },
    });

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="flex min-h-full flex-col">
      <fieldset disabled={mutacion.isPending} className="flex-1 space-y-5 px-6 py-6">
        {mutacion.error && mutacion.error.estado !== 409 && <AlertaError error={mutacion.error} />}
        <CampoSelector
          id="tipo-ambulancia"
          etiqueta="Tipo de ambulancia"
          icono={Ambulance}
          disabled={!tipos.isSuccess}
          ayuda={tipos.isPending ? 'Cargando tipos…' : undefined}
          error={errors.tipoAmbulanciaId?.message}
          {...register('tipoAmbulanciaId')}
        >
          <option value="" disabled>
            Selecciona un tipo
          </option>
          {(tipos.data ?? []).map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.nombre}
              {tipo.descripcion ? ` — ${tipo.descripcion}` : ''}
            </option>
          ))}
        </CampoSelector>
        <div className="grid gap-5 sm:grid-cols-2">
          <CampoTexto id="codigo-perfil" etiqueta="Código" icono={Hash} placeholder="DOT-TAB" maxLength={50} error={errors.codigo?.message} {...register('codigo')} />
          <CampoTexto id="nombre-perfil" etiqueta="Nombre" icono={ListChecks} placeholder="Dotación básica TAB" maxLength={150} error={errors.nombre?.message} {...register('nombre')} />
        </div>
        <CampoTexto id="descripcion-perfil" etiqueta="Descripción" icono={Text} obligatorio={false} maxLength={5000} error={errors.descripcion?.message} {...register('descripcion')} />
        <div className="grid gap-5 sm:grid-cols-2">
          <CampoTexto id="vigente-desde" etiqueta="Vigente desde" icono={CalendarCheck} type="date" obligatorio={false} error={errors.vigenteDesde?.message} {...register('vigenteDesde')} />
          <CampoTexto id="vigente-hasta" etiqueta="Vigente hasta" icono={CalendarX} type="date" obligatorio={false} ayuda="Vacío: sin fecha de fin." error={errors.vigenteHasta?.message} {...register('vigenteHasta')} />
        </div>
        <p className="rounded-xl bg-primario/5 px-4 py-3 text-[13px] text-texto">
          Nace inactivo. Agrega sus elementos y actívalo: solo hay un perfil activo por tipo de ambulancia.
        </p>
      </fieldset>
      <PieFormulario textoEnviar="Crear perfil" textoEnviando="Creando…" icono={Plus} enviando={mutacion.isPending} alCancelar={alCancelar} />
    </form>
  );
}

