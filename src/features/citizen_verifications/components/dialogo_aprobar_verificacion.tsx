import { BadgeCheck } from 'lucide-react';
import type { FormEvent } from 'react';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { Dialogo } from '../../../components/ui/dialogo';
import type { ErrorApi } from '../../../services/error_api';
import type { VerificacionDetalle } from '../types/verificacion.types';
import { agruparNumeroDocumento } from '../utils/formato_verificacion';

interface PropiedadesDialogoAprobarVerificacion {
  verificacion: VerificacionDetalle;
  enviando: boolean;
  error: ErrorApi | null;
  alConfirmar: () => void;
  alCerrar: () => void;
}

export function DialogoAprobarVerificacion({
  verificacion,
  enviando,
  error,
  alConfirmar,
  alCerrar,
}: PropiedadesDialogoAprobarVerificacion) {
  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    alConfirmar();
  };

  return (
    <Dialogo
      abierto
      titulo="Aprobar identidad"
      descripcion={`${verificacion.nombres} ${verificacion.apellidos}`}
      cerrable={!enviando}
      alCerrar={alCerrar}
    >
      <form onSubmit={enviar}>
        <div className="space-y-4 px-6 py-5">
          {error && <AlertaError error={error} />}
          <p className="text-[15px] font-medium text-texto">¿Confirmas que los datos coinciden con el documento?</p>
          <p className="rounded-xl bg-white/60 px-4 py-3 font-mono text-lg font-semibold text-texto tabular-nums">
            <span className="mr-2 font-sans text-sm text-texto-secundario">{verificacion.tipoDocumento}</span>
            {agruparNumeroDocumento(verificacion.numeroDocumento)}
          </p>
          <p className="text-[13px] text-texto-secundario">
            Desde ahora podrá reportar emergencias desde la app. Es una revisión documental interna: no certifica
            la identidad ante terceros.
          </p>
        </div>
        <PieFormulario
          textoEnviar="Aprobar"
          textoEnviando="Aprobando…"
          icono={BadgeCheck}
          tono="exito"
          enviando={enviando}
          alCancelar={alCerrar}
        />
      </form>
    </Dialogo>
  );
}
