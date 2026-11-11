import { Gauge } from 'lucide-react';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { LONGITUDES_LISTA } from '../constants/listas_chequeo';
import { useMutarOpcion, useReordenar } from '../hooks/use_mutaciones_lista_chequeo';
import type { ListaChequeo } from '../types/lista_chequeo.types';
import { mejorOpcion, moverElemento, separarPorActividad } from '../utils/listas_chequeo';
import { FilaOpcion } from './fila_opcion';
import { FormularioAgregar } from './formulario_agregar';

export function SeccionOpciones({ lista }: { lista: ListaChequeo }) {
  const agregar = useMutarOpcion(lista.id);
  const reorden = useReordenar(lista.id, 'opciones');
  const { activos, inactivos } = separarPorActividad(lista.estados);
  const mejor = mejorOpcion(lista.estados);

  const mover = (indice: number, desplazamiento: -1 | 1) => {
    const ids = moverElemento(activos, inactivos, indice, desplazamiento);
    if (ids) reorden.mutate({ actuales: lista.estados, ids });
  };

  const error = agregar.error ?? reorden.error;

  return (
    <section aria-labelledby="titulo-opciones" className="vidrio-fuerte rounded-2xl">
      <header className="border-b border-borde/70 px-5 py-4">
        <div className="flex items-center gap-2">
          <Gauge aria-hidden strokeWidth={1.75} className="size-[18px] text-texto-secundario" />
          <h3 id="titulo-opciones" className="text-base font-semibold text-texto">
            Opciones de calificación
          </h3>
        </div>
        <p className="mt-1 text-[13px] text-texto-secundario">
          El puntaje es opcional: el mayor marca la mejor calificación, y las demás se resaltan como novedades en el
          historial.
        </p>
      </header>

      {error && (
        <div className="px-5 pt-4">
          <AlertaError error={error} />
        </div>
      )}

      <ol aria-label="Opciones activas" className="divide-y divide-borde/60">
        {activos.map((opcion, indice) => (
          <FilaOpcion
            key={opcion.id}
            listaId={lista.id}
            opcion={opcion}
            esMejor={opcion.id === mejor?.id}
            puedeSubir={indice > 0}
            puedeBajar={indice < activos.length - 1}
            ordenando={reorden.isPending}
            alMover={(desplazamiento) => mover(indice, desplazamiento)}
          />
        ))}
      </ol>

      {inactivos.length > 0 && (
        <>
          <p className="border-t border-borde/70 px-5 pt-4 pb-1 text-xs font-medium tracking-wide text-texto-secundario uppercase">
            Desactivadas
          </p>
          <ul aria-label="Opciones desactivadas" className="divide-y divide-borde/60">
            {inactivos.map((opcion) => (
              <FilaOpcion
                key={opcion.id}
                listaId={lista.id}
                opcion={opcion}
                esMejor={false}
                puedeSubir={false}
                puedeBajar={false}
                ordenando={reorden.isPending}
                alMover={() => undefined}
              />
            ))}
          </ul>
        </>
      )}

      <FormularioAgregar
        etiqueta="Nueva opción"
        placeholder="Nueva opción, p. ej. Malo"
        longitudMaxima={LONGITUDES_LISTA.opcion}
        enviando={agregar.isPending}
        alAgregar={(nombre) => {
          agregar.reset();
          return agregar.mutateAsync({ tipo: 'agregar', datos: { nombre } });
        }}
      />
    </section>
  );
}
