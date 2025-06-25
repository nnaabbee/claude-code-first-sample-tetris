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
                backgroundColor: cell === 0 || cell === -2 ? '#111' : cell === -1 ? currentColor : PIECES[cell - 1]?.color || '#999',
                border: cell === -2 ? '1px solid #ff8c00' : '1px solid #333',
                boxShadow: cell === -2 ? 'inset 0 0 0 1px #ff8c00' : lockedCells.has(`${x}-${y}`) ? '0 0 15px #fff, inset 0 0 15px #fff' : 'none',
                transform: lockedCells.has(`${x}-${y}`) ? 'scale(1.1)' : 'scale(1)',
                transition: lockedCells.has(`${x}-${y}`) ? 'all 0.2s ease' : 'none',
                opacity: cell === -2 ? 0.5 : 1
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}