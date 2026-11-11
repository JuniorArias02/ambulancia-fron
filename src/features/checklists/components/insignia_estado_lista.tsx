import { CircleCheck, CircleSlash } from 'lucide-react';

export function InsigniaEstadoLista({ activa }: { activa: boolean }) {
  const Icono = activa ? CircleCheck : CircleSlash;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
        activa ? 'bg-exito/10 text-exito' : 'bg-texto-secundario/10 text-texto-secundario'
      }`}
    >
      <Icono aria-hidden strokeWidth={2} className="size-3.5" />
      {activa ? 'Activa' : 'Inactiva'}
    </span>
  );
}
