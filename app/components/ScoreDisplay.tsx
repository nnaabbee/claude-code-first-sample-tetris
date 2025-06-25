import React from 'react'

interface ScoreDisplayProps {
  score: number
  gameOver: boolean
  isBGMPlaying: boolean
  onToggleBGM: () => void
  onRestart: () => void
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ 
  score, 
  gameOver, 
  isBGMPlaying, 
  onToggleBGM, 
  onRestart 
}) => {
  return (
    <div>
      <h2>Score: {score}</h2>
      {gameOver && (
        <div>
          <h2 style={{ color: 'red' }}>Game Over</h2>
          <button 
            onClick={onRestart}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            Restart
          </button>
        </div>
      )}
      <div>
        <button 
          onClick={onToggleBGM}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: isBGMPlaying ? '#4CAF50' : '#666',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          BGM: {isBGMPlaying ? 'ON' : 'OFF'}
        </button>
      </div>
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#ccc' }}>
        <p>操作方法:</p>
        <p>← → : 移動</p>
        <p>↓ : ソフトドロップ</p>
        <p>↑ : ハードドロップ</p>
        <p>スペース : 回転</p>
        <p>H/Shift : ホールド</p>
        <p>WASD : 代替操作</p>
      </div>
    </div>
  )
}