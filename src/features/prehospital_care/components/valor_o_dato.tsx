import type { ReactNode } from 'react';
import { tieneDato } from '../utils/formato_clinico';

/** Nunca se deja un campo en blanco: lo vacío se lee como "Sin dato". */
export function SinDato() {
  return <span className="text-texto-secundario">Sin dato</span>;
}

interface PropiedadesValorODato {
  valor: string | number | null | undefined;
  /** Cómo mostrar el valor cuando existe; por defecto, el valor tal cual. */
  children?: ReactNode;
}

export function ValorODato({ valor, children }: PropiedadesValorODato) {
  if (!tieneDato(valor)) return <SinDato />;
  return <>{children ?? valor}</>;
}

interface PropiedadesDato {
  etiqueta: string;
  valor: string | number | null | undefined;
  children?: ReactNode;
  /** Ocupa las dos columnas de la ficha (textos largos). */
  ancho?: boolean;
}

/** Par etiqueta y valor de una ficha (`<dl>`). */
export function Dato({ etiqueta, valor, children, ancho = false }: PropiedadesDato) {
  return (
    <div className={ancho ? 'sm:col-span-2' : undefined}>
      <dt className="text-[13px] text-texto-secundario">{etiqueta}</dt>
      <dd className="mt-0.5 text-sm break-words whitespace-pre-line text-texto">
        <ValorODato valor={valor}>{children}</ValorODato>
      </dd>
    </div>
  );
}

/** Ficha de dos columnas con pares etiqueta y valor. */
export function Ficha({ children }: { children: ReactNode }) {
  return <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">{children}</dl>;
}

/** Bloque titulado de una pestaña: un divisor y el título, sin convertir todo en tarjeta. */
export function Bloque({ titulo, children, accion }: { titulo: string; children: ReactNode; accion?: ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3 border-b border-borde/70 pb-2">
        <h3 className="text-sm font-semibold text-texto">{titulo}</h3>
        {accion}
      </div>
      {children}
    </section>
  );
}
