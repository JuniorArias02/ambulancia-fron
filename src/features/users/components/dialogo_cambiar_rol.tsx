import { CircleCheck, UserCog } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { EstadoError } from '../../../components/states/estado_error';
import { Dialogo } from '../../../components/ui/dialogo';
import { ETIQUETAS_ROL } from '../../../constants/roles';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { esRolInterno, type NombreRol } from '../../../types/rol.types';
import { useCambiarRolUsuario } from '../hooks/use_mutaciones_usuario';
import { useRoles } from '../hooks/use_roles';
import type { Usuario } from '../types/usuario.types';
import { PieFormulario } from '../../../components/forms/pie_formulario';

interface PropiedadesDialogoCambiarRol {
  usuario: Usuario;
  alCerrar: () => void;
}

export function DialogoCambiarRol({ usuario, alCerrar }: PropiedadesDialogoCambiarRol) {
  const roles = useRoles();
  const cambio = useCambiarRolUsuario();
  const { notificar } = useNotificaciones();
  const [rolSeleccionado, setRolSeleccionado] = useState<NombreRol>(usuario.rol);

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    if (!esRolInterno(rolSeleccionado)) return;
    cambio.mutate(
      { id: usuario.id, rol: rolSeleccionado },
      {
        onSuccess: (actualizado) => {
          notificar({
            tono: 'exito',
            titulo: 'Rol actualizado',
            descripcion: `${actualizado.nombres} ahora es ${ETIQUETAS_ROL[actualizado.rol]}.`,
          });
          alCerrar();
        },
      },
    );
  };

  return (
    <Dialogo
      abierto
      titulo="Cambiar rol"
      descripcion={`${usuario.nombres} ${usuario.apellidos} · ${usuario.correo}`}
      cerrable={!cambio.isPending}
      alCerrar={alCerrar}
    >
      {roles.isError ? (
        <EstadoError
          titulo="No fue posible cargar los roles"
          mensaje={roles.error.message}
          alReintentar={() => void roles.refetch()}
        />
      ) : (
        <form onSubmit={enviar}>
          <div className="space-y-4 px-6 py-5">
            {cambio.error && <AlertaError error={cambio.error} />}
            <fieldset disabled={cambio.isPending || !roles.isSuccess} className="space-y-2">
              <legend className="sr-only">Rol del usuario</legend>
              {(roles.data ?? []).map((rol) => {
                const seleccionado = rol.nombre === rolSeleccionado;
                return (
                  <label
                    key={rol.nombre}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition-colors duration-150 has-focus-visible:ring-2 has-focus-visible:ring-primario/40 ${
                      seleccionado
                        ? 'border-primario/40 bg-primario/6'
                        : 'border-borde/80 bg-white/50 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rol"
                      value={rol.nombre}
                      checked={seleccionado}
                      onChange={() => setRolSeleccionado(rol.nombre)}
                      className="sr-only"
                    />
                    <CircleCheck
                      aria-hidden
                      strokeWidth={1.75}
                      className={`mt-0.5 size-[18px] shrink-0 ${seleccionado ? 'text-primario' : 'text-borde'}`}
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-sm font-medium text-texto">
                        {ETIQUETAS_ROL[rol.nombre]}
                        {rol.nombre === usuario.rol && (
                          <span className="rounded-md bg-texto-secundario/10 px-1.5 py-0.5 text-[11px] font-medium text-texto-secundario">
                            Actual
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-[13px] text-texto-secundario">
                        {rol.descripcion}
                      </span>
                    </span>
                  </label>
                );
              })}
              {roles.isPending && <p className="text-sm text-texto-secundario">Cargando roles…</p>}
            </fieldset>
          </div>
          <PieFormulario
            textoEnviar="Cambiar rol"
            textoEnviando="Guardando…"
            icono={UserCog}
            enviando={cambio.isPending}
            deshabilitado={rolSeleccionado === usuario.rol}
            alCancelar={alCerrar}
          />
        </form>
      )}
    </Dialogo>
  );
}
