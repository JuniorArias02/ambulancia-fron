import { RouterProvider } from 'react-router';
import { Proveedores } from './app/proveedores';
import { enrutador } from './router/rutas';

export function App() {
  return (
    <Proveedores>
      <RouterProvider router={enrutador} />
    </Proveedores>
  );
}
