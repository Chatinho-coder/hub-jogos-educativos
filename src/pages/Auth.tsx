import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Mode = 'login' | 'signup' | 'magic'

export default function Auth() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const { signIn, signUp, sendMagicLink, user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const inviteToken = searchParams.get('invite')
    if (!user || !inviteToken) return

    supabase.rpc('accept_group_invite', { invite_token: inviteToken })
      .then(({ error }) => {
        if (error) {
          setError('Entrou com sucesso, mas não consegui aplicar o convite automaticamente.')
        } else {
          setSuccess('Você entrou no grupo com sucesso!')
          navigate('/')
        }
      })
  }, [user, searchParams, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'login') {
        await signIn(email, password)
        navigate('/')
      } else if (mode === 'signup') {
        await signUp(email, password)
        setSuccess('Conta criada! Verifique seu email para confirmar.')
      } else {
        const inviteToken = searchParams.get('invite')
        const redirect = inviteToken ? `/auth?invite=${inviteToken}` : '/auth'
        await sendMagicLink(email, redirect)
        setSuccess('Link mágico enviado! Verifique seu email para entrar.')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const title = mode === 'login' ? 'Entre na sua conta' : mode === 'signup' ? 'Crie sua conta' : 'Entrar com link mágico'

  return (
    <>
      <style>{`
        .auth-root { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f0f1a; padding: 24px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .auth-root * { box-sizing: border-box; margin: 0; padding: 0; }
        .auth-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 50% 100%, rgba(236,72,153,0.1) 0%, transparent 70%); }
        .auth-card { position: relative; z-index: 1; width: 100%; max-width: 410px; }
        .auth-header { text-align: center; margin-bottom: 24px; }
        .auth-icon { font-size: 3.5rem; margin-bottom: 16px; display: block; }
        .auth-title { font-size: 1.6rem; font-weight: 800; color: #fff; letter-spacing: -0.02em; background: linear-gradient(135deg, #a78bfa, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .auth-subtitle { color: #6b7280; font-size: 0.9rem; margin-top: 6px; }
        .auth-form-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 24px; backdrop-filter: blur(12px); }
        .auth-tabs { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 16px; }
        .auth-tab { border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); color: #cbd5e1; padding: 9px 8px; border-radius: 10px; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
        .auth-tab.active { background: linear-gradient(135deg, #8b5cf6, #ec4899); border-color: transparent; color: #fff; }
        .auth-field { margin-bottom: 16px; }
        .auth-label { display: block; font-size: 0.82rem; font-weight: 600; color: #9ca3af; margin-bottom: 6px; }
        .auth-input { width: 100%; padding: 12px 16px; font-size: 0.95rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; outline: none; font-family: inherit; }
        .auth-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #fca5a5; padding: 10px 14px; border-radius: 10px; font-size: 0.85rem; margin-bottom: 16px; }
        .auth-success { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); color: #6ee7b7; padding: 10px 14px; border-radius: 10px; font-size: 0.85rem; margin-bottom: 16px; }
        .auth-submit { width: 100%; padding: 14px; font-size: 0.95rem; font-weight: 700; background: linear-gradient(135deg, #8b5cf6, #ec4899); color: #fff; border: none; border-radius: 12px; cursor: pointer; }
        .auth-link { margin-top: 10px; background: none; border: none; color: #a78bfa; font-size: .82rem; cursor: pointer; }
      `}</style>

      <div className="auth-root">
        <div className="auth-bg" />
        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-icon">🎮</span>
            <h1 className="auth-title">Jogos Educativos</h1>
            <p className="auth-subtitle">{title}</p>
          </div>

          <div className="auth-form-card">
            <div className="auth-tabs">
              <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(''); setSuccess('') }}>Entrar</button>
              <button className={`auth-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => { setMode('signup'); setError(''); setSuccess('') }}>Cadastrar</button>
              <button className={`auth-tab ${mode === 'magic' ? 'active' : ''}`} onClick={() => { setMode('magic'); setError(''); setSuccess('') }}>Link mágico</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label className="auth-label">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="auth-input" placeholder="seu@email.com" required />
              </div>

              {mode !== 'magic' && (
                <div className="auth-field">
                  <label className="auth-label">Senha</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="auth-input" placeholder="••••••••" required />
                </div>
              )}

              {error && <div className="auth-error">{error}</div>}
              {success && <div className="auth-success">{success}</div>}

              <button type="submit" disabled={loading} className="auth-submit">
                {loading ? 'Processando...' : mode === 'login' ? '🚀 Entrar' : mode === 'signup' ? '🚀 Criar conta' : '✨ Enviar link mágico'}
              </button>
            </form>

            {mode === 'login' && (
              <button className="auth-link" onClick={() => { setMode('magic'); setError(''); setSuccess('') }}>
                Esqueci minha senha, me mande um link mágico para entrar
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
