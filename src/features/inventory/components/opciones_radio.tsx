import { CircleCheck } from 'lucide-react';

interface Opcion<T extends string> {
  valor: T;
  titulo: string;
  descripcion: string;
}

interface PropiedadesOpcionesRadio<T extends string> {
  nombre: string;
  leyenda: string;
  valor: T;
  opciones: readonly Opcion<T>[];
  deshabilitado?: boolean;
  alCambiar: (valor: T) => void;
}

/** Opciones excluyentes con título y descripción. */
export function OpcionesRadio<T extends string>({
  nombre,
  leyenda,
  valor,
  opciones,
  deshabilitado = false,
  alCambiar,
}: PropiedadesOpcionesRadio<T>) {
  return (
    <fieldset disabled={deshabilitado} className="space-y-2">
      <legend className="mb-2 text-sm font-medium text-texto">{leyenda}</legend>
      {opciones.map((opcion) => {
        const marcada = opcion.valor === valor;
        return (
          <label
            key={opcion.valor}
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition-colors duration-150 has-focus-visible:ring-2 has-focus-visible:ring-primario/40 has-disabled:cursor-not-allowed has-disabled:opacity-60 ${
              marcada ? 'border-primario/40 bg-primario/6' : 'border-borde/80 bg-white/50 hover:bg-white'
            }`}
          >
            <input
              type="radio"
              name={nombre}
              value={opcion.valor}
              checked={marcada}
              onChange={() => alCambiar(opcion.valor)}
              className="sr-only"
            />
            <CircleCheck
              aria-hidden
              strokeWidth={1.75}
              className={`mt-0.5 size-[18px] shrink-0 ${marcada ? 'text-primario' : 'text-borde'}`}
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-texto">{opcion.titulo}</span>
              <span className="mt-0.5 block text-[13px] text-texto-secundario">{opcion.descripcion}</span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
