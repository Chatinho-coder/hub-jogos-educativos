import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface GameFrameProps {
  src: string
  gameId: string
  title: string
}

export default function GameFrame({ src, gameId, title }: GameFrameProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const savedRef = useRef(false)

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'game-score' && event.data?.game === gameId && !savedRef.current) {
        savedRef.current = true
        const score = event.data.score
        if (user && score > 0) {
          try {
            await supabase.from('scores').insert({
              user_id: user.id,
              user_email: user.email!,
              game: gameId,
              score
            })
          } catch (err) {
            console.error('Error saving score:', err)
          }
        }
        // Reset after 3s so replay can save again
        setTimeout(() => { savedRef.current = false }, 3000)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [user, gameId])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100dvh' }}>
      <iframe src={src} style={{ width: '100%', height: '100%', border: 'none' }} title={title} />
      <button
        onClick={() => navigate('/')}
        title="Voltar ao Hub"
        style={{
          position: 'fixed', top: 12, left: 12, zIndex: 9999,
          background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none',
          borderRadius: '50%', width: 38, height: 38, fontSize: 16,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)', transition: 'background 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.8)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.55)')}
      >
        ←
      </button>
    </div>
  )
}
