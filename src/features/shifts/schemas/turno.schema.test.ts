import { describe, expect, it } from 'vitest';
import { esquemaTurno, type FormularioTurno } from './turno.schema';

const conductor = { funcion: 'conductor', usuarioId: 'u-conductor' } as const;
const paramedico = { funcion: 'paramedico', usuarioId: 'u-paramedico' } as const;
const valido: FormularioTurno = { ambulanciaId: 'amb-1', integrantes: [conductor, paramedico] };

function mensajes(datos: FormularioTurno): string[] {
  const resultado = esquemaTurno.safeParse(datos);
  return resultado.success ? [] : resultado.error.issues.map(({ message }) => message);
}

describe('esquemaTurno', () => {
  it('acepta un conductor y un paramédico', () => {
    expect(mensajes(valido)).toEqual([]);
  });

  it('acepta un médico como integrante asistencial', () => {
    expect(
      mensajes({ ...valido, integrantes: [conductor, { funcion: 'medico', usuarioId: 'u-medico' }] }),
    ).toEqual([]);
  });

  it('exige conductor y paramédico o médico', () => {
    expect(
      mensajes({
        ...valido,
        integrantes: [
          { funcion: 'paramedico', usuarioId: 'a' },
          { funcion: 'medico', usuarioId: 'b' },
        ],
      }),
    ).toContain('La tripulación necesita un conductor y al menos un paramédico o médico.');
  });

  it('no permite repetir a la misma persona', () => {
    expect(
      mensajes({
        ...valido,
        integrantes: [conductor, paramedico, { funcion: 'medico', usuarioId: 'u-paramedico' }],
      }),
    ).toContain('Esta persona ya está en la tripulación.');
  });

  it('admite entre 2 y 4 personas', () => {
    expect(mensajes({ ...valido, integrantes: [conductor] }).length).toBeGreaterThan(0);
    const cinco = ['a', 'b', 'c', 'd', 'e'].map((usuarioId, i) => ({
      funcion: i === 0 ? ('conductor' as const) : ('paramedico' as const),
      usuarioId,
    }));
    expect(mensajes({ ...valido, integrantes: cinco }).length).toBeGreaterThan(0);
  });
});
