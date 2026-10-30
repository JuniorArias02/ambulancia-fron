import { ArrowUpRight, Copy } from 'lucide-react';
import { generatePath, Link } from 'react-router';
import { RUTAS } from '../../../constants/rutas';
import { useEmergencia } from '../hooks/use_emergencias';

/** La emergencia es una llamada repetida: se enlaza a la que sí se atiende. */
export function AvisoDuplicada({ emergenciaPrincipalId }: { emergenciaPrincipalId: string }) {
  const principal = useEmergencia(emergenciaPrincipalId);
  const referencia = principal.data?.numeroEmergencia ?? 'la emergencia principal';

  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-texto-secundario/8 px-4 py-3 text-[13px] text-texto">
      <Copy aria-hidden strokeWidth={1.75} className="size-4 shrink-0 text-texto-secundario" />
      <span className="flex-1">Esta llamada se marcó como duplicada de {referencia}.</span>
      <Link
        to={generatePath(RUTAS.detalleEmergencia, { id: emergenciaPrincipalId })}
        className="inline-flex items-center gap-1 font-medium text-primario hover:underline"
      >
        Ver principal
        <ArrowUpRight aria-hidden strokeWidth={1.75} className="size-3.5" />
      </Link>
    </p>
  );
}
