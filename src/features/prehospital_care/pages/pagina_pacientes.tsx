import { LoaderCircle, Search, SearchX, UsersRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Paginacion } from '../../../components/data/paginacion';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { claseControlFiltro } from '../../../components/forms/selector_filtro';
import { EstadoError } from '../../../components/states/estado_error';
import { SinDato } from '../components/valor_o_dato';
import { ETIQUETAS_REGIMEN, ETIQUETAS_SEXO, LIMITE_POR_DEFECTO, REGIMENES } from '../constants/catalogos_clinicos';
import { useBusquedaPacientes } from '../hooks/use_historias';
import { useTextosBusqueda, type TextosPacientes } from '../providers/contexto_busqueda';
import type { PacienteIndice } from '../types/historia_clinica.types';
import { formatearFechaHora, nombrePaciente, textoEdad } from '../utils/formato_clinico';
import { rutaFichaPaciente } from '../utils/rutas_historias';

const regimen = (valor: string | null) => REGIMENES.find((opcion) => opcion === valor);

function Paciente({ paciente }: { paciente: PacienteIndice }) {
  const detalle = [textoEdad(paciente.edadAnios), paciente.sexo ? ETIQUETAS_SEXO[paciente.sexo] : null].filter(Boolean).join(' · ');
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-medium text-texto">
        {nombrePaciente({ identificado: true, nombres: paciente.nombres, apellidos: paciente.apellidos }) ?? <SinDato />}
      </p>
      {detalle && <p className="text-xs text-texto-secundario">{detalle}</p>}
    </div>
  );
}

function Buscador({ textos, alBuscar }: { textos: TextosPacientes; alBuscar: (textos: TextosPacientes) => void }) {
  const [borrador, setBorrador] = useState(textos);
  const buscar = (evento: FormEvent) => {
    evento.preventDefault();
    alBuscar({ documento: borrador.documento?.trim() || undefined, nombre: borrador.nombre?.trim() || undefined });
  };
  return (
    <form role="search" aria-label="Buscar pacientes" onSubmit={buscar} noValidate className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <label className="space-y-1.5">
        <span className="text-[13px] font-medium text-texto-secundario">Documento</span>
        <input
          type="search"
          value={borrador.documento ?? ''}
          maxLength={40}
          autoComplete="off"
          placeholder="Número exacto"
          title="Se ignoran puntos, guiones y espacios"
          onChange={(evento) => setBorrador((actual) => ({ ...actual, documento: evento.target.value }))}
          className={`${claseControlFiltro} w-full px-3 placeholder:text-texto-secundario/70`}
        />
      </label>
      <label className="space-y-1.5">
        <span className="text-[13px] font-medium text-texto-secundario">Nombre o apellido</span>
        <input
          type="search"
          value={borrador.nombre ?? ''}
          maxLength={100}
          autoComplete="off"
          placeholder="Ej.: carlos per"
          title="Mínimo 2 letras; cada palabra busca el inicio de un nombre o apellido"
          onChange={(evento) => setBorrador((actual) => ({ ...actual, nombre: evento.target.value }))}
          className={`${claseControlFiltro} w-full px-3 placeholder:text-texto-secundario/70`}
        />
      </label>
      <button
        type="submit"
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primario px-5 text-sm font-semibold text-white shadow-primario transition-colors duration-150 hover:bg-primario-hover focus-visible:ring-4 focus-visible:ring-primario/25 focus-visible:outline-none"
      >
        <Search aria-hidden strokeWidth={1.75} className="size-4" />
        Buscar
      </button>
    </form>
  );
}

/** Índice de pacientes: une las atenciones de una misma persona por su documento. */
export function PaginaPacientes() {
  const navegar = useNavigate();
  const [parametros, setParametros] = useSearchParams();
  const { textosPacientes, setTextosPacientes } = useTextosBusqueda();
  const paginaUrl = Number(parametros.get('pagina'));
  const pagina = Number.isInteger(paginaUrl) && paginaUrl >= 1 ? paginaUrl : 1;
  const busqueda = useBusquedaPacientes({ ...textosPacientes, pagina, limite: LIMITE_POR_DEFECTO });
  const resultado = busqueda.data;
  const actualizando = busqueda.isFetching && !busqueda.isPending;
  const errorDeFiltro = busqueda.error?.estado === 400;

  const buscar = (textos: TextosPacientes) => {
    setTextosPacientes(textos);
    setParametros({}, { replace: true });
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section aria-labelledby="titulo-pacientes" className="vidrio rounded-2xl">
        <header className="space-y-5 border-b border-borde/70 px-5 pt-5 pb-5">
          <div>
            <h2 id="titulo-pacientes" className="flex items-center gap-2.5 text-xl font-semibold tracking-tight text-texto">
              <UsersRound aria-hidden strokeWidth={1.75} className="size-5 text-primario" />
              Pacientes
            </h2>
            <p className="mt-0.5 flex items-center gap-2 text-sm text-texto-secundario">
              {resultado
                ? `${resultado.total} ${resultado.total === 1 ? 'paciente' : 'pacientes'}`
                : 'Todas las atenciones de cada persona, unidas por su documento.'}
              {actualizando && <LoaderCircle aria-label="Actualizando" className="size-3.5 animate-spin" />}
            </p>
            <p className="mt-1 text-xs text-texto-secundario">
              Los pacientes sin identificar (NN, AS o MS) no aparecen hasta que se registra su documento.
            </p>
          </div>
          <Buscador key={`${textosPacientes.documento ?? ''}|${textosPacientes.nombre ?? ''}`} textos={textosPacientes} alBuscar={buscar} />
          {errorDeFiltro && busqueda.error && <AlertaError error={busqueda.error} />}
        </header>

        {busqueda.isPending ? (
          <div role="status" className="space-y-3 px-5 py-5">
            <span className="sr-only">Buscando pacientes…</span>
            {Array.from({ length: 5 }, (_, indice) => (
              <div key={indice} className="h-11 animate-pulse rounded-xl bg-borde/35" />
            ))}
          </div>
        ) : busqueda.isError && !errorDeFiltro ? (
          <EstadoError titulo="No fue posible buscar pacientes" mensaje={busqueda.error.message} alReintentar={() => void busqueda.refetch()} />
        ) : !resultado || resultado.datos.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primario/8 text-primario">
              <SearchX aria-hidden strokeWidth={1.75} className="size-[22px]" />
            </span>
            <p className="text-base font-semibold text-texto">No hay pacientes con esa búsqueda</p>
            <p className="mt-1 max-w-sm text-sm text-texto-secundario">Revisa el documento o prueba con parte del nombre.</p>
          </div>
        ) : (
          <>
            <div className={`overflow-x-auto ${actualizando ? 'opacity-70' : ''}`}>
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b border-borde/80 text-xs tracking-wide text-texto-secundario uppercase">
                    <th scope="col" className="py-3 pr-3 pl-5 font-medium">Paciente</th>
                    <th scope="col" className="px-3 py-3 font-medium">Documento</th>
                    <th scope="col" className="px-3 py-3 font-medium">Atenciones</th>
                    <th scope="col" className="px-3 py-3 font-medium">Última atención</th>
                    <th scope="col" className="px-3 py-3 font-medium">EPS</th>
                    <th scope="col" className="py-3 pr-5 pl-3 font-medium">Régimen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borde/60">
                  {resultado.datos.map((paciente) => {
                    const valorRegimen = regimen(paciente.ultimoRegimen);
                    return (
                      <tr
                        key={paciente.id}
                        // Atajo del mouse; con teclado se entra por el enlace del documento.
                        onClick={() => void navegar(rutaFichaPaciente(paciente.id))}
                        className="cursor-pointer transition-colors duration-150 hover:bg-primario/5"
                      >
                        <td className="max-w-64 py-3 pr-3 pl-5">
                          <Paciente paciente={paciente} />
                        </td>
                        <td className="px-3 py-3 text-[13px] whitespace-nowrap tabular-nums">
                          <Link
                            to={rutaFichaPaciente(paciente.id)}
                            onClick={(evento) => evento.stopPropagation()}
                            className="font-medium text-primario hover:underline"
                          >
                            {paciente.tipoDocumento} {paciente.numeroDocumento}
                          </Link>
                        </td>
                        <td className="px-3 py-3 text-sm text-texto tabular-nums">{paciente.totalAtenciones}</td>
                        <td className="px-3 py-3 text-[13px] whitespace-nowrap text-texto tabular-nums">
                          {paciente.ultimaAtencion ? formatearFechaHora(paciente.ultimaAtencion) : <SinDato />}
                        </td>
                        <td className="max-w-48 truncate px-3 py-3 text-[13px] text-texto">{paciente.ultimaEps ?? <SinDato />}</td>
                        <td className="py-3 pr-5 pl-3 text-[13px] text-texto">
                          {valorRegimen ? ETIQUETAS_REGIMEN[valorRegimen] : (paciente.ultimoRegimen ?? <SinDato />)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="border-t border-borde/70 px-5 py-4">
              <Paginacion
                pagina={resultado.pagina}
                limite={resultado.limite}
                total={resultado.total}
                deshabilitada={busqueda.isFetching}
                alCambiarPagina={(nueva) => setParametros(nueva === 1 ? {} : { pagina: String(nueva) }, { replace: true })}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
