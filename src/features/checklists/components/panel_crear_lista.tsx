import { useCallback, useState } from 'react';
import { AvisoDescartarCambios } from '../../../components/feedback/aviso_descartar_cambios';
import { Dialogo } from '../../../components/ui/dialogo';
import type { ListaChequeo } from '../types/lista_chequeo.types';
import { FormularioCrearLista } from './formulario_crear_lista';

interface PropiedadesPanelCrearLista {
  alCrear: (lista: ListaChequeo) => void;
  alCerrar: () => void;
}

export function PanelCrearLista({ alCrear, alCerrar }: PropiedadesPanelCrearLista) {
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
      titulo="Nueva lista de chequeo"
      descripcion="Nace inactiva: actívala cuando esté lista para los conductores."
      alCerrar={solicitarCierre}
    >
      {confirmandoDescarte && (
        <div className="sticky top-0 z-10 bg-white/85 px-6 py-4 backdrop-blur-md">
          <AvisoDescartarCambios alDescartar={alCerrar} alSeguirEditando={() => setConfirmandoDescarte(false)} />
        </div>
      )}
      <FormularioCrearLista alCambiarSinGuardar={setSinGuardar} alCrear={alCrear} alCancelar={solicitarCierre} />
    </Dialogo>
  );
}
