import { Maximize, Minimize } from 'lucide-react';

interface PropiedadesBotonPantallaCompleta {
  activa: boolean;
  alAlternar: () => void;
}

export function BotonPantallaCompleta({ activa, alAlternar }: PropiedadesBotonPantallaCompleta) {
  const etiqueta = activa ? 'Salir de pantalla completa' : 'Ver mapa en pantalla completa';
  const Icono = activa ? Minimize : Maximize;

  return (
    <button
      type="button"
      onClick={alAlternar}
      aria-label={etiqueta}
      title={etiqueta}
      className="vidrio-fuerte flex size-11 items-center justify-center rounded-xl text-texto-secundario transition-colors duration-150 hover:text-primario focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none"
    >
      <Icono aria-hidden strokeWidth={1.75} className="size-[18px]" />
    </button>
  );
}
