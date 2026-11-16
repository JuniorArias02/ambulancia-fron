import { FileSignature, ImageOff, RotateCw } from 'lucide-react';
import { useImagenProtegida } from '../../../hooks/use_imagen_protegida';
import { obtenerImagenFirmaCierre } from '../services/historias.service';
import type { DetalleHistoria } from '../types/historia_clinica.types';
import { codigoVerificacion, formatearFechaHora } from '../utils/formato_clinico';
import { SinDato } from './valor_o_dato';

/** La imagen se descarga con el token al abrir la pestaña y se libera al salir. */
function ImagenFirmaCierre({ historiaId, firmante }: { historiaId: string; firmante: string }) {
  const imagen = useImagenProtegida(`cierre/${historiaId}`, (senal) => obtenerImagenFirmaCierre(historiaId, senal));
  return (
    <div className="flex h-40 w-full max-w-md items-center justify-center overflow-hidden rounded-xl border border-borde/80 bg-white">
      {imagen.estado === 'cargando' && (
        <div role="status" className="size-full animate-pulse bg-borde/30">
          <span className="sr-only">Cargando firma…</span>
        </div>
      )}
      {imagen.estado === 'error' && (
        <div role="alert" className="flex flex-col items-center gap-2 px-4 text-center">
          <ImageOff aria-hidden strokeWidth={1.75} className="size-5 text-texto-secundario" />
          <p className="text-[13px] text-texto-secundario">
            {imagen.error.estado === 404 ? 'La imagen de la firma no está disponible.' : imagen.error.message}
          </p>
          <button
            type="button"
            onClick={imagen.reintentar}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primario hover:text-primario-hover"
          >
            <RotateCw aria-hidden strokeWidth={1.75} className="size-3.5" />
            Reintentar
          </button>
        </div>
      )}
      {imagen.estado === 'lista' && (
        <img src={imagen.url} alt={`Firma de ${firmante}`} draggable={false} className="size-full object-contain p-3" />
      )}
    </div>
  );
}

/** Es la versión de la firma que se usó al cerrar, aunque el profesional la haya cambiado después. */
export function BloqueFirma({ historia }: { historia: DetalleHistoria }) {
  if (!historia.cerradaEn) {
    return (
      <p className="flex items-center gap-2 text-sm text-texto-secundario">
        <FileSignature aria-hidden strokeWidth={1.75} className="size-4" />
        La historia aún no está firmada: se firma al cerrarla desde la app.
      </p>
    );
  }
  const firmante = historia.cerradaPor?.nombreCompleto ?? 'Sin dato';
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {historia.firmaCierre ? (
        <ImagenFirmaCierre historiaId={historia.id} firmante={firmante} />
      ) : (
        <p className="max-w-md rounded-xl border border-dashed border-borde px-4 py-3 text-[13px] text-texto-secundario">
          Se cerró antes de que existieran las firmas registradas: no tiene imagen estampada.
        </p>
      )}
      <dl className="grid gap-3 text-sm">
        <div>
          <dt className="text-[13px] text-texto-secundario">Firmado electrónicamente por</dt>
          <dd className="font-medium text-texto">{firmante}</dd>
        </div>
        <div>
          <dt className="text-[13px] text-texto-secundario">Fecha y hora</dt>
          <dd className="text-texto tabular-nums">{formatearFechaHora(historia.cerradaEn)} (hora de Colombia)</dd>
        </div>
        <div>
          <dt className="text-[13px] text-texto-secundario">Método</dt>
          <dd className="text-texto">Reautenticación con credenciales personales</dd>
        </div>
        <div>
          <dt className="text-[13px] text-texto-secundario">Código de verificación</dt>
          <dd className="font-mono text-base font-semibold tracking-wider text-texto">
            {historia.hashCierre ? codigoVerificacion(historia.hashCierre) : <SinDato />}
          </dd>
        </div>
      </dl>
    </div>
  );
}
