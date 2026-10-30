import { useCallback, useState } from 'react';
import { AvisoDescartarCambios } from '../../../components/feedback/aviso_descartar_cambios';
import { Dialogo } from '../../../components/ui/dialogo';
import type { Ambulancia } from '../types/ambulancia.types';
import { formatearPlaca } from '../utils/formato_ambulancia';
import { FormularioAmbulancia } from './formulario_ambulancia';

interface PropiedadesPanelAmbulancia {
  /** `null` registra una ambulancia nueva; una ambulancia abre la edición de sus datos. */
  ambulancia: Ambulancia | null;
  alCerrar: () => void;
}

export function PanelAmbulancia({ ambulancia, alCerrar }: PropiedadesPanelAmbulancia) {
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
      titulo={ambulancia ? 'Editar ambulancia' : 'Nueva ambulancia'}
      descripcion={
        ambulancia
          ? `${ambulancia.codigo} · ${formatearPlaca(ambulancia.placa)}`
          : 'Registra un vehículo de la flota.'
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
      <FormularioAmbulancia
        ambulancia={ambulancia}
        alCambiarSinGuardar={setSinGuardar}
        alTerminar={alCerrar}
        alCancelar={solicitarCierre}
      />
    </Dialogo>
  );
}
