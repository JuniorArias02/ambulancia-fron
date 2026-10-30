import { formatearPlaca } from '../utils/formato_ambulancia';

export function PlacaAmbulancia({ placa }: { placa: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-borde bg-white/80 px-2 py-0.5 text-[13px] font-semibold tracking-[0.08em] whitespace-nowrap text-texto tabular-nums">
      <span className="sr-only">Placa </span>
      {formatearPlaca(placa)}
    </span>
  );
}
