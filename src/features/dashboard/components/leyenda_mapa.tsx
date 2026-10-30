import { Ambulance } from 'lucide-react';
import { useTiempoReal } from '../../realtime/hooks/use_tiempo_real';

function IconoAmbulancia({ clases }: { clases: string }) {
  return (
    <span aria-hidden className={`flex size-4.5 items-center justify-center rounded-md text-white ring-1 ring-white ${clases}`}>
      <Ambulance strokeWidth={2.25} className="size-3" />
    </span>
  );
}

/** Explica las formas y colores del mapa: el estado nunca depende solo del color. */
export function LeyendaMapa() {
  const { estado } = useTiempoReal();
  return (
    <div className="vidrio-fuerte flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl px-3 py-2 text-xs text-texto-secundario">
      <span className="flex items-center gap-1.5">
        <span aria-hidden className="relative flex size-4 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-critico opacity-30" />
          <span className="relative flex size-3 items-center justify-center rounded-full bg-white shadow-vidrio">
            <span className="flex size-2 items-center justify-center rounded-full bg-critico">
              <span className="size-0.5 rounded-full bg-white" />
            </span>
          </span>
        </span>
        Emergencia esperando ambulancia (aura; color = prioridad)
      </span>
      <span className="flex items-center gap-1.5">
        <span aria-hidden className="flex size-2.5 items-center justify-center rounded-full bg-white shadow-vidrio">
          <span className="size-1.5 rounded-full bg-critico opacity-80" />
        </span>
        Ya despachada
      </span>
      <span className="flex items-center gap-1.5">
        <span aria-hidden className="flex size-3.5 items-center justify-center rounded-full border-2 border-primario/70 bg-primario/12">
          <span className="size-1.5 rounded-full bg-critico" />
        </span>
        Ambulancia en el lugar
      </span>
      <span className="flex items-center gap-1.5">
        <span aria-hidden className="flex size-2.5 items-center justify-center rounded-full bg-white opacity-45 shadow-vidrio">
          <span className="size-1.5 rounded-full bg-critico" />
        </span>
        Paciente recogido
      </span>
      <span className="flex items-center gap-1.5">
        <IconoAmbulancia clases="bg-exito" />
        Ambulancia (color = estado)
      </span>
      <span className="flex items-center gap-1.5">
        <IconoAmbulancia clases="bg-cian-texto" />
        Paciente a bordo
      </span>
      <span className="flex items-center gap-1.5">
        <IconoAmbulancia clases="bg-primario opacity-65" />
        Posición de 2 a 10 min
      </span>
      <span className="flex items-center gap-1.5">
        <IconoAmbulancia clases="bg-texto-secundario/80 outline-1 outline-offset-1 outline-texto-secundario outline-dashed" />
        Sin señal (+10 min)
      </span>
      <span className="flex items-center gap-1.5">
        <span aria-hidden className="h-1 w-5 rounded-full bg-primario ring-2 ring-white" />
        Ruta hacia la emergencia
      </span>
      <span className="flex items-center gap-1.5">
        <span aria-hidden className="h-1 w-5 rounded-full bg-[#94a3b8] ring-2 ring-white" />
        Tramo ya recorrido
      </span>
      <span>{estado === 'en_linea' ? 'En vivo' : 'Se actualiza cada 15 s'}</span>
    </div>
  );
}
