import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Matches from './pages/Matches';
import Favorites from './pages/Favorites';

const Protected = ({ children }) => {
  const token = useAuthStore(s => s.token);
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Protected><Matches /></Protected>} />
        <Route path="/favorites" element={<Protected><Favorites /></Protected>} />
      </Routes>
    </BrowserRouter>
  );
}