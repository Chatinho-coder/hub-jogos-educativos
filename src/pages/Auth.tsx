import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (isLogin) {
        await signIn(email, password)
        navigate('/')
      } else {
        await signUp(email, password)
        setSuccess('Conta criada! Verifique seu email para confirmar.')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .auth-root {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: #0f0f1a; padding: 24px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .auth-root * { box-sizing: border-box; margin: 0; padding: 0; }
        .auth-bg {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 50% 100%, rgba(236,72,153,0.1) 0%, transparent 70%);
        }
        .auth-card {
          position: relative; z-index: 1; width: 100%; max-width: 380px;
        }
        .auth-header { text-align: center; margin-bottom: 32px; }
        .auth-icon { font-size: 3.5rem; margin-bottom: 16px; display: block; }
        .auth-title {
          font-size: 1.6rem; font-weight: 800; color: #fff; letter-spacing: -0.02em;
          background: linear-gradient(135deg, #a78bfa, #ec4899);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .auth-subtitle { color: #6b7280; font-size: 0.9rem; margin-top: 6px; }
        .auth-form-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 28px;
          backdrop-filter: blur(12px);
        }
        .auth-field { margin-bottom: 16px; }
        .auth-label { display: block; font-size: 0.82rem; font-weight: 600; color: #9ca3af; margin-bottom: 6px; }
        .auth-input {
          width: 100%; padding: 12px 16px; font-size: 0.95rem;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; color: #fff; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: inherit;
        }
        .auth-input::placeholder { color: #4b5563; }
        .auth-input:focus { border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139,92,246,0.15); }
        .auth-error {
          background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2);
          color: #fca5a5; padding: 10px 14px; border-radius: 10px;
          font-size: 0.85rem; margin-bottom: 16px;
        }
        .auth-success {
          background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2);
          color: #6ee7b7; padding: 10px 14px; border-radius: 10px;
          font-size: 0.85rem; margin-bottom: 16px;
        }
        .auth-submit {
          width: 100%; padding: 14px; font-size: 0.95rem; font-weight: 700;
          background: linear-gradient(135deg, #8b5cf6, #ec4899); color: #fff;
          border: none; border-radius: 12px; cursor: pointer;
          transition: opacity 0.2s, transform 0.15s; font-family: inherit;
        }
        .auth-submit:hover { opacity: 0.92; transform: translateY(-1px); }
        .auth-submit:active { transform: translateY(0); }
        .auth-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .auth-toggle {
          text-align: center; margin-top: 20px; padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .auth-toggle-btn {
          background: none; border: none; color: #a78bfa; font-size: 0.85rem;
          font-weight: 600; cursor: pointer; transition: color 0.2s; font-family: inherit;
        }
        .auth-toggle-btn:hover { color: #c4b5fd; }
      `}</style>

      <div className="auth-root">
        <div className="auth-bg" />
        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-icon">🎮</span>
            <h1 className="auth-title">Jogos Educativos</h1>
            <p className="auth-subtitle">{isLogin ? 'Entre na sua conta' : 'Crie sua conta'}</p>
          </div>

          <div className="auth-form-card">
            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label className="auth-label">Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="auth-input" placeholder="seu@email.com" required
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">Senha</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="auth-input" placeholder="••••••••" required
                />
              </div>
              {error && <div className="auth-error">{error}</div>}
              {success && <div className="auth-success">{success}</div>}
              <button type="submit" disabled={loading} className="auth-submit">
                {loading ? 'Processando...' : isLogin ? '🚀 Entrar' : '🚀 Criar Conta'}
              </button>
            </form>
            <div className="auth-toggle">
              <button className="auth-toggle-btn" onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess('') }}>
                {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
