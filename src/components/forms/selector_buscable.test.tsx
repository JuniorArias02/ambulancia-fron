import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { filtrarOpciones, type OpcionBuscable } from '../../utils/opciones_buscables';
import { SelectorBuscable } from './selector_buscable';

const OPCIONES: OpcionBuscable[] = [
  { valor: 'gasa', texto: 'Gasa estéril', detalle: 'GAS-01 · unidad' },
  { valor: 'guantes', texto: 'Guantes de nitrilo', detalle: 'GUA-02 · par', deshabilitada: true },
  { valor: 'adrenalina', texto: 'Adrenalina 1 mg/ml', detalle: 'MED-0001 · ampolla' },
];

function Selector({ alCambiar = vi.fn(), opciones = OPCIONES }: { alCambiar?: (valor: string) => void; opciones?: OpcionBuscable[] }) {
  const [valor, setValor] = useState('');
  return (
    <div className="relative">
      <SelectorBuscable
        etiqueta="Insumo"
        opciones={opciones}
        valor={valor}
        alCambiar={(nuevo) => {
          setValor(nuevo);
          alCambiar(nuevo);
        }}
        placeholder="Busca el insumo"
        claseEntrada=""
      />
    </div>
  );
}

describe('filtrarOpciones', () => {
  it('busca sin tildes, por palabras y también en el detalle', () => {
    expect(filtrarOpciones(OPCIONES, 'ESTERIL').map(({ valor }) => valor)).toEqual(['gasa']);
    expect(filtrarOpciones(OPCIONES, 'mg adren').map(({ valor }) => valor)).toEqual(['adrenalina']);
    expect(filtrarOpciones(OPCIONES, 'med-0001').map(({ valor }) => valor)).toEqual(['adrenalina']);
    expect(filtrarOpciones(OPCIONES, '   ')).toHaveLength(3);
  });
});

describe('SelectorBuscable', () => {
  it('filtra al escribir y elige con un clic', async () => {
    const alCambiar = vi.fn();
    render(<Selector alCambiar={alCambiar} />);
    const campo = screen.getByRole('combobox', { name: 'Insumo' });

    await userEvent.type(campo, 'adre');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    await userEvent.click(screen.getByRole('option', { name: /Adrenalina/ }));

    expect(alCambiar).toHaveBeenCalledWith('adrenalina');
    expect(campo).toHaveValue('Adrenalina 1 mg/ml');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('se recorre con las flechas, salta las deshabilitadas y elige con Enter', async () => {
    const alCambiar = vi.fn();
    render(<Selector alCambiar={alCambiar} />);
    await userEvent.click(screen.getByRole('combobox', { name: 'Insumo' }));

    // De «Gasa» pasa directo a «Adrenalina»: «Guantes» está deshabilitado.
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(alCambiar).toHaveBeenCalledWith('adrenalina');
  });

  it('Escape cierra la lista sin cambiar la elección', async () => {
    const alCambiar = vi.fn();
    render(<Selector alCambiar={alCambiar} />);
    const campo = screen.getByRole('combobox', { name: 'Insumo' });

    await userEvent.type(campo, 'gasa');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(campo).toHaveValue('');
    expect(alCambiar).not.toHaveBeenCalled();
  });

  it('avisa cuando no hay resultados y cuando hay demasiados', async () => {
    const muchas = Array.from({ length: 75 }, (_, i) => ({ valor: `i${i}`, texto: `Insumo ${i}` }));
    render(<Selector opciones={muchas} />);
    const campo = screen.getByRole('combobox', { name: 'Insumo' });

    await userEvent.click(campo);
    expect(screen.getAllByRole('option')).toHaveLength(60);
    expect(screen.getByText('Hay 15 más: escribe para afinar la búsqueda.')).toBeInTheDocument();

    await userEvent.type(campo, 'zzz');
    expect(screen.getByText('Sin resultados para «zzz».')).toBeInTheDocument();
  });
});
