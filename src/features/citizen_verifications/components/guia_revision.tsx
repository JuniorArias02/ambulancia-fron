import { ListChecks } from 'lucide-react';

const PASOS = [
  {
    titulo: 'El número escrito coincide con el de la foto.',
    detalle: 'Se guarda sin puntos ni espacios: compara solo los dígitos.',
  },
  { titulo: 'El nombre y la fecha de nacimiento coinciden.' },
  {
    titulo: 'Las dos fotos son del mismo documento.',
    detalle: 'Legibles y completas, sin recortes ni reflejos que tapen los datos.',
  },
  {
    titulo: 'Ante cualquier duda, pide corrección.',
    detalle: 'El rechazo es definitivo; la corrección le permite reenviar.',
  },
];

/** Qué comparar al revisar una solicitud. Aprobar es una revisión interna, no certifica la identidad. */
export function GuiaRevision() {
  return (
    <section aria-labelledby="titulo-guia" className="vidrio rounded-2xl px-5 py-4">
      <h3 id="titulo-guia" className="flex items-center gap-2 text-sm font-semibold text-texto">
        <ListChecks aria-hidden strokeWidth={1.75} className="size-4 text-primario" />
        Qué comparar
      </h3>
      <ol className="mt-3 space-y-2.5">
        {PASOS.map(({ titulo, detalle }, indice) => (
          <li key={titulo} className="flex gap-3 text-[13px]">
            <span
              aria-hidden
              className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primario/10 text-[11px] font-semibold text-primario"
            >
              {indice + 1}
            </span>
            <span>
              <span className="font-medium text-texto">{titulo}</span>
              {detalle && <span className="block text-texto-secundario">{detalle}</span>}
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-3 border-t border-borde/70 pt-3 text-xs text-texto-secundario">
        Aprobar es una revisión documental interna: no certifica la identidad ante terceros.
      </p>
    </section>
  );
}
