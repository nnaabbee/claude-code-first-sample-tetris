import React from 'react'
import { PIECES } from '../types/tetris'

interface GameBoardProps {
  board: number[][]
  currentColor: string
  lockedCells: Set<string>
}

export const GameBoard: React.FC<GameBoardProps> = ({ board, currentColor, lockedCells }) => {
  return (
    <div style={{ border: '2px solid #333', display: 'inline-block' }}>
      {board.map((row, y) => (
        <div key={y} style={{ display: 'flex' }}>
          {row.map((cell, x) => (
            <div
              key={x}
              style={{
                width: '30px',
                height: '30px',
                backgroundColor: cell === 0 ? '#111' : cell === -1 ? currentColor : PIECES[cell - 1]?.color || '#999',
                border: '1px solid #333',
                boxShadow: lockedCells.has(`${x}-${y}`) ? '0 0 15px #fff, inset 0 0 15px #fff' : 'none',
                transform: lockedCells.has(`${x}-${y}`) ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.2s ease'
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}