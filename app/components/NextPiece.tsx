import React from 'react'
import { Piece } from '../types/tetris'

interface NextPieceProps {
  nextPiece: Piece
  isInitialized: boolean
}

export const NextPiece: React.FC<NextPieceProps> = ({ nextPiece, isInitialized }) => {
  return (
    <div>
      <h3 style={{ margin: '0 0 10px 0' }}>Next</h3>
      <div style={{ border: '2px solid #333', padding: '10px', backgroundColor: '#111' }}>
        {isInitialized && nextPiece.shape.map((row, y) => (
          <div key={y} style={{ display: 'flex' }}>
            {row.map((cell, x) => (
              <div
                key={x}
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: cell ? nextPiece.color : 'transparent',
                  border: cell ? '1px solid #333' : 'none'
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}