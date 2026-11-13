import { z } from 'zod';
import {
  CONTROLES_INSUMO,
  ESTADOS_EQUIPO,
  ESTADOS_REGISTRO,
  TIPOS_INSUMO,
  TIPOS_MANTENIMIENTO,
  TIPOS_REGISTRO,
} from '../constants/catalogos_inventario';
import {
  cantidad,
  diaObligatorio,
  diaOpcional,
  idObligatorio,
  opcionDe,
  textoObligatorio,
  textoOpcional,
} from './comunes.schema';

export const esquemaInsumo = z
  .object({
    codigo: textoObligatorio(50, 'Escribe el código.'),
    nombre: textoObligatorio(150, 'Escribe el nombre.'),
    tipo: opcionDe(TIPOS_INSUMO, 'Elige el tipo.'),
    categoria: textoOpcional(100),
    unidadMedida: textoObligatorio(30, 'Escribe la unidad de medida.'),
    marca: textoOpcional(100),
    fabricante: textoOpcional(150),
    descripcion: textoOpcional(5000),
    /** Lote y serie no pueden ir juntos: se elige uno. */
    control: z.enum(CONTROLES_INSUMO),
    requiereVencimiento: z.boolean(),
    requiereRegistroSanitario: z.boolean(),
    esControlEspecial: z.boolean(),
    stockMinimo: cantidad(),
  })
  .superRefine(({ control, requiereVencimiento }, contexto) => {
    if (requiereVencimiento && control !== 'lote') {
      contexto.addIssue({
        code: 'custom',
        path: ['requiereVencimiento'],
        message: 'El vencimiento vive en el lote: elige el control por lote.',
      });
    }
  });

export type EntradaInsumo = z.input<typeof esquemaInsumo>;
export type FormularioInsumo = z.output<typeof esquemaInsumo>;

const URL_SOPORTE = /^https?:\/\/\S+$/i;

export const esquemaRegistro = z
  .object({
    insumoId: idObligatorio('Elige el insumo.'),
    numeroRegistro: textoObligatorio(100, 'Escribe el número de registro.'),
    tipoRegistro: opcionDe(TIPOS_REGISTRO, 'Elige el tipo de registro.'),
    fechaExpedicion: diaOpcional(),
    fechaVencimiento: diaOpcional(),
    titular: textoOpcional(150),
    documentoUrl: textoOpcional(500).refine((valor) => valor === null || URL_SOPORTE.test(valor), {
      message: 'Usa un enlace que empiece por http:// o https://.',
    }),
    estado: z.enum(ESTADOS_REGISTRO),
  })
  .superRefine(({ fechaExpedicion, fechaVencimiento }, contexto) => {
    if (fechaExpedicion && fechaVencimiento && fechaVencimiento < fechaExpedicion) {
      contexto.addIssue({ code: 'custom', path: ['fechaVencimiento'], message: 'Debe ser posterior a la expedición.' });
    }
  });

export type EntradaRegistro = z.input<typeof esquemaRegistro>;
export type FormularioRegistro = z.output<typeof esquemaRegistro>;

const camposLote = {
  fechaFabricacion: diaOpcional(),
  fechaVencimiento: diaOpcional(),
  fabricante: textoOpcional(150),
  proveedor: textoOpcional(150),
  documentoSoporte: textoOpcional(500),
  observaciones: textoOpcional(5000),
};

/** Lo que exige el insumo elegido; se conoce desde el catálogo. */
export interface ReglasInsumo {
  exigeVencimiento: boolean;
  exigeRegistro: boolean;
}

/**
 * Al crear, el insumo y el número son obligatorios, y el insumo decide si el vencimiento y el
 * registro sanitario lo son. Al editar solo se corrigen fechas y datos de soporte.
 */
export function esquemaLote(creando: boolean, reglas: (insumoId: string) => ReglasInsumo | undefined) {
  return z
    .object({
      insumoId: z.string(),
      registroSanitarioId: z.string().transform((valor) => (valor === '' ? null : valor)),
      numeroLote: z.string().trim().max(100, 'Máximo 100 caracteres.'),
      ...camposLote,
    })
    .superRefine((datos, contexto) => {
      const { fechaFabricacion, fechaVencimiento } = datos;
      if (fechaFabricacion && fechaVencimiento && fechaVencimiento <= fechaFabricacion) {
        contexto.addIssue({ code: 'custom', path: ['fechaVencimiento'], message: 'Debe ser posterior a la fabricación.' });
      }
      const exigencias = reglas(datos.insumoId);
      if (exigencias?.exigeVencimiento && !fechaVencimiento) {
        contexto.addIssue({ code: 'custom', path: ['fechaVencimiento'], message: 'Este insumo exige fecha de vencimiento.' });
      }
      if (!creando) return;
      if (!datos.insumoId) contexto.addIssue({ code: 'custom', path: ['insumoId'], message: 'Elige el insumo.' });
      if (!datos.numeroLote) contexto.addIssue({ code: 'custom', path: ['numeroLote'], message: 'Escribe el número de lote.' });
      if (exigencias?.exigeRegistro && !datos.registroSanitarioId) {
        contexto.addIssue({ code: 'custom', path: ['registroSanitarioId'], message: 'Este insumo exige un registro sanitario vigente.' });
      }
    });
}

export type EntradaLote = z.input<ReturnType<typeof esquemaLote>>;
export type FormularioLote = z.output<ReturnType<typeof esquemaLote>>;

export function esquemaEquipo(creando: boolean, reglas: (insumoId: string) => ReglasInsumo | undefined) {
  return z
    .object({
      insumoId: z.string(),
      registroSanitarioId: z.string().transform((valor) => (valor === '' ? null : valor)),
      numeroSerie: z.string().trim().max(100, 'Máximo 100 caracteres.'),
      marca: textoOpcional(100),
      modelo: textoOpcional(100),
      fechaAdquisicion: diaOpcional(),
      fechaProximoMantenimiento: diaOpcional(),
      observaciones: textoOpcional(5000),
    })
    .superRefine((datos, contexto) => {
      if (!creando) return;
      if (!datos.insumoId) contexto.addIssue({ code: 'custom', path: ['insumoId'], message: 'Elige el insumo.' });
      if (!datos.numeroSerie) contexto.addIssue({ code: 'custom', path: ['numeroSerie'], message: 'Escribe el número de serie.' });
      if (reglas(datos.insumoId)?.exigeRegistro && !datos.registroSanitarioId) {
        contexto.addIssue({ code: 'custom', path: ['registroSanitarioId'], message: 'Este insumo exige un registro sanitario vigente.' });
      }
    });
}

export type EntradaEquipo = z.input<ReturnType<typeof esquemaEquipo>>;
export type FormularioEquipo = z.output<ReturnType<typeof esquemaEquipo>>;

export const esquemaEstadoEquipo = z.object({
  estado: z.enum(ESTADOS_EQUIPO),
  motivo: textoOpcional(150),
});

export type EntradaEstadoEquipo = z.input<typeof esquemaEstadoEquipo>;
export type FormularioEstadoEquipo = z.output<typeof esquemaEstadoEquipo>;

export function esquemaMantenimiento(hoy: string) {
  return z
    .object({
      tipo: z.enum(TIPOS_MANTENIMIENTO),
      fechaMantenimiento: diaObligatorio('Elige la fecha del mantenimiento.').refine(
        (valor) => valor <= hoy,
        'No puede ser una fecha futura.',
      ),
      fechaProximo: diaOpcional(),
      responsable: textoOpcional(150),
      proveedor: textoOpcional(150),
      documentoSoporte: textoOpcional(500),
      resultado: textoOpcional(50),
      observaciones: textoOpcional(5000),
    })
    .superRefine(({ fechaMantenimiento, fechaProximo }, contexto) => {
      if (fechaProximo && fechaProximo <= fechaMantenimiento) {
        contexto.addIssue({ code: 'custom', path: ['fechaProximo'], message: 'Debe ser posterior al mantenimiento.' });
      }
    });
}

export type EntradaMantenimiento = z.input<ReturnType<typeof esquemaMantenimiento>>;
export type FormularioMantenimiento = z.output<ReturnType<typeof esquemaMantenimiento>>;
