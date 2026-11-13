import { ArrowRight, CalendarClock, FileBadge, Package, PackageMinus, PackageX, SearchCheck, Undo2, Wrench } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { EstadoError } from '../../../components/states/estado_error';
import { SelectorSegmentado } from '../../../components/ui/selector_segmentado';
import { RUTAS } from '../../../constants/rutas';
import { Insignia } from '../components/insignia';
import { PanelAlerta } from '../components/panel_alerta';
import { SeccionInventario } from '../components/seccion_inventario';
import { ETIQUETAS_ESTADO_EQUIPO, INTERVALO_RESUMEN_MS } from '../constants/catalogos_inventario';
import { TONO_ESTADO_EQUIPO } from '../constants/estilos_inventario';
import { useAlertas, useMovimientos, useVerificacionesInventario } from '../hooks/use_consultas_inventario';
import { useParametrosUrl } from '../hooks/use_parametros_url';
import { deCatalogo, diaDeHoy, diasHasta, formatearCantidad, formatearDia, textoPlazo } from '../utils/formato_inventario';

const PLAZOS = ['7', '30', '90'] as const;
type Plazo = (typeof PLAZOS)[number];

const OPCIONES_PLAZO = [
  { valor: '7', texto: '7 días', icono: CalendarClock },
  { valor: '30', texto: '30 días', icono: CalendarClock },
  { valor: '90', texto: '90 días', icono: CalendarClock },
] as const;

const VENCE = { futuro: 'vence', pasado: 'venció', hoy: 'vence hoy' };
const MANTENIMIENTO = { futuro: 'toca', pasado: 'atrasado', hoy: 'toca hoy' };

function Plazo({ dia, hoy, verbos }: { dia: string; hoy: string; verbos: typeof VENCE }) {
  const vencido = diasHasta(dia, hoy) < 0;
  return (
    <span className={`text-[13px] whitespace-nowrap ${vencido ? 'font-semibold text-critico' : 'text-texto-secundario'}`}>
      {textoPlazo(dia, hoy, verbos)}
    </span>
  );
}

