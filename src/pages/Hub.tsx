import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useMemo, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

type GroupRole = 'owner' | 'admin' | 'member'
interface GroupRow { id: string; name: string }
interface GroupMember { group_id: string; user_id: string; user_email: string; role: GroupRole }

const games = [
  { id: 'tabuada', title: 'Tabuada Rush', emoji: '🏎️', subtitle: 'Velocidade & Cálculo', description: 'Responda multiplicações contra o relógio.', color: '#8B5CF6', colorLight: '#C4B5FD', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', tag: 'Matemática' },
  { id: 'ortografia', title: 'Detetive da Ortografia', emoji: '🔍', subtitle: 'Investigação & Escrita', description: 'Resolva casos com grafia correta.', color: '#F59E0B', colorLight: '#FCD34D', bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', tag: 'Português' },
  { id: 'fracoes', title: 'Pizzaria das Frações', emoji: '🍕', subtitle: 'Visual & Lógica', description: 'Aprenda frações montando pizzas.', color: '#F97316', colorLight: '#FDBA74', bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', tag: 'Matemática' },
  { id: 'geografia', title: 'GeoMestre Brasil', emoji: '🗺️', subtitle: 'Mapas & Memória', description: 'Estados e capitais no mapa.', color: '#10B981', colorLight: '#6EE7B7', bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', tag: 'Geografia' },
  { id: 'geomaster-mundo', title: 'GeoMestre Mundo', emoji: '🌍', subtitle: 'Países & Capitais', description: 'Mapa mundial com países e capitais.', color: '#22C55E', colorLight: '#86EFAC', bg: 'linear-gradient(135deg, #166534 0%, #22c55e 100%)', tag: 'Geografia' },
  { id: 'circuito', title: 'Circuito Lógico', emoji: '⚡', subtitle: 'Portas & Raciocínio', description: 'Desafios com portas lógicas.', color: '#3B82F6', colorLight: '#93C5FD', bg: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)', tag: 'Lógica' },
  { id: 'vocabulario', title: 'Missão Vocabulário', emoji: '🧠', subtitle: 'Inglês & Dia a dia', description: 'Vocabulário com contexto visual.', color: '#06B6D4', colorLight: '#67E8F9', bg: 'linear-gradient(135deg, #22d3ee 0%, #0ea5e9 100%)', tag: 'Inglês' },
  { id: 'linha-do-tempo', title: 'Linha do Tempo', emoji: '📜', subtitle: 'História & Sequência', description: 'Eventos históricos em ordem.', color: '#14B8A6', colorLight: '#5EEAD4', bg: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)', tag: 'História' },
  { id: 'unidades', title: 'Laboratório de Unidades', emoji: '🧪', subtitle: 'Medidas & Conversão', description: 'Conversões com situações do dia a dia.', color: '#F43F5E', colorLight: '#FDA4AF', bg: 'linear-gradient(135deg, #be123c 0%, #f43f5e 100%)', tag: 'Matemática' },
  { id: 'sistema-solar', title: 'Aventura no Sistema Solar', emoji: '🚀', subtitle: 'Planetas & Descobertas', description: 'Quiz sobre o Sistema Solar.', color: '#6366F1', colorLight: '#A5B4FC', bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)', tag: 'Ciências' }
]

export default function Hub() {
  const { user, signOut, sendMagicLink } = useAuth()
  const navigate = useNavigate()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showGroups, setShowGroups] = useState(false)
  const [records, setRecords] = useState<{ [game: string]: number }>({})
  const [totalGames, setTotalGames] = useState(0)
  const [subjectFilter, setSubjectFilter] = useState('Todos')
  const [groups, setGroups] = useState<GroupRow[]>([])
  const [members, setMembers] = useState<GroupMember[]>([])
  const [activeGroupId, setActiveGroupId] = useState<string>(localStorage.getItem('activeGroupId') || '')
  const [newGroupName, setNewGroupName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [groupMsg, setGroupMsg] = useState('')
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const username = user?.email?.split('@')[0] ?? 'jogador'

  const subjects = useMemo(() => ['Todos', ...Array.from(new Set(games.map(g => g.tag)))], [])
  const filteredGames = useMemo(() => subjectFilter === 'Todos' ? games : games.filter(g => g.tag === subjectFilter), [subjectFilter])
  const activeRole = members.find(m => m.group_id === activeGroupId && m.user_id === user?.id)?.role

  useEffect(() => {
    if (!user) return
    supabase.from('scores').select('*').eq('user_id', user.id).then(({ data }) => {
      if (!data) return
      setTotalGames(data.length)
      const best: { [g: string]: number } = {}
      data.forEach(s => { if (!best[s.game] || s.score > best[s.game]) best[s.game] = s.score })
      setRecords(best)
    })
  }, [user])

  const refreshGroups = async () => {
    if (!user) return
    const { data: memberRows } = await supabase.from('group_members').select('*').eq('user_id', user.id)
    const memberData = (memberRows || []) as GroupMember[]
    setMembers(memberData)
    const ids = memberData.map(m => m.group_id)
    if (!ids.length) { setGroups([]); return }
    const { data: groupRows } = await supabase.from('groups').select('id,name').in('id', ids)
    setGroups((groupRows || []) as GroupRow[])
    if (!activeGroupId && groupRows?.[0]?.id) {
      setActiveGroupId(groupRows[0].id)
      localStorage.setItem('activeGroupId', groupRows[0].id)
    }
  }

  useEffect(() => { refreshGroups() }, [user])

  const createGroup = async () => {
    if (!user || !newGroupName.trim()) return
    setGroupMsg('')
    const { data, error } = await supabase.rpc('create_group_with_owner', { group_name: newGroupName.trim() })
    if (error || !data) { setGroupMsg(`Erro ao criar grupo: ${error?.message || 'falha desconhecida'}`); return }
    setNewGroupName('')
    setGroupMsg('Grupo criado!')
    await refreshGroups()
  }

  const inviteToGroup = async () => {
    if (!user || !activeGroupId || !inviteEmail.trim()) return
    setGroupMsg('')
    const token = crypto.randomUUID()
    const { error } = await supabase.from('group_invites').insert({
      group_id: activeGroupId,
      email: inviteEmail.trim().toLowerCase(),
      invited_by: user.id,
      token
    })
    if (error) { setGroupMsg('Erro ao gerar convite.'); return }
    await sendMagicLink(inviteEmail.trim().toLowerCase(), `/auth?invite=${token}`)
    setInviteEmail('')
    setGroupMsg('Convite enviado por email com link mágico!')
  }

  const promoteToAdmin = async (memberUserId: string) => {
    await supabase.from('group_members').update({ role: 'admin' }).eq('group_id', activeGroupId).eq('user_id', memberUserId)
    setGroupMsg('Permissão de admin atualizada.')
    await refreshGroups()
  }

  const deleteGroup = async (groupId: string) => {
    if (!confirm('Tem certeza que deseja excluir este grupo?')) return
    setGroupMsg('')
    const { error } = await supabase.from('groups').delete().eq('id', groupId)
    if (error) { setGroupMsg(`Erro ao excluir grupo: ${error.message}`); return }
    if (activeGroupId === groupId) {
      setActiveGroupId('')
      localStorage.removeItem('activeGroupId')
    }
    setGroupMsg('Grupo excluído.')
    await refreshGroups()
  }

  return (
    <>
      <style>{`
        .hub-root { min-height: 100vh; background: #0f0f1a; color: #fff; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; overflow-x: hidden; }
        .hub-root * { box-sizing: border-box; margin: 0; padding: 0; }
        .hub-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(ellipse 80% 60% at 20% 10%, rgba(99,102,241,0.12) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(236,72,153,0.08) 0%, transparent 70%); }
        .hub-header { position: sticky; top: 0; z-index: 20; backdrop-filter: blur(20px) saturate(1.4); background: rgba(15,15,26,0.75); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .hub-header-inner { max-width: 1200px; margin: 0 auto; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
        .hub-logo { font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; gap: 10px; }
        .hub-logo-text { background: linear-gradient(135deg, #a78bfa, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hub-nav { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .hub-nav-btn,.hub-user-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: #d1d5db; font-size: 0.82rem; font-weight: 600; padding: 8px 14px; border-radius: 999px; cursor: pointer; }
        .hub-signout { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: #9ca3af; font-size: 0.78rem; font-weight: 700; padding: 8px 12px; border-radius: 999px; cursor: pointer; text-decoration: none; }
        .hub-content { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: 44px 24px 80px; }
        .hub-hero { text-align: center; margin-bottom: 26px; }
        .hub-greeting { font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 800; margin-bottom: 8px; }
        .hub-greeting-name { background: linear-gradient(135deg, #fbbf24, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hub-subtitle { color: #6b7280; font-size: 1.02rem; }
        .filter-row { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:22px; justify-content:center; }
        .filter-btn { border:1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.04); color:#cbd5e1; border-radius:999px; padding:8px 12px; font-size:.82rem; font-weight:700; cursor:pointer; }
        .filter-btn.active { background:linear-gradient(135deg,#8b5cf6,#ec4899); border-color:transparent; color:#fff; }
        .hub-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        @media (max-width: 1080px) { .hub-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 760px) {
          .hub-header-inner { padding: 12px 12px; gap: 10px; align-items: flex-start; }
          .hub-logo { font-size: 1rem; }
          .hub-nav { width: 100%; gap: 8px; }
          .hub-nav-btn,.hub-user-btn,.hub-signout { font-size: 0.78rem; padding: 7px 11px; }
        }
        @media (max-width: 640px) { .hub-grid { grid-template-columns: 1fr; } .hub-content { padding: 30px 16px 60px; } }
        .game-card { border-radius: 20px; overflow: hidden; cursor: pointer; transition: transform .25s; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.03); }
        .game-card:hover { transform: translateY(-4px); }
        .game-card-visual { height: 128px; display: flex; align-items: center; justify-content: center; position: relative; }
        .game-card-emoji { font-size: 3.6rem; }
        .game-card-body { padding: 18px 20px 20px; }
        .game-card-tag { display: inline-block; font-size: .68rem; font-weight:700; padding: 4px 10px; border-radius: 6px; margin-bottom: 10px; }
        .game-card-title { font-size: 1.1rem; font-weight: 800; margin-bottom: 2px; }
        .game-card-subtitle { font-size: .78rem; color:#6b7280; margin-bottom: 8px; }
        .game-card-desc { font-size: .84rem; color:#9ca3af; line-height:1.5; }
        .profile-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; padding: 20px; }
        .profile-card { background:#1a1a2e; border:1px solid rgba(255,255,255,.08); border-radius:20px; padding:24px; width:100%; max-width:480px; max-height:90vh; overflow:auto; }
        .group-input { width:100%; margin-top:8px; background:#10192b; border:1px solid #2e3f5f; color:#fff; border-radius:10px; padding:10px; }
        .group-btn { margin-top:8px; width:100%; border:none; border-radius:10px; padding:10px; font-weight:700; cursor:pointer; background:linear-gradient(135deg,#22c55e,#16a34a); color:#04210f; }
        .group-plus-btn { width:28px; height:28px; border-radius:999px; border:1px solid rgba(255,255,255,.15); background:rgba(255,255,255,.05); color:#d1d5db; font-size:1rem; font-weight:800; cursor:pointer; }
        .group-delete-btn { margin-top:6px; width:100%; border:1px solid rgba(248,113,113,.35); border-radius:8px; padding:7px; font-size:.78rem; font-weight:700; cursor:pointer; background:rgba(127,29,29,.25); color:#fecaca; }
        .profile-close { width:100%; margin-top:14px; background: rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.1); color:#e5e7eb; border-radius:10px; padding:10px; cursor:pointer; }
      `}</style>

      <div className="hub-root">
        <div className="hub-bg" />
        <header className="hub-header">
          <div className="hub-header-inner">
            <div className="hub-logo"><span>🎮</span><span className="hub-logo-text">Jogos Educativos</span></div>
            <div className="hub-nav">
              <button className="hub-nav-btn" onClick={() => navigate('/leaderboard')}>🏆 Ranking</button>
              <button className="hub-nav-btn" onClick={() => setShowGroups(true)}>👥 Grupos</button>
              <button className="hub-user-btn" onClick={() => setShowProfile(true)}>👤 {username}</button>
              <button className="hub-signout" onClick={signOut}>sair</button>
            </div>
          </div>
        </header>

        <main className="hub-content">
          <section className="hub-hero">
            <h1 className="hub-greeting">Bora jogar, <span className="hub-greeting-name">{username}</span>? 🚀</h1>
            <p className="hub-subtitle">Escolha um jogo e aprenda se divertindo</p>
          </section>

          <div className="filter-row">
            {subjects.map(s => (
              <button key={s} className={`filter-btn ${subjectFilter === s ? 'active' : ''}`} onClick={() => setSubjectFilter(s)}>{s}</button>
            ))}
          </div>

          <div className="hub-grid">
            {filteredGames.map(game => (
              <div key={game.id} className="game-card" onClick={() => navigate(`/game/${game.id}`)} onMouseEnter={() => setHoveredId(game.id)} onMouseLeave={() => setHoveredId(null)} style={{ borderColor: hoveredId === game.id ? `${game.color}44` : undefined }}>
                <div className="game-card-visual" style={{ background: game.bg }}><span className="game-card-emoji">{game.emoji}</span></div>
                <div className="game-card-body">
                  <span className="game-card-tag" style={{ background: `${game.color}18`, color: game.colorLight }}>{game.tag}</span>
                  <h3 className="game-card-title">{game.title}</h3>
                  <p className="game-card-subtitle">{game.subtitle}</p>
                  <p className="game-card-desc">{game.description}</p>
                </div>
              </div>
            ))}
          </div>
        </main>

        {showProfile && (
          <div className="profile-overlay" onClick={() => setShowProfile(false)}>
            <div className="profile-card" onClick={e => e.stopPropagation()}>
              <h3>👤 {username}</h3>
              <p style={{ color: '#6b7280', marginTop: 4 }}>{user?.email}</p>
              <p style={{ marginTop: 12 }}>Partidas: <b>{totalGames}</b></p>
              <p>Jogos com recorde: <b>{Object.keys(records).length}/{games.length}</b></p>
              <button className="profile-close" onClick={() => setShowProfile(false)}>Fechar</button>
            </div>
          </div>
        )}

        {showGroups && (
          <div className="profile-overlay" onClick={() => setShowGroups(false)}>
            <div className="profile-card" onClick={e => e.stopPropagation()}>
              <h3>👥 Grupos</h3>
              <p className="muted" style={{ marginTop: 4 }}>Convide por email com link mágico e use ranking por grupo.</p>

              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <p style={{ fontWeight: 700 }}>Meus grupos</p>
                  <button className="group-plus-btn" title="Novo grupo" onClick={() => setShowCreateGroup(v => !v)}>+</button>
                </div>

                {showCreateGroup && (
                  <>
                    <input className="group-input" placeholder="Nome do novo grupo" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
                    <button className="group-btn" onClick={createGroup}>Criar grupo</button>
                  </>
                )}

                {groups.length === 0 && <p className="muted">Você ainda não participa de grupos.</p>}
                {groups.map(g => (
                  <div key={g.id} style={{ marginBottom: 8 }}>
                    <button className="group-input" style={{ cursor: 'pointer', borderColor: activeGroupId === g.id ? '#22c55e' : '#2e3f5f' }} onClick={() => { setActiveGroupId(g.id); localStorage.setItem('activeGroupId', g.id) }}>
                      {g.name} {activeGroupId === g.id ? '✅' : ''}
                    </button>
                    {activeRole === 'owner' && activeGroupId === g.id && (
                      <button className="group-delete-btn" onClick={() => deleteGroup(g.id)}>Excluir grupo</button>
                    )}
                  </div>
                ))}
              </div>

              {(activeRole === 'owner' || activeRole === 'admin') && (
                <>
                  <input className="group-input" placeholder="email do amigo" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                  <button className="group-btn" onClick={inviteToGroup}>Convidar por link mágico</button>
                </>
              )}

              {activeGroupId && (
                <button className="group-btn" style={{ marginTop: 14, background: 'linear-gradient(135deg,#a78bfa,#ec4899)', color: '#fff' }} onClick={() => navigate(`/leaderboard?group=${activeGroupId}`)}>
                  Ver ranking deste grupo
                </button>
              )}

              {(activeRole === 'owner' || activeRole === 'admin') && (
                <div style={{ marginTop: 14 }}>
                  <p style={{ fontWeight: 700 }}>Membros</p>
                  {members.filter(m => m.group_id === activeGroupId).map(m => (
                    <div key={m.user_id} style={{ marginTop: 6, padding: 8, border: '1px solid #2e3f5f', borderRadius: 8 }}>
                      <div style={{ fontSize: '.88rem' }}>{m.user_email} — <b>{m.role}</b></div>
                      {activeRole === 'owner' && m.role === 'member' && (
                        <button className="group-btn" style={{ marginTop: 6, padding: 8 }} onClick={() => promoteToAdmin(m.user_id)}>Tornar admin</button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {groupMsg && <p style={{ marginTop: 10, color: '#86efac', fontSize: '.9rem' }}>{groupMsg}</p>}
              <button className="profile-close" onClick={() => setShowGroups(false)}>Fechar</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
