import { CircleHelp } from 'lucide-react';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { LONGITUDES_LISTA } from '../constants/listas_chequeo';
import { useMutarPregunta, useReordenar } from '../hooks/use_mutaciones_lista_chequeo';
import type { ListaChequeo } from '../types/lista_chequeo.types';
import { moverElemento, separarPorActividad } from '../utils/listas_chequeo';
import { FilaPregunta } from './fila_pregunta';
import { FormularioAgregar } from './formulario_agregar';

export function SeccionPreguntas({ lista }: { lista: ListaChequeo }) {
  const agregar = useMutarPregunta(lista.id);
  const reorden = useReordenar(lista.id, 'preguntas');
  const { activos, inactivos } = separarPorActividad(lista.items);

  const mover = (indice: number, desplazamiento: -1 | 1) => {
    const ids = moverElemento(activos, inactivos, indice, desplazamiento);
    if (ids) reorden.mutate({ actuales: lista.items, ids });
  };

  const error = agregar.error ?? reorden.error;

  return (
    <section aria-labelledby="titulo-preguntas" className="vidrio-fuerte rounded-2xl">
      <header className="flex items-center gap-2 border-b border-borde/70 px-5 py-4">
        <CircleHelp aria-hidden strokeWidth={1.75} className="size-[18px] text-texto-secundario" />
        <h3 id="titulo-preguntas" className="text-base font-semibold text-texto">
          Preguntas
        </h3>
        <span className="ml-auto text-[13px] text-texto-secundario">
          {activos.length} {activos.length === 1 ? 'activa' : 'activas'}
          {inactivos.length > 0 && ` · ${inactivos.length} desactivada${inactivos.length === 1 ? '' : 's'}`}
        </span>
      </header>

      {error && (
        <div className="px-5 pt-4">
          <AlertaError error={error} />
        </div>
      )}

      <ol aria-label="Preguntas activas" className="divide-y divide-borde/60">
        {activos.map((pregunta, indice) => (
          <FilaPregunta
            key={pregunta.id}
            listaId={lista.id}
            pregunta={pregunta}
            numero={indice + 1}
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
            Desactivadas · se conservan por el historial
          </p>
          <ul aria-label="Preguntas desactivadas" className="divide-y divide-borde/60">
            {inactivos.map((pregunta) => (
              <FilaPregunta
                key={pregunta.id}
                listaId={lista.id}
                pregunta={pregunta}
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
        etiqueta="Nueva pregunta"
        placeholder="Escribe una nueva pregunta"
        longitudMaxima={LONGITUDES_LISTA.pregunta}
        enviando={agregar.isPending}
        alAgregar={(pregunta) => {
          agregar.reset();
          return agregar.mutateAsync({ tipo: 'agregar', datos: { pregunta } });
        }}
      />
    </section>
  );
}
