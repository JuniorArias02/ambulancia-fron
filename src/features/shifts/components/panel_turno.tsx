import { useCallback, useState } from 'react';
import { AvisoDescartarCambios } from '../../../components/feedback/aviso_descartar_cambios';
import { Dialogo } from '../../../components/ui/dialogo';
import type { Turno } from '../types/turno.types';
import { FormularioTurno } from './formulario_turno';

interface PropiedadesPanelTurno {
  /** `null` inicia un turno; un turno abre el cambio de tripulación. */
  turno: Turno | null;
  ambulanciaInicial?: string;
  alCerrar: () => void;
}

export function PanelTurno({ turno, ambulanciaInicial, alCerrar }: PropiedadesPanelTurno) {
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
      titulo={turno ? 'Cambiar tripulación' : 'Iniciar turno'}
      descripcion={
        turno
          ? `${turno.ambulanciaCodigo ?? 'Ambulancia'} · reemplaza la tripulación completa`
          : 'Asigna la tripulación que operará la ambulancia.'
      }
      alCerrar={solicitarCierre}
    >
      {confirmandoDescarte && (
        <div className="sticky top-0 z-10 bg-white/85 px-6 py-4 backdrop-blur-md">
          <AvisoDescartarCambios alDescartar={alCerrar} alSeguirEditando={() => setConfirmandoDescarte(false)} />
        </div>
      )}
      <FormularioTurno
        turno={turno}
        ambulanciaInicial={ambulanciaInicial}
        alCambiarSinGuardar={setSinGuardar}
        alTerminar={alCerrar}
        alCancelar={solicitarCierre}
      />
    </Dialogo>
  );
}
