import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import StallListPage from './pages/StallListPage';
import StallDetailPage from './pages/StallDetailPage';
import StallFormPage from './pages/StallFormPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import KelolaLayout from './pages/kelola/KelolaLayout';
import KelolaOverview from './pages/kelola/KelolaOverview';
import KelolaStalls from './pages/kelola/KelolaStalls';
import KelolaUsers from './pages/kelola/KelolaUsers';
import KelolaFlags from './pages/kelola/KelolaFlags';
import KelolaAudit from './pages/kelola/KelolaAudit';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/" element={<StallListPage />} />
            <Route path="/stalls/new" element={<StallFormPage />} />
            <Route path="/stalls/:id" element={<StallDetailPage />} />
            <Route path="/stalls/:id/edit" element={<StallFormPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/kelola" element={<KelolaLayout />}>
              <Route index element={<KelolaOverview />} />
              <Route path="warung" element={<KelolaStalls />} />
              <Route path="pengguna" element={<KelolaUsers />} />
              <Route path="laporan" element={<KelolaFlags />} />
              <Route path="riwayat" element={<KelolaAudit />} />
            </Route>
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;