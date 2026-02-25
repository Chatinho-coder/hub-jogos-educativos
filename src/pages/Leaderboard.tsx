import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Score } from '../lib/supabase'

interface GameLeaders { [game: string]: Score[] }
interface GroupRow { id: string; name: string }

const gameInfo: { [key: string]: { name: string; emoji: string; color: string } } = {
  tabuada: { name: 'Tabuada Rush', emoji: '🏎️', color: '#8B5CF6' },
  geografia: { name: 'GeoMestre Brasil', emoji: '🗺️', color: '#10B981' },
  'geomaster-mundo': { name: 'GeoMestre Mundo', emoji: '🌍', color: '#22C55E' },
  fracoes: { name: 'Pizzaria das Frações', emoji: '🍕', color: '#F97316' },
  ortografia: { name: 'Detetive da Ortografia', emoji: '🔍', color: '#F59E0B' },
  circuito: { name: 'Circuito Lógico', emoji: '⚡', color: '#3B82F6' },
  vocabulario: { name: 'Missão Vocabulário', emoji: '🧠', color: '#06B6D4' },
  'linha-do-tempo': { name: 'Linha do Tempo', emoji: '📜', color: '#14B8A6' },
  unidades: { name: 'Laboratório de Unidades', emoji: '🧪', color: '#F43F5E' },
  'sistema-solar': { name: 'Aventura no Sistema Solar', emoji: '🚀', color: '#6366F1' }
}

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<GameLeaders>({})
  const [loading, setLoading] = useState(true)
  const [groupId, setGroupId] = useState('')
  const [groups, setGroups] = useState<GroupRow[]>([])
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const initialGroup = searchParams.get('group') || ''
    setGroupId(initialGroup)
  }, [searchParams])

  const title = useMemo(() => {
    if (!groupId) return '🏆 Ranking Global'
    const g = groups.find(x => x.id === groupId)
    return `🏆 Ranking do Grupo${g ? `: ${g.name}` : ''}`
  }, [groupId, groups])

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      const { data: userRes } = await supabase.auth.getUser()
      const user = userRes?.user

      if (user) {
        const { data: memberships } = await supabase.from('group_members').select('group_id').eq('user_id', user.id)
        const ids = (memberships || []).map((m: any) => m.group_id)
        if (ids.length) {
          const { data: gs } = await supabase.from('groups').select('id,name').in('id', ids)
          if (active) setGroups((gs || []) as GroupRow[])
        }
      }

      let userIdsFilter: string[] | null = null
      if (groupId) {
        const { data: members } = await supabase.from('group_members').select('user_id').eq('group_id', groupId)
        userIdsFilter = (members || []).map((m: any) => m.user_id)
      }

      let query = supabase.from('scores').select('*').order('score', { ascending: false })
      if (userIdsFilter) query = query.in('user_id', userIdsFilter)
      const { data } = await query

      const grouped: GameLeaders = {}
      data?.forEach(score => {
        if (!grouped[score.game]) grouped[score.game] = []
        if (grouped[score.game].length < 5) grouped[score.game].push(score)
      })

      if (active) {
        setLeaders(grouped)
        setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [groupId])

  const changeGroup = (id: string) => {
    setGroupId(id)
    if (id) setSearchParams({ group: id })
    else setSearchParams({})
  }

  return (
    <>
      <style>{`
        .lb-root { min-height: 100vh; background: #0f0f1a; color: #fff; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .lb-root * { box-sizing: border-box; margin: 0; padding: 0; }
        .lb-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(ellipse 80% 60% at 50% 20%, rgba(245,158,11,0.08) 0%, transparent 70%); }
        .lb-header { position: sticky; top: 0; z-index: 20; backdrop-filter: blur(20px); background: rgba(15,15,26,0.75); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .lb-header-inner { max-width: 1100px; margin: 0 auto; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; gap: 10px; }
        .lb-title { font-size: 1.1rem; font-weight: 800; }
        .lb-back { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: #d1d5db; font-size: 0.82rem; font-weight: 600; padding: 8px 16px; border-radius: 999px; cursor: pointer; }
        .lb-select { background:#131c2e; color:#dbeafe; border:1px solid #334155; border-radius:10px; padding:8px 10px; }
        .lb-content { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: 32px 24px 80px; }
        .lb-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        @media (max-width: 760px) { .lb-grid { grid-template-columns: 1fr; } }
        .lb-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 18px; overflow: hidden; }
        .lb-card-bar { height: 3px; }
        .lb-card-inner { padding: 18px; }
        .lb-card-title { font-size: 1rem; font-weight: 700; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
        .lb-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: 10px; margin-bottom: 6px; background: rgba(255,255,255,0.03); }
        .lb-row-left { display: flex; align-items: center; gap: 10px; }
        .lb-name { font-size: 0.88rem; font-weight: 600; color: #d1d5db; }
        .lb-score { font-size: 1.05rem; font-weight: 800; color: #fbbf24; }
      `}</style>

      <div className="lb-root">
        <div className="lb-bg" />
        <header className="lb-header">
          <div className="lb-header-inner">
            <h1 className="lb-title">{title}</h1>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select className="lb-select" value={groupId} onChange={e => changeGroup(e.target.value)}>
                <option value="">Global</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <button className="lb-back" onClick={() => navigate('/')}>← Voltar</button>
            </div>
          </div>
        </header>

        <div className="lb-content">
          {loading ? (
            <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '1rem', padding: '80px 0' }}>Carregando...</div>
          ) : (
            <div className="lb-grid">
              {Object.entries(gameInfo).map(([id, info]) => (
                <div key={id} className="lb-card">
                  <div className="lb-card-bar" style={{ background: info.color }} />
                  <div className="lb-card-inner">
                    <h2 className="lb-card-title"><span>{info.emoji}</span> {info.name}</h2>
                    {leaders[id]?.length ? leaders[id].map((s, i) => (
                      <div key={`${s.id}-${i}`} className="lb-row">
                        <div className="lb-row-left">
                          <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                          <span className="lb-name">{s.user_email.split('@')[0]}</span>
                        </div>
                        <span className="lb-score">{s.score}</span>
                      </div>
                    )) : <div style={{ color: '#4b5563', fontSize: '.85rem', padding: '16px 0' }}>Nenhum score ainda 🎯</div>}
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
