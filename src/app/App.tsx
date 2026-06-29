import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { PayrollProvider } from './context/PayrollContext';

export default function App() {
  return (
    <AuthProvider>
      <PayrollProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
      </PayrollProvider>
    </AuthProvider>
  );
}