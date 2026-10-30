import { useCallback, useState } from 'react';
import { AvisoDescartarCambios } from '../../../components/feedback/aviso_descartar_cambios';
import { Dialogo } from '../../../components/ui/dialogo';
import { useEmergencia } from '../hooks/use_emergencias';
import type { Emergencia } from '../types/emergencia.types';
import { FormularioEmergencia, type PropiedadesFormularioEmergencia } from './formulario_emergencia';

interface PropiedadesPanelEmergencia {
  /** `null` registra una emergencia nueva; una emergencia abre la corrección de sus datos. */
  emergencia: Emergencia | null;
  alCerrar: () => void;
  /** Se llama con la emergencia confirmada por el backend. */
  alGuardar?: (emergencia: Emergencia) => void;
}

/** En la edición se lee de la caché para comparar con la versión más reciente tras un `409`. */
function FormularioEdicion({
  emergencia: conocida,
  ...propiedades
}: { emergencia: Emergencia } & Omit<PropiedadesFormularioEmergencia, 'emergencia'>) {
  const consulta = useEmergencia(conocida.id, conocida);
  return <FormularioEmergencia emergencia={consulta.data ?? conocida} {...propiedades} />;
}

export function PanelEmergencia({ emergencia, alCerrar, alGuardar }: PropiedadesPanelEmergencia) {
  const [sinGuardar, setSinGuardar] = useState(false);
  const [confirmandoDescarte, setConfirmandoDescarte] = useState(false);

  const solicitarCierre = useCallback(() => {
    if (sinGuardar) setConfirmandoDescarte(true);
    else alCerrar();
  }, [sinGuardar, alCerrar]);

  const propiedadesFormulario = {
    alCambiarSinGuardar: setSinGuardar,
    alTerminar: (guardada: Emergencia) => {
      alCerrar();
      alGuardar?.(guardada);
    },
    alCancelar: solicitarCierre,
  };

  return (
    <Dialogo
      abierto
      variante="lateral"
      titulo={emergencia ? 'Corregir emergencia' : 'Nueva emergencia'}
      descripcion={
        emergencia
          ? emergencia.numeroEmergencia
          : 'Al registrarla se buscarán posibles llamadas repetidas.'
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
      {emergencia ? (
        <FormularioEdicion emergencia={emergencia} {...propiedadesFormulario} />
      ) : (
        <FormularioEmergencia emergencia={null} {...propiedadesFormulario} />
      )}
    </Dialogo>
  );
}
