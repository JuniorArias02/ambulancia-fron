import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FormularioIniciarSesion } from './formulario_iniciar_sesion';

describe('FormularioIniciarSesion', () => {
  it('muestra los errores de validación y no envía datos vacíos', async () => {
    const alEnviar = vi.fn();
    render(<FormularioIniciarSesion enviando={false} alEnviar={alEnviar} />);

    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(await screen.findByText('Ingresa tu correo electrónico.')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu contraseña.')).toBeInTheDocument();
    expect(alEnviar).not.toHaveBeenCalled();
  });

  it('rechaza un correo con formato inválido', async () => {
    const alEnviar = vi.fn();
    render(<FormularioIniciarSesion enviando={false} alEnviar={alEnviar} />);

    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'admin');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secreta');
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(await screen.findByText('Ingresa un correo electrónico válido.')).toBeInTheDocument();
    expect(alEnviar).not.toHaveBeenCalled();
  });

  it('envía el correo sin espacios y la contraseña', async () => {
    const alEnviar = vi.fn();
    render(<FormularioIniciarSesion enviando={false} alEnviar={alEnviar} />);

    await userEvent.type(
      screen.getByLabelText('Correo electrónico'),
      '  admin@ambulanciasgalenos.co ',
    );
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secreta');
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(alEnviar).toHaveBeenCalledWith(
      { correo: 'admin@ambulanciasgalenos.co', contrasena: 'secreta' },
      expect.anything(),
    );
  });

  it('deshabilita el envío mientras la solicitud está en curso', () => {
    render(<FormularioIniciarSesion enviando alEnviar={vi.fn()} />);

    expect(screen.getByRole('button', { name: /Ingresando/ })).toBeDisabled();
  });
});
