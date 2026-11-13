import { useCallback, useState, type ReactNode } from 'react';
import { AvisoDescartarCambios } from '../../../components/feedback/aviso_descartar_cambios';
import { Dialogo } from '../../../components/ui/dialogo';

interface PropiedadesPanelEdicion {
  titulo: string;
  descripcion?: ReactNode;
  alCerrar: () => void;
  /** Recibe el aviso de cambios sin guardar y la forma de pedir el cierre (Cancelar). */
  children: (control: { alCambiarSinGuardar: (sinGuardar: boolean) => void; solicitarCierre: () => void }) => ReactNode;
}

/** Panel lateral con formulario: pide confirmación antes de descartar cambios. */
export function PanelEdicion({ titulo, descripcion, alCerrar, children }: PropiedadesPanelEdicion) {
  const [sinGuardar, setSinGuardar] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  const solicitarCierre = useCallback(() => {
    if (sinGuardar) setConfirmando(true);
    else alCerrar();
  }, [sinGuardar, alCerrar]);

  return (
    <Dialogo abierto variante="lateral" titulo={titulo} descripcion={descripcion} alCerrar={solicitarCierre}>
      {confirmando && (
        <div className="sticky top-0 z-10 bg-white/85 px-6 py-4 backdrop-blur-md">
          <AvisoDescartarCambios alDescartar={alCerrar} alSeguirEditando={() => setConfirmando(false)} />
        </div>
      )}
      {children({ alCambiarSinGuardar: setSinGuardar, solicitarCierre })}
    </Dialogo>
  );
}
