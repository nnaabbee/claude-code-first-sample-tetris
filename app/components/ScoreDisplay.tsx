import React from 'react'

interface ScoreDisplayProps {
  score: number
  gameOver: boolean
  isPaused: boolean
  isBGMPlaying: boolean
  onToggleBGM: () => void
  onTogglePause: () => void
  onRestart: () => void
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ 
  score, 
  gameOver, 
  isPaused,
  isBGMPlaying, 
  onToggleBGM, 
  onTogglePause,
  onRestart 
}) => {
  return (
    <div>
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Score: {score}</h2>
      {gameOver && (
        <div>
          <h2 style={{ color: 'red', fontSize: '24px' }}>Game Over</h2>
          <button 
            onClick={onRestart}
            style={{
              padding: '12px 24px',
              fontSize: '18px',
              backgroundColor: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginBottom: '15px'
            }}
          >
            Restart
          </button>
        </div>
      )}
      {!gameOver && (
        <div style={{ marginBottom: '10px' }}>
          <button 
            onClick={onTogglePause}
            style={{
              padding: '12px 24px',
              fontSize: '18px',
              backgroundColor: isPaused ? '#FF9800' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginBottom: '15px'
            }}
          >
            {isPaused ? '再開' : '一時停止'}
          </button>
        </div>
      )}
      <div>
        <button 
          onClick={onToggleBGM}
          style={{
            padding: '12px 24px',
            fontSize: '18px',
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
      <div style={{ marginTop: '30px', fontSize: '16px', color: '#ccc' }}>
        <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>操作方法:</p>
        <p>← → : 移動</p>
        <p>↓ : ソフトドロップ</p>
        <p>↑ : ハードドロップ</p>
        <p>スペース : 回転</p>
        <p>H/Shift : ホールド</p>
        <p>P : 一時停止/再開</p>
        <p>WASD : 代替操作</p>
      </div>
    </div>
  )
}