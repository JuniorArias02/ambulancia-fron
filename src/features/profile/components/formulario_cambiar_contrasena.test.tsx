import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FormularioCambiarContrasena } from './formulario_cambiar_contrasena';

async function completar(actual: string, nueva: string, confirmacion: string) {
  if (actual) await userEvent.type(screen.getByLabelText('Contraseña actual'), actual);
  if (nueva) await userEvent.type(screen.getByLabelText('Nueva contraseña'), nueva);
  if (confirmacion) {
    await userEvent.type(screen.getByLabelText('Confirmar nueva contraseña'), confirmacion);
  }
  await userEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));
}

describe('FormularioCambiarContrasena', () => {
  it('exige la política de contraseña del backend', async () => {
    const alEnviar = vi.fn();
    render(<FormularioCambiarContrasena enviando={false} alEnviar={alEnviar} />);

    await completar('actual123', 'corta1', 'corta1');

    expect(await screen.findByText('Debe tener al menos 10 caracteres.')).toBeInTheDocument();
    expect(alEnviar).not.toHaveBeenCalled();
  });

  it('exige al menos una letra y un número', async () => {
    const alEnviar = vi.fn();
    render(<FormularioCambiarContrasena enviando={false} alEnviar={alEnviar} />);

    await completar('actual123', 'solamenteletras', 'solamenteletras');

    expect(
      await screen.findByText('Debe contener al menos una letra y un número.'),
    ).toBeInTheDocument();
    expect(alEnviar).not.toHaveBeenCalled();
  });

  it('valida que la confirmación coincida', async () => {
    const alEnviar = vi.fn();
    render(<FormularioCambiarContrasena enviando={false} alEnviar={alEnviar} />);

    await completar('actual123', 'NuevaClave2026', 'NuevaClave2027');

    expect(await screen.findByText('Las contraseñas no coinciden.')).toBeInTheDocument();
    expect(alEnviar).not.toHaveBeenCalled();
  });

  it('rechaza una nueva contraseña igual a la actual', async () => {
    const alEnviar = vi.fn();
    render(<FormularioCambiarContrasena enviando={false} alEnviar={alEnviar} />);

    await completar('MismaClave2026', 'MismaClave2026', 'MismaClave2026');

    expect(
      await screen.findByText('La nueva contraseña debe ser diferente de la actual.'),
    ).toBeInTheDocument();
    expect(alEnviar).not.toHaveBeenCalled();
  });

  it('envía solo los campos que espera el backend', async () => {
    const alEnviar = vi.fn();
    render(<FormularioCambiarContrasena enviando={false} alEnviar={alEnviar} />);

    await completar('actual123', 'NuevaClave2026', 'NuevaClave2026');

    expect(alEnviar).toHaveBeenCalledWith({
      contrasenaActual: 'actual123',
      contrasenaNueva: 'NuevaClave2026',
    });
  });
});
