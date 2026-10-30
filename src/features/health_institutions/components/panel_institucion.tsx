import { useCallback, useState } from 'react';
import { AvisoDescartarCambios } from '../../../components/feedback/aviso_descartar_cambios';
import { Dialogo } from '../../../components/ui/dialogo';
import type { InstitucionSalud } from '../types/institucion.types';
import { FormularioInstitucion } from './formulario_institucion';

interface PropiedadesPanelInstitucion {
  /** `null` registra una institución nueva. */
  institucion: InstitucionSalud | null;
  alCerrar: () => void;
}

export function PanelInstitucion({ institucion, alCerrar }: PropiedadesPanelInstitucion) {
  const [sinGuardar, setSinGuardar] = useState(false);
  const [confirmandoDescarte, setConfirmandoDescarte] = useState(false);

  const solicitarCierre = useCallback(() => {
    if (sinGuardar) setConfirmandoDescarte(true);
    else alCerrar();
  }, [sinGuardar, alCerrar]);

  return (
    <Dialogo
      abierto
      variante="lateral"
      titulo={institucion ? 'Editar institución' : 'Nueva institución'}
      descripcion={institucion ? institucion.nombre : 'Hospital o clínica que recibe pacientes trasladados.'}
      alCerrar={solicitarCierre}
    >
      {confirmandoDescarte && (
        <div className="sticky top-0 z-10 bg-white/85 px-6 py-4 backdrop-blur-md">
          <AvisoDescartarCambios alDescartar={alCerrar} alSeguirEditando={() => setConfirmandoDescarte(false)} />
        </div>
      )}
      <FormularioInstitucion
        institucion={institucion}
        alCambiarSinGuardar={setSinGuardar}
        alTerminar={alCerrar}
        alCancelar={solicitarCierre}
      />
    </Dialogo>
  );
}
