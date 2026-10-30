const PATRON_COLOR = /^#[0-9a-f]{3,8}$/i;
const COLOR_RESPALDO = '#64748b';

export interface OpcionesCheckpoint {
  color: string;
  /** Esperando ambulancia: lleva aura para atraer la atención del operador. */
  pendiente: boolean;
  seleccionada: boolean;
  /** Hay una ambulancia en la escena o atendiendo: halo azul fijo. */
  ambulanciaEnLugar?: boolean;
  /** Todas sus ambulancias van con el paciente a bordo: ya no hay nadie en el sitio. */
  atenuada?: boolean;
}

/**
 * Checkpoint circular: anillo blanco, núcleo con el color de la prioridad y centro blanco.
 * Solo las pendientes llevan el aura animada (y nunca con movimiento reducido); las ya
 * despachadas quedan quietas y más pequeñas para que lo urgente resalte. Con una ambulancia en
 * el lugar llevan un halo azul fijo, y cuando ya recogieron al paciente se atenúan.
 */
export function htmlCheckpoint({
  color: colorPedido,
  pendiente,
  seleccionada,
  ambulanciaEnLugar = false,
  atenuada = false,
}: OpcionesCheckpoint): string {
  // Va dentro de un atributo `style`: solo se aceptan colores hexadecimales.
  const color = PATRON_COLOR.test(colorPedido) ? colorPedido : COLOR_RESPALDO;
  const tamano = seleccionada ? 'size-11' : pendiente ? 'size-9' : 'size-7';
  const aura = pendiente
    ? `<span aria-hidden="true" class="absolute inset-0 rounded-full opacity-30 motion-safe:animate-aura" style="background-color:${color}"></span>`
    : '';
  const halo = ambulanciaEnLugar
    ? '<span aria-hidden="true" class="absolute -inset-1 rounded-full border-2 border-primario/70 bg-primario/12"></span>'
    : '';
  const anillo = seleccionada ? 'ring-2 ring-institucional' : 'ring-1 ring-white';
  const atenuacion = atenuada && !seleccionada ? 'opacity-45' : '';
  return `<span class="absolute flex ${tamano} -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-[width,height,opacity] duration-200 ease-out ${atenuacion}">
    ${aura}${halo}
    <span class="nucleo-marcador relative flex size-[78%] items-center justify-center rounded-full bg-white shadow-vidrio-elevado ${anillo} transition-shadow duration-150">
      <span class="flex size-[62%] items-center justify-center rounded-full ${pendiente || seleccionada ? '' : 'opacity-80'}" style="background-color:${color}">
        <span class="size-[34%] rounded-full bg-white"></span>
      </span>
    </span>
  </span>`;
}
