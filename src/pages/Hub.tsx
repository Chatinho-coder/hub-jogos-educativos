import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const games = [
  {
    id: 'tabuada',
    title: 'Tabuada Rush',
    emoji: '🏎️',
    subtitle: 'Velocidade & Cálculo',
    description: 'Responda multiplicações contra o relógio. Modo turbo de 60 segundos ou treino livre sem pressão.',
    color: '#8B5CF6',
    colorLight: '#C4B5FD',
    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    tag: 'Matemática'
  },
  {
    id: 'ortografia',
    title: 'Detetive da Ortografia',
    emoji: '🔍',
    subtitle: 'Investigação & Escrita',
    description: 'Resolva 10 casos encontrando a grafia correta. Cada acerto é uma pista para desvendar o mistério.',
    color: '#F59E0B',
    colorLight: '#FCD34D',
    bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    tag: 'Português'
  },
  {
    id: 'fracoes',
    title: 'Pizzaria das Frações',
    emoji: '🍕',
    subtitle: 'Visual & Lógica',
    description: 'Monte pizzas para aprender frações. Três modos: descobrir, construção e equivalentes.',
    color: '#F97316',
    colorLight: '#FDBA74',
    bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    tag: 'Matemática'
  },
  {
    id: 'geografia',
    title: 'GeoMestre Brasil',
    emoji: '🗺️',
    subtitle: 'Mapas & Memória',
    description: 'Identifique estados e capitais no mapa interativo do Brasil. Modo jogo e modo estudo.',
    color: '#10B981',
    colorLight: '#6EE7B7',
    bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    tag: 'Geografia'
  },
  {
    id: 'geomaster-mundo',
    title: 'GeoMestre Mundo',
    emoji: '🌍',
    subtitle: 'Países & Capitais',
    description: 'Treine países e capitais do mundo com perguntas dinâmicas e ranking de pontuação.',
    color: '#22C55E',
    colorLight: '#86EFAC',
    bg: 'linear-gradient(135deg, #166534 0%, #22c55e 100%)',
    tag: 'Geografia'
  },
  {
    id: 'circuito',
    title: 'Circuito Lógico',
    emoji: '⚡',
    subtitle: 'Portas & Raciocínio',
    description: 'Resolva desafios com portas lógicas (AND, OR, NOT, XOR) montando circuitos para acender a saída correta.',
    color: '#3B82F6',
    colorLight: '#93C5FD',
    bg: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
    tag: 'Lógica'
  },
  {
    id: 'vocabulario',
    title: 'Missão Vocabulário',
    emoji: '🧠',
    subtitle: 'Inglês & Dia a dia',
    description: 'Aprenda palavras em inglês com cenas visuais do cotidiano: casa, escola, mercado e cidade.',
    color: '#06B6D4',
    colorLight: '#67E8F9',
    bg: 'linear-gradient(135deg, #22d3ee 0%, #0ea5e9 100%)',
    tag: 'Inglês'
  },
  {
    id: 'linha-do-tempo',
    title: 'Linha do Tempo',
    emoji: '📜',
    subtitle: 'História & Sequência',
    description: 'Estude eventos históricos e treine a ordem cronológica em desafios de arrastar e escolher.',
    color: '#14B8A6',
    colorLight: '#5EEAD4',
    bg: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
    tag: 'História'
  },
  {
    id: 'unidades',
    title: 'Laboratório de Unidades',
    emoji: '🧪',
    subtitle: 'Medidas & Conversão',
    description: 'Aprenda e pratique conversões de comprimento, massa, volume e tempo com situações do dia a dia.',
    color: '#F43F5E',
    colorLight: '#FDA4AF',
    bg: 'linear-gradient(135deg, #be123c 0%, #f43f5e 100%)',
    tag: 'Matemática'
  },
  {
    id: 'sistema-solar',
    title: 'Aventura no Sistema Solar',
    emoji: '🚀',
    subtitle: 'Planetas & Descobertas',
    description: 'Viaje pelo Sistema Solar respondendo perguntas sobre os planetas. Descubra curiosidades incríveis do nosso universo!',
    color: '#6366F1',
    colorLight: '#A5B4FC',
    bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
    tag: 'Ciências'
  }
]

