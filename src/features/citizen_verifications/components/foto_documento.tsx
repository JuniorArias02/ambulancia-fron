import { ImageOff, Maximize2, RotateCw } from 'lucide-react';
import { useState } from 'react';
import { ETIQUETAS_LADO } from '../constants/verificaciones';
import { useFotoDocumento } from '../hooks/use_foto_documento';
import type { DocumentoVerificacion, LadoDocumento } from '../types/verificacion.types';
import { VisorFoto } from './visor_foto';

interface PropiedadesFotoDocumento {
  usuarioId: string;
  lado: LadoDocumento;
  /** Sin valor, el ciudadano no ha enviado esa cara. */
  documento?: DocumentoVerificacion;
}

function Marco({ lado, children }: { lado: LadoDocumento; children: React.ReactNode }) {
  return (
    <figure className="min-w-0">
      <figcaption className="mb-2 text-sm font-medium text-texto">{ETIQUETAS_LADO[lado]}</figcaption>
      {/* Las fotos no se imprimen: son datos personales. */}
      <div className="relative flex aspect-[3/2] items-center justify-center overflow-hidden rounded-2xl border border-borde/80 bg-texto-secundario/6 print:hidden">
        {children}
      </div>
    </figure>
  );
}

function FotoCargada({ usuarioId, lado, documento }: Required<PropiedadesFotoDocumento>) {
  const foto = useFotoDocumento(usuarioId, documento.id);
  const [ampliada, setAmpliada] = useState(false);
  const titulo = ETIQUETAS_LADO[lado];

  if (foto.estado === 'cargando') {
    return (
      <Marco lado={lado}>
        <div role="status" aria-label={`Cargando ${titulo.toLowerCase()}`} className="size-full animate-pulse bg-texto-secundario/10" />
      </Marco>
    );
  }

  if (foto.estado === 'error') {
    return (
      <Marco lado={lado}>
        <div role="alert" className="flex flex-col items-center px-4 text-center">
          <ImageOff aria-hidden strokeWidth={1.75} className="mb-2 size-6 text-texto-secundario" />
          <p className="text-sm font-medium text-texto">No se pudo cargar la foto</p>
          <button
            type="button"
            onClick={foto.reintentar}
            className="campo-vidrio mt-3 inline-flex h-9 items-center gap-2 rounded-xl px-3 text-[13px] font-medium text-texto hover:bg-white"
          >
            <RotateCw aria-hidden strokeWidth={1.75} className="size-3.5" />
            Reintentar
          </button>
        </div>
      </Marco>
    );
  }

  return (
    <Marco lado={lado}>
      <button
        type="button"
        onClick={() => setAmpliada(true)}
        aria-label={`Ampliar ${titulo.toLowerCase()}`}
        className="group size-full cursor-zoom-in focus-visible:ring-4 focus-visible:ring-primario/30 focus-visible:outline-none focus-visible:ring-inset"
      >
        <img
          src={foto.url}
          alt={titulo}
          draggable={false}
          onContextMenu={(evento) => evento.preventDefault()}
          className="size-full object-contain select-none"
        />
        <span className="absolute right-2.5 bottom-2.5 inline-flex items-center gap-1.5 rounded-lg bg-institucional/70 px-2.5 py-1.5 text-xs font-medium text-white opacity-90 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <Maximize2 aria-hidden strokeWidth={1.75} className="size-3.5" />
          Ampliar
        </span>
      </button>
      {ampliada && <VisorFoto url={foto.url} titulo={titulo} alCerrar={() => setAmpliada(false)} />}
    </Marco>
  );
}

export function FotoDocumento({ usuarioId, lado, documento }: PropiedadesFotoDocumento) {
  if (!documento) {
    return (
      <Marco lado={lado}>
        <p className="flex flex-col items-center px-4 text-center text-sm text-texto-secundario">
          <ImageOff aria-hidden strokeWidth={1.75} className="mb-2 size-6" />
          El ciudadano no ha enviado esta foto.
        </p>
      </Marco>
    );
  }
  // La clave reinicia la descarga si llega una foto nueva para el mismo lado.
  return <FotoCargada key={documento.id} usuarioId={usuarioId} lado={lado} documento={documento} />;
}
