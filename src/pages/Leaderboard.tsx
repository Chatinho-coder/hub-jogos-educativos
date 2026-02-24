import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Score } from '../lib/supabase'

interface GameLeaders { [game: string]: Score[] }

const gameInfo: { [key: string]: { name: string; emoji: string; color: string } } = {
  tabuada: { name: 'Tabuada Rush', emoji: '🏎️', color: '#8B5CF6' },
  geografia: { name: 'GeoMestre Brasil', emoji: '🗺️', color: '#10B981' },
  fracoes: { name: 'Pizzaria das Frações', emoji: '🍕', color: '#F97316' },
  ortografia: { name: 'Detetive da Ortografia', emoji: '🔍', color: '#F59E0B' }
}

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<GameLeaders>({})
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.from('scores').select('*').order('score', { ascending: false }).then(({ data }) => {
      const grouped: GameLeaders = {}
      data?.forEach(score => {
        if (!grouped[score.game]) grouped[score.game] = []
        if (grouped[score.game].length < 5) grouped[score.game].push(score)
      })
      setLeaders(grouped)
      setLoading(false)
    })
  }, [])

  return (
    <>
      <style>{`
        .lb-root {
          min-height: 100vh; background: #0f0f1a; color: #fff;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .lb-root * { box-sizing: border-box; margin: 0; padding: 0; }
        .lb-bg {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background: radial-gradient(ellipse 80% 60% at 50% 20%, rgba(245,158,11,0.08) 0%, transparent 70%);
        }
        .lb-header {
          position: sticky; top: 0; z-index: 20;
          backdrop-filter: blur(20px); background: rgba(15,15,26,0.75);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .lb-header-inner {
          max-width: 960px; margin: 0 auto; padding: 16px 24px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .lb-title { font-size: 1.2rem; font-weight: 800; }
        .lb-back {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
          color: #d1d5db; font-size: 0.82rem; font-weight: 600;
          padding: 8px 16px; border-radius: 999px; cursor: pointer; transition: all 0.2s;
          font-family: inherit;
        }
        .lb-back:hover { background: rgba(255,255,255,0.12); color: #fff; }
        .lb-content { position: relative; z-index: 1; max-width: 960px; margin: 0 auto; padding: 32px 24px 80px; }
        .lb-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        @media (max-width: 640px) { .lb-grid { grid-template-columns: 1fr; } }
        .lb-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px; overflow: hidden;
        }
        .lb-card-bar { height: 3px; }
        .lb-card-inner { padding: 20px; }
        .lb-card-title { font-size: 1rem; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .lb-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 14px; border-radius: 10px; margin-bottom: 6px;
          background: rgba(255,255,255,0.03);
        }
        .lb-row-left { display: flex; align-items: center; gap: 10px; }
        .lb-rank { font-size: 1.1rem; font-weight: 800; min-width: 28px; }
        .lb-name { font-size: 0.88rem; font-weight: 600; color: #d1d5db; }
        .lb-score { font-size: 1.05rem; font-weight: 800; color: #fbbf24; }
        .lb-empty { text-align: center; color: #4b5563; font-size: 0.85rem; padding: 24px 0; }
        .lb-loading { text-align: center; color: #6b7280; font-size: 1rem; padding: 80px 0; }
      `}</style>

      <div className="lb-root">
        <div className="lb-bg" />
        <header className="lb-header">
          <div className="lb-header-inner">
            <h1 className="lb-title">🏆 Ranking Global</h1>
            <button className="lb-back" onClick={() => navigate('/')}>← Voltar</button>
          </div>
        </header>
        <div className="lb-content">
          {loading ? (
            <div className="lb-loading">Carregando...</div>
          ) : (
            <div className="lb-grid">
              {Object.entries(gameInfo).map(([id, info]) => (
                <div key={id} className="lb-card">
                  <div className="lb-card-bar" style={{ background: info.color }} />
                  <div className="lb-card-inner">
                    <h2 className="lb-card-title"><span>{info.emoji}</span> {info.name}</h2>
                    {leaders[id]?.length ? leaders[id].map((s, i) => (
                      <div key={s.id} className="lb-row">
                        <div className="lb-row-left">
                          <span className="lb-rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}</span>
                          <span className="lb-name">{s.user_email.split('@')[0]}</span>
                        </div>
                        <span className="lb-score">{s.score}</span>
                      </div>
                    )) : (
                      <div className="lb-empty">Nenhum score ainda 🎯</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
