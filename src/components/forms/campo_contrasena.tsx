import { Eye, EyeOff, LockKeyhole, TriangleAlert } from 'lucide-react';
import { useState, type ComponentProps, type KeyboardEvent } from 'react';
import { CampoFormulario } from './campo_formulario';
import { claseEntrada, claseEstadoEntrada, idsDescripcion } from './estilos_campo';

type PropiedadesEntrada = Omit<ComponentProps<'input'>, 'id' | 'type' | 'className'>;

interface PropiedadesCampoContrasena extends PropiedadesEntrada {
  id: string;
  etiqueta: string;
  error?: string;
  ayuda?: string;
}

/** Campo de contraseña con opción de mostrarla y aviso de Bloq Mayús. */
export function CampoContrasena({
  id,
  etiqueta,
  error,
  ayuda,
  onKeyDown,
  onKeyUp,
  ...propiedadesEntrada
}: PropiedadesCampoContrasena) {
  const [visible, setVisible] = useState(false);
  const [mayusculasActivas, setMayusculasActivas] = useState(false);
  const etiquetaVisibilidad = visible ? 'Ocultar contraseña' : 'Mostrar contraseña';

  const detectarMayusculas = (evento: KeyboardEvent<HTMLInputElement>) =>
    setMayusculasActivas(evento.getModifierState('CapsLock'));

  return (
    <CampoFormulario
      id={id}
      etiqueta={etiqueta}
      icono={LockKeyhole}
      error={error}
      ayuda={ayuda}
      aviso={
        mayusculasActivas && (
          <p role="status" className="flex items-center gap-1.5 text-[13px] text-advertencia">
            <TriangleAlert aria-hidden className="size-3.5" />
            Bloq Mayús está activado.
          </p>
        )
      }
    >
      <input
        {...propiedadesEntrada}
        id={id}
        type={visible ? 'text' : 'password'}
        aria-invalid={error ? true : undefined}
        aria-describedby={idsDescripcion(id, Boolean(error), Boolean(ayuda))}
        onKeyDown={(evento) => {
          detectarMayusculas(evento);
          onKeyDown?.(evento);
        }}
        onKeyUp={(evento) => {
          detectarMayusculas(evento);
          onKeyUp?.(evento);
        }}
        className={`${claseEntrada} pr-11 ${claseEstadoEntrada(Boolean(error))}`}
      />
      <button
        type="button"
        onClick={() => setVisible((actual) => !actual)}
        aria-label={etiquetaVisibilidad}
        title={etiquetaVisibilidad}
        className="absolute inset-y-1.5 right-1.5 flex w-9 items-center justify-center rounded-lg text-texto-secundario transition-colors duration-150 hover:bg-primario/8 hover:text-primario focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none"
      >
        {visible ? (
          <EyeOff aria-hidden strokeWidth={1.75} className="size-[18px]" />
        ) : (
          <Eye aria-hidden strokeWidth={1.75} className="size-[18px]" />
        )}
      </button>
    </CampoFormulario>
  );
}
