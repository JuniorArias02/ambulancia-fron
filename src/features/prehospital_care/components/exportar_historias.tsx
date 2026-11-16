import { FileSpreadsheet, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { Dialogo } from '../../../components/ui/dialogo';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { MAXIMO_EXPORTACION } from '../constants/catalogos_clinicos';
import { useExportarHistorias } from '../hooks/use_historias';
import type { FiltrosHistorias } from '../types/historia_clinica.types';

interface PropiedadesExportarHistorias {
  /** Los filtros de la búsqueda que se está viendo: se exporta exactamente eso. */
  filtros: FiltrosHistorias;
  /** `total` de esa búsqueda; sin valor aún no hay resultado. */
  total: number | undefined;
}

const formatoNumero = new Intl.NumberFormat('es-CO');

/** La operación más sensible del módulo: el archivo lleva datos de pacientes. */
export function ExportarHistorias({ filtros, total }: PropiedadesExportarHistorias) {
  const [confirmando, setConfirmando] = useState(false);
  const exportacion = useExportarHistorias();
  const { notificar } = useNotificaciones();
  const excede = total !== undefined && total > MAXIMO_EXPORTACION;
  const sinDatos = total === undefined || total === 0;
  const motivo = excede
    ? `Acota los filtros para exportar (máximo ${formatoNumero.format(MAXIMO_EXPORTACION)})`
    : sinDatos
      ? 'No hay historias para exportar'
      : undefined;

  const cerrar = () => {
    exportacion.reset();
    setConfirmando(false);
  };

  const exportar = () =>
    exportacion.mutate(filtros, {
      onSuccess: () => {
        notificar({ tono: 'exito', titulo: 'Archivo descargado', descripcion: 'Guárdalo en un lugar seguro.' });
        cerrar();
      },
    });

  return (
    <>
      <div className="flex flex-col items-start gap-1 sm:items-end">
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          disabled={excede || sinDatos}
          title={motivo}
          className="campo-vidrio inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-texto transition-colors duration-150 hover:bg-white hover:text-primario focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:text-texto"
        >
          <FileSpreadsheet aria-hidden strokeWidth={1.75} className="size-4" />
          Exportar a Excel
        </button>
        {excede && <p className="text-xs text-advertencia">{motivo}</p>}
      </div>

      {confirmando && total !== undefined && (
        <Dialogo
          abierto
          titulo="Exportar a Excel"
          descripcion={`Se exportarán ${formatoNumero.format(total)} ${total === 1 ? 'historia' : 'historias'} con los filtros activos.`}
          cerrable={!exportacion.isPending}
          alCerrar={cerrar}
        >
          <form
            onSubmit={(evento) => {
              evento.preventDefault();
              exportar();
            }}
          >
            <div className="space-y-4 px-6 py-5">
              {exportacion.error && <AlertaError error={exportacion.error} />}
              <p className="flex items-start gap-2.5 rounded-xl border border-advertencia/25 bg-advertencia/8 px-4 py-3 text-[13px] text-texto">
                <ShieldAlert aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-advertencia" />
                El archivo contiene datos personales y de salud. Guárdalo en un lugar seguro y no lo compartas por
                canales abiertos. La exportación queda registrada.
              </p>
              <p className="text-[13px] text-texto-secundario">
                Es un CSV para Excel en español (separado por punto y coma), con las fechas en hora de Colombia.
              </p>
            </div>
            <PieFormulario
              textoEnviar="Exportar"
              textoEnviando="Generando…"
              icono={FileSpreadsheet}
              enviando={exportacion.isPending}
              alCancelar={cerrar}
            />
          </form>
        </Dialogo>
      )}
    </>
  );
}
