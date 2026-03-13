import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import RoomPage from './pages/RoomPage';
import PresentationPage from './pages/PresentationPage';
import InvitePage from './pages/InvitePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/invite/:inviteCode" element={<InvitePage />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
        <Route path="/presentation/:roomId" element={<PresentationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
