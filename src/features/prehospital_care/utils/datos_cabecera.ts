import { ETIQUETAS_REGIMEN, ETIQUETAS_SEXO } from '../constants/catalogos_clinicos';
import type { DetalleHistoria, PacienteIndice, RegimenAfiliacion, Sexo } from '../types/historia_clinica.types';
import { edadAlAtender, nombrePaciente, textoDocumento, textoEdad } from './formato_clinico';

/** Lo que muestra la cabecera, venga de una historia o del índice de pacientes. */
export interface DatosCabecera {
  /** `null` es un NN. */
  nombre: string | null;
  identificacion: string[];
  afiliacion: string[];
}

const esRegimen = (valor: string | null): valor is RegimenAfiliacion =>
  valor === 'contributivo' || valor === 'subsidiado' || valor === 'especial_excepcion' || valor === 'no_afiliado';

function armar(documento: string | null, edad: string | null, sexo: Sexo | null, eps: string | null, regimen: string | null) {
  return {
    identificacion: [documento, edad, sexo ? ETIQUETAS_SEXO[sexo] : null].filter((parte): parte is string => Boolean(parte)),
    afiliacion: [eps, esRegimen(regimen) ? ETIQUETAS_REGIMEN[regimen] : regimen].filter((parte): parte is string => Boolean(parte)),
  };
}

export function cabeceraDeHistoria({ datos, abiertaEn }: DetalleHistoria): DatosCabecera {
  const exacta = edadAlAtender(datos.fechaNacimiento, abiertaEn);
  const edad =
    exacta !== null ? textoEdad(exacta) : datos.edadAproximada !== null ? `${textoEdad(datos.edadAproximada) ?? ''} (aprox.)` : null;
  return {
    nombre: nombrePaciente({ identificado: datos.pacienteIdentificado, nombres: datos.nombres, apellidos: datos.apellidos }),
    ...armar(textoDocumento(datos.tipoDocumento, datos.numeroDocumento), edad, datos.sexo, datos.aseguradoraEps, datos.regimenAfiliacion),
  };
}

/** El índice muestra los datos más recientes del paciente. */
export function cabeceraDePaciente(paciente: PacienteIndice): DatosCabecera {
  return {
    nombre: nombrePaciente({ identificado: true, nombres: paciente.nombres, apellidos: paciente.apellidos }),
    ...armar(
      textoDocumento(paciente.tipoDocumento, paciente.numeroDocumento),
      textoEdad(paciente.edadAnios),
      paciente.sexo,
      paciente.ultimaEps,
      paciente.ultimoRegimen,
    ),
  };
}
