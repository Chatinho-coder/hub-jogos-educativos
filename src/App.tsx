import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Auth from './pages/Auth'
import Hub from './pages/Hub'
import Leaderboard from './pages/Leaderboard'
import TabuadaGame from './games/TabuadaGame'
import GeografiaGame from './games/GeografiaGame'
import FracoesGame from './games/FracoesGame'
import OrtografiaGame from './games/OrtografiaGame'
import CircuitoGame from './games/CircuitoGame'
import VocabularioGame from './games/VocabularioGame'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-2xl">Carregando...</div>
    </div>
  }
  
  return user ? <>{children}</> : <Navigate to="/auth" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Hub />
        </ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        <ProtectedRoute>
          <Leaderboard />
        </ProtectedRoute>
      } />
      <Route path="/game/tabuada" element={
        <ProtectedRoute>
          <TabuadaGame />
        </ProtectedRoute>
      } />
      <Route path="/game/geografia" element={
        <ProtectedRoute>
          <GeografiaGame />
        </ProtectedRoute>
      } />
      <Route path="/game/fracoes" element={
        <ProtectedRoute>
          <FracoesGame />
        </ProtectedRoute>
      } />
      <Route path="/game/ortografia" element={
        <ProtectedRoute>
          <OrtografiaGame />
        </ProtectedRoute>
      } />
      <Route path="/game/circuito" element={
        <ProtectedRoute>
          <CircuitoGame />
        </ProtectedRoute>
      } />
      <Route path="/game/vocabulario" element={
        <ProtectedRoute>
          <VocabularioGame />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