export default function Hub() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [records, setRecords] = useState<{[game: string]: number}>({})
  const [totalGames, setTotalGames] = useState(0)
  const username = user?.email?.split('@')[0] ?? 'jogador'

  useEffect(() => {
    if (!user) return
    supabase.from('scores').select('*').eq('user_id', user.id).then(({ data }) => {
      if (!data) return
      setTotalGames(data.length)
      const best: {[g: string]: number} = {}
      data.forEach(s => { if (!best[s.game] || s.score > best[s.game]) best[s.game] = s.score })
      setRecords(best)
    })
  }, [user])

  return (
    <>
      <style>{`
        .hub-root {
          min-height: 100vh;
          background: #0f0f1a;
          color: #fff;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          overflow-x: hidden;
        }
        .hub-root * { box-sizing: border-box; margin: 0; padding: 0; }

        .hub-bg {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 80% 60% at 20% 10%, rgba(99,102,241,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 80% 80%, rgba(236,72,153,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 50% 50%, rgba(16,185,129,0.06) 0%, transparent 70%);
        }

        .hub-header {
          position: sticky; top: 0; z-index: 20;
          backdrop-filter: blur(20px) saturate(1.4);
          -webkit-backdrop-filter: blur(20px) saturate(1.4);
          background: rgba(15,15,26,0.75);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .hub-header-inner {
          max-width: 960px; margin: 0 auto; padding: 16px 24px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .hub-logo {
          font-size: 1.15rem; font-weight: 800; letter-spacing: -0.02em;
          display: flex; align-items: center; gap: 10px;
        }
        .hub-logo-icon { font-size: 1.5rem; }
        .hub-logo-text {
          background: linear-gradient(135deg, #a78bfa, #ec4899);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hub-nav { display: flex; align-items: center; gap: 16px; }
        .hub-nav-btn {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
          color: #d1d5db; font-size: 0.82rem; font-weight: 600;
          padding: 8px 16px; border-radius: 999px; cursor: pointer;
          transition: all 0.2s;
        }
        .hub-nav-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
        .hub-user-btn {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
          color: #d1d5db; font-size: 0.82rem; font-weight: 600;
          padding: 8px 16px; border-radius: 999px; cursor: pointer;
          transition: all 0.2s; font-family: inherit;
        }
        .hub-user-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
        .profile-overlay {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .profile-card {
          background: #1a1a2e; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 32px; width: 100%; max-width: 420px;
        }
        .profile-header { text-align: center; margin-bottom: 28px; }
        .profile-avatar {
          width: 64px; height: 64px; border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.8rem; margin: 0 auto 12px;
        }
        .profile-name { font-size: 1.2rem; font-weight: 800; color: #fff; }
        .profile-email { font-size: 0.82rem; color: #6b7280; margin-top: 2px; }
        .profile-stats {
          display: flex; gap: 12px; justify-content: center; margin-top: 16px;
        }
        .profile-stat {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px; padding: 10px 16px; text-align: center; flex: 1;
        }
        .profile-stat-val { font-size: 1.3rem; font-weight: 800; color: #fbbf24; }
        .profile-stat-label { font-size: 0.7rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }
        .profile-records { margin-top: 24px; }
        .profile-records-title { font-size: 0.85rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
        .profile-record {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 16px; border-radius: 12px;
          background: rgba(255,255,255,0.03); margin-bottom: 8px;
        }
        .profile-record-game { display: flex; align-items: center; gap: 10px; }
        .profile-record-emoji { font-size: 1.3rem; }
        .profile-record-name { font-size: 0.9rem; font-weight: 600; color: #d1d5db; }
        .profile-record-score { font-size: 1.1rem; font-weight: 800; color: #fbbf24; }
        .profile-record-none { font-size: 0.82rem; color: #4b5563; }
        .profile-close {
          width: 100%; margin-top: 20px; padding: 12px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
          color: #d1d5db; font-size: 0.88rem; font-weight: 600;
          border-radius: 12px; cursor: pointer; transition: all 0.2s; font-family: inherit;
        }
        .profile-close:hover { background: rgba(255,255,255,0.12); color: #fff; }
        .hub-signout {
          background: none; border: none; color: #4b5563; font-size: 0.75rem;
          cursor: pointer; transition: color 0.2s; text-decoration: underline;
          text-underline-offset: 2px;
        }
        .hub-signout:hover { color: #ef4444; }

        .hub-content { position: relative; z-index: 1; max-width: 960px; margin: 0 auto; padding: 48px 24px 80px; }

        .hub-hero { text-align: center; margin-bottom: 52px; }
        .hub-greeting {
          font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 800;
          letter-spacing: -0.03em; line-height: 1.2; margin-bottom: 8px;
        }
        .hub-greeting-name {
          background: linear-gradient(135deg, #fbbf24, #f97316);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hub-subtitle { color: #6b7280; font-size: 1.05rem; line-height: 1.5; }

        .hub-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        @media (max-width: 640px) {
          .hub-grid { grid-template-columns: 1fr; }
          .hub-content { padding: 32px 16px 60px; }
          .hub-hero { margin-bottom: 36px; }
        }

        .game-card {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.28s ease;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
        }
        .game-card:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 20px 60px -12px rgba(0,0,0,0.5);
        }
        .game-card:active { transform: translateY(-2px) scale(0.99); }

        .game-card-visual {
          height: 140px;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
        }
        .game-card-visual::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 40%, rgba(15,15,26,0.95) 100%);
        }
        .game-card-emoji {
          font-size: 4rem; position: relative; z-index: 1;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
          transition: transform 0.3s ease;
        }
        .game-card:hover .game-card-emoji { transform: scale(1.15) rotate(-3deg); }

        .game-card-body { padding: 20px 22px 24px; position: relative; }
        .game-card-tag {
          display: inline-block;
          font-size: 0.68rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
          padding: 4px 10px; border-radius: 6px;
          margin-bottom: 10px;
        }
        .game-card-title {
          font-size: 1.2rem; font-weight: 800; letter-spacing: -0.02em;
          margin-bottom: 2px; line-height: 1.3;
        }
        .game-card-subtitle {
          font-size: 0.78rem; color: #6b7280; font-weight: 500;
          margin-bottom: 10px;
        }
        .game-card-desc {
          font-size: 0.85rem; color: #9ca3af; line-height: 1.55;
        }

        .game-card-play {
          display: flex; align-items: center; gap: 6px; margin-top: 16px;
          font-size: 0.82rem; font-weight: 700;
          opacity: 0; transform: translateY(4px);
          transition: opacity 0.25s, transform 0.25s;
        }
        .game-card:hover .game-card-play { opacity: 1; transform: translateY(0); }
        .game-card-play-arrow {
          display: inline-flex; align-items: center; justify-content: center;
          width: 24px; height: 24px; border-radius: 50%;
          transition: transform 0.2s;
        }
        .game-card:hover .game-card-play-arrow { transform: translateX(3px); }
      `}</style>

      <div className="hub-root">
        <div className="hub-bg" />

        <header className="hub-header">
          <div className="hub-header-inner">
            <div className="hub-logo">
              <span className="hub-logo-icon">🎮</span>
              <span className="hub-logo-text">Jogos Educativos</span>
            </div>
            <div className="hub-nav">
              <button className="hub-nav-btn" onClick={() => navigate('/leaderboard')}>🏆 Ranking</button>
              <button className="hub-user-btn" onClick={() => setShowProfile(true)}>👤 {username}</button>
              <button className="hub-signout" onClick={signOut}>sair</button>
            </div>
          </div>
        </header>

        <main className="hub-content">
          <section className="hub-hero">
            <h1 className="hub-greeting">
              Bora jogar, <span className="hub-greeting-name">{username}</span>? 🚀
            </h1>
            <p className="hub-subtitle">Escolha um jogo e aprenda se divertindo</p>
          </section>

          <div className="hub-grid">
            {games.map(game => (
              <div
                key={game.id}
                className="game-card"
                onClick={() => navigate(`/game/${game.id}`)}
                onMouseEnter={() => setHoveredId(game.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  borderColor: hoveredId === game.id ? `${game.color}44` : undefined,
                }}
              >
                <div className="game-card-visual" style={{ background: game.bg }}>
                  <span className="game-card-emoji">{game.emoji}</span>
                </div>
                <div className="game-card-body">
                  <span className="game-card-tag" style={{
                    background: `${game.color}18`,
                    color: game.colorLight
                  }}>
                    {game.tag}
                  </span>
                  <h3 className="game-card-title">{game.title}</h3>
                  <p className="game-card-subtitle">{game.subtitle}</p>
                  <p className="game-card-desc">{game.description}</p>
                  <div className="game-card-play" style={{ color: game.colorLight }}>
                    Jogar agora
                    <span className="game-card-play-arrow" style={{ background: `${game.color}22` }}>→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {showProfile && (
          <div className="profile-overlay" onClick={() => setShowProfile(false)}>
            <div className="profile-card" onClick={e => e.stopPropagation()}>
              <div className="profile-header">
                <div className="profile-avatar">🎮</div>
                <div className="profile-name">{username}</div>
                <div className="profile-email">{user?.email}</div>
                <div className="profile-stats">
                  <div className="profile-stat">
                    <div className="profile-stat-val">{totalGames}</div>
                    <div className="profile-stat-label">Partidas</div>
                  </div>
                  <div className="profile-stat">
                    <div className="profile-stat-val">{Object.keys(records).length}/{games.length}</div>
                    <div className="profile-stat-label">Jogos</div>
                  </div>
                  <div className="profile-stat">
                    <div className="profile-stat-val">{Object.values(records).reduce((a, b) => a + b, 0)}</div>
                    <div className="profile-stat-label">Total pts</div>
                  </div>
                </div>
              </div>
              <div className="profile-records">
                <div className="profile-records-title">🏆 Meus Recordes</div>
                {games.map(g => (
                  <div key={g.id} className="profile-record">
                    <div className="profile-record-game">
                      <span className="profile-record-emoji">{g.emoji}</span>
                      <span className="profile-record-name">{g.title}</span>
                    </div>
                    {records[g.id] != null ? (
                      <span className="profile-record-score">{records[g.id]}</span>
                    ) : (
                      <span className="profile-record-none">—</span>
                    )}
                  </div>
                ))}
              </div>
              <button className="profile-close" onClick={() => setShowProfile(false)}>Fechar</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
