import React from 'react'
import { Piece } from '../types/tetris'

interface HoldPieceProps {
  holdPiece: Piece | null
  canHold: boolean
}

export const HoldPiece: React.FC<HoldPieceProps> = ({ holdPiece, canHold }) => {
  return (
    <div>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '20px' }}>Hold {!canHold && '(Used)'}</h3>
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
        {holdPiece ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {holdPiece.shape.map((row, y) => (
              <div key={y} style={{ display: 'flex' }}>
                {row.map((cell, x) => (
                  <div
                    key={x}
                    style={{
                      width: '30px',
                      height: '30px',
                      backgroundColor: cell ? holdPiece.color : 'transparent',
                      border: cell ? '1px solid #333' : 'none',
                      opacity: canHold ? 1 : 0.5
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#666', fontSize: '16px' }}>
            Empty
          </div>
        )}
      </div>
    </div>
  )
}