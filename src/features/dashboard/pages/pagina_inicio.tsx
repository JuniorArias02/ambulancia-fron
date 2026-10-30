import { useRef } from 'react';
import { useSesion } from '../../authentication/hooks/use_sesion';
import { BotonPantallaCompleta } from '../../map/components/boton_pantalla_completa';
import { MapaOperativo } from '../../map/components/mapa_operativo';
import { usePantallaCompleta } from '../../map/hooks/use_pantalla_completa';
import { CentroOperaciones } from '../components/centro_operaciones';

/** Página de lienzo: el mapa cubre toda la pantalla bajo el sidebar y la barra superior. */
export function PaginaInicio() {
  const contenedorRef = useRef<HTMLElement>(null);
  const pantallaCompleta = usePantallaCompleta(contenedorRef);
  const { usuario } = useSesion();
  // Emergencias y flota en vivo solo para quien despacha; la API responde 403 a los demás roles.
  const despacha = usuario?.rol === 'administrador' || usuario?.rol === 'despachador';

  return (
    <section
      ref={contenedorRef}
      aria-label="Mapa operativo"
      className="relative h-full bg-fondo pantalla-completa:[--lienzo-izquierda:16px] pantalla-completa:[--lienzo-superior:16px]"
    >
      {despacha ? <CentroOperaciones /> : <MapaOperativo />}

      {pantallaCompleta.soportada && (
        <div className="absolute top-(--lienzo-superior) right-4 z-1000 md:right-5">
          <BotonPantallaCompleta
            activa={pantallaCompleta.activa}
            alAlternar={() => void pantallaCompleta.alternar()}
          />
        </div>
      )}
    </section>
  );
}
