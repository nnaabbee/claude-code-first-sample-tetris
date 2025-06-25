import React from 'react'
import { Piece } from '../types/tetris'

interface NextPieceProps {
  nextPiece: Piece
  isInitialized: boolean
}

export const NextPiece: React.FC<NextPieceProps> = ({ nextPiece, isInitialized }) => {
  return (
    <div>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '20px' }}>Next</h3>
      <div style={{ 
        border: '2px solid #333', 
        padding: '15px', 
        backgroundColor: '#111',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: '120px',
        minHeight: '100px'
      }}>
        {isInitialized && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {nextPiece.shape.map((row, y) => (
              <div key={y} style={{ display: 'flex' }}>
                {row.map((cell, x) => (
                  <div
                    key={x}
                    style={{
                      width: '30px',
                      height: '30px',
                      backgroundColor: cell ? nextPiece.color : 'transparent',
                      border: cell ? '1px solid #333' : 'none'
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}