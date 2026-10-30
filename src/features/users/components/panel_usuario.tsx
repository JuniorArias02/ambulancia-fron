import { useCallback, useState } from 'react';
import { Dialogo } from '../../../components/ui/dialogo';
import type { Usuario } from '../types/usuario.types';
import { AvisoDescartarCambios } from '../../../components/feedback/aviso_descartar_cambios';
import { FormularioCrearUsuario } from './formulario_crear_usuario';
import { FormularioEditarUsuario } from './formulario_editar_usuario';

interface PropiedadesPanelUsuario {
  /** `null` crea un usuario nuevo; un usuario abre la edición de sus datos. */
  usuario: Usuario | null;
  alCerrar: () => void;
}

export function PanelUsuario({ usuario, alCerrar }: PropiedadesPanelUsuario) {
  const [sinGuardar, setSinGuardar] = useState(false);
  const [confirmandoDescarte, setConfirmandoDescarte] = useState(false);

  const solicitarCierre = useCallback(() => {
    if (sinGuardar) setConfirmandoDescarte(true);
    else alCerrar();
  }, [sinGuardar, alCerrar]);

  const propiedadesFormulario = {
    alCambiarSinGuardar: setSinGuardar,
    alTerminar: alCerrar,
    alCancelar: solicitarCierre,
  };

  return (
    <Dialogo
      abierto
      variante="lateral"
      titulo={usuario ? 'Editar usuario' : 'Nuevo usuario'}
      descripcion={
        usuario
          ? `${usuario.nombres} ${usuario.apellidos}`
          : 'El usuario quedará activo y podrá iniciar sesión de inmediato.'
      }
      alCerrar={solicitarCierre}
    >
      {confirmandoDescarte && (
        <div className="sticky top-0 z-10 bg-white/85 px-6 py-4 backdrop-blur-md">
          <AvisoDescartarCambios
            alDescartar={alCerrar}
            alSeguirEditando={() => setConfirmandoDescarte(false)}
          />
        </div>
      )}
      {usuario ? (
        <FormularioEditarUsuario usuario={usuario} {...propiedadesFormulario} />
      ) : (
        <FormularioCrearUsuario {...propiedadesFormulario} />
      )}
    </Dialogo>
  );
}