function Bandeja({ icono: Icono, titulo, total, ruta, cargando }: { icono: typeof Undo2; titulo: string; total: number | undefined; ruta: string; cargando: boolean }) {
  const pendientes = (total ?? 0) > 0;
  return (
    <Link
      to={ruta}
      className="vidrio group flex items-center gap-3 rounded-2xl px-5 py-4 transition-shadow duration-150 hover:shadow-vidrio-elevado focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none"
    >
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${pendientes ? 'bg-primario/10 text-primario' : 'bg-texto-secundario/8 text-texto-secundario'}`}>
        <Icono aria-hidden strokeWidth={1.75} className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-texto">{titulo}</span>
        <span className="block text-[13px] text-texto-secundario">{pendientes ? 'Requieren tu revisión' : 'Nada pendiente'}</span>
      </span>
      <span className="text-2xl font-semibold text-texto tabular-nums">{cargando ? '…' : (total ?? '—')}</span>
      <ArrowRight aria-hidden strokeWidth={1.75} className="size-4 text-texto-secundario transition-transform duration-150 group-hover:translate-x-0.5" />
    </Link>
  );
}

export function PaginaResumenInventario() {
  const { leer, actualizar } = useParametrosUrl();
  const plazo = deCatalogo(PLAZOS, leer('dias')) ?? '30';
  const dias = Number(plazo);
  const [hoy] = useState(() => diaDeHoy());
  const alertas = useAlertas(dias);
  const devoluciones = useMovimientos({ tipo: 'devolucion', estado: 'borrador', pagina: 1, limite: 1 }, INTERVALO_RESUMEN_MS);
  const novedades = useVerificacionesInventario({ revisada: false, pagina: 1, limite: 1 }, INTERVALO_RESUMEN_MS);

  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
      <SeccionInventario
        id="titulo-resumen-inventario"
        titulo="Inventario"
        icono={Package}
        descripcion={`Lo que necesita atención en los próximos ${dias} días, incluido lo que ya venció. Se actualiza cada minuto.`}
        actualizando={alertas.isFetching && !alertas.isPending}
        acciones={<SelectorSegmentado<Plazo> etiqueta="Plazo de las alertas" valor={plazo} opciones={OPCIONES_PLAZO} alCambiar={(nuevo) => actualizar({ dias: nuevo === '30' ? undefined : nuevo })} />}
      >
        <div className="grid gap-3 p-4 md:grid-cols-2">
          <Bandeja icono={Undo2} titulo="Devoluciones por recibir" total={devoluciones.data?.total} cargando={devoluciones.isPending} ruta={`${RUTAS.movimientos}?vista=devoluciones`} />
          <Bandeja icono={SearchCheck} titulo="Novedades por revisar" total={novedades.data?.total} cargando={novedades.isPending} ruta={RUTAS.verificacionesInventario} />
        </div>
      </SeccionInventario>

      {alertas.isPending ? (
        <div role="status" aria-label="Cargando alertas" className="grid animate-pulse gap-3 lg:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="vidrio h-64 rounded-2xl" />
          ))}
        </div>
      ) : alertas.isError ? (
        <div className="vidrio rounded-2xl">
          <EstadoError titulo="No fue posible cargar las alertas" mensaje={alertas.error.message} alReintentar={() => void alertas.refetch()} />
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          <PanelAlerta
            id="alerta-lotes"
            titulo="Lotes por vencer"
            icono={PackageX}
            elementos={alertas.data.lotesPorVencer}
            clave={(lote) => `${lote.loteId}-${lote.ubicacionId}`}
            textoVacio="Ningún lote con existencias vence en este plazo."
            enlace={{ texto: 'Ver existencias', ruta: RUTAS.existencias }}
            fila={(lote) => (
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-texto">{lote.insumoNombre}</p>
                  <p className="text-[13px] text-texto-secundario">
                    Lote {lote.numeroLote} · {lote.ubicacionNombre ?? 'Sin ubicación'} · {formatearCantidad(lote.cantidad)}
                  </p>
                </div>
                <div className="text-right">
                  <Plazo dia={lote.fechaVencimiento} hoy={hoy} verbos={VENCE} />
                  <p className="text-xs text-texto-secundario tabular-nums">{formatearDia(lote.fechaVencimiento)}</p>
                </div>
              </div>
            )}
          />
          <PanelAlerta
            id="alerta-minimos"
            titulo="Insumos bajo el mínimo"
            icono={PackageMinus}
            elementos={alertas.data.insumosBajoMinimo}
            clave={(insumo) => insumo.insumoId}
            textoVacio="Todas las bodegas están sobre su stock mínimo."
            enlace={{ texto: 'Registrar una entrada', ruta: RUTAS.movimientos }}
            fila={(insumo) => {
              const proporcion = insumo.stockMinimo > 0 ? Math.min(1, insumo.enBodegas / insumo.stockMinimo) : 0;
              return (
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-medium text-texto">{insumo.insumoNombre}</p>
                    <p className="shrink-0 text-[13px] text-texto-secundario tabular-nums">
                      <span className="font-semibold text-critico">{formatearCantidad(insumo.enBodegas)}</span> de {formatearCantidad(insumo.stockMinimo)} {insumo.unidadMedida}
                    </p>
                  </div>
                  <div
                    role="meter"
                    aria-label={`${insumo.insumoNombre} frente a su mínimo`}
                    aria-valuemin={0}
                    aria-valuemax={insumo.stockMinimo}
                    aria-valuenow={insumo.enBodegas}
                    className="h-1.5 overflow-hidden rounded-full bg-texto-secundario/12"
                  >
                    <div className="h-full rounded-full bg-critico" style={{ width: `${proporcion * 100}%` }} />
                  </div>
                </div>
              );
            }}
          />
          <PanelAlerta
            id="alerta-equipos"
            titulo="Equipos por mantenimiento"
            icono={Wrench}
            elementos={alertas.data.equiposPorMantenimiento}
            clave={(equipo) => equipo.equipoId}
            textoVacio="Ningún equipo tiene mantenimiento en este plazo."
            enlace={{ texto: 'Ver equipos', ruta: `${RUTAS.catalogoInventario}?vista=equipos` }}
            fila={(equipo) => (
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-texto">{equipo.insumoNombre}</p>
                  <p className="flex flex-wrap items-center gap-2 text-[13px] text-texto-secundario">
                    Serie {equipo.numeroSerie}
                    {equipo.estado !== 'operativo' && <Insignia tono={TONO_ESTADO_EQUIPO[equipo.estado]}>{ETIQUETAS_ESTADO_EQUIPO[equipo.estado]}</Insignia>}
                  </p>
                </div>
                <div className="text-right">
                  <Plazo dia={equipo.fechaProximoMantenimiento} hoy={hoy} verbos={MANTENIMIENTO} />
                  <p className="text-xs text-texto-secundario tabular-nums">{formatearDia(equipo.fechaProximoMantenimiento)}</p>
                </div>
              </div>
            )}
          />
          <PanelAlerta
            id="alerta-registros"
            titulo="Registros sanitarios por vencer"
            icono={FileBadge}
            elementos={alertas.data.registrosPorVencer}
            clave={(registro) => registro.registroId}
            textoVacio="Ningún registro vigente vence en este plazo."
            enlace={{ texto: 'Ver registros', ruta: `${RUTAS.catalogoInventario}?vista=registros` }}
            fila={(registro) => (
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-texto">{registro.numeroRegistro}</p>
                  <p className="truncate text-[13px] text-texto-secundario">{registro.insumoNombre}</p>
                </div>
                <div className="text-right">
                  <Plazo dia={registro.fechaVencimiento} hoy={hoy} verbos={VENCE} />
                  <p className="text-xs text-texto-secundario tabular-nums">{formatearDia(registro.fechaVencimiento)}</p>
                </div>
              </div>
            )}
          />
        </div>
      )}
    </div>
  );
}
