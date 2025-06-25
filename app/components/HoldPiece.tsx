import React from 'react'
import { Piece } from '../types/tetris'

interface HoldPieceProps {
  holdPiece: Piece | null
  canHold: boolean
}

export const HoldPiece: React.FC<HoldPieceProps> = ({ holdPiece, canHold }) => {
  return (
    <div>
      <h3 style={{ margin: '0 0 10px 0' }}>Hold {!canHold && '(Used)'}</h3>
      <div style={{ border: '2px solid #333', padding: '10px', backgroundColor: '#111' }}>
        {holdPiece ? (
          holdPiece.shape.map((row, y) => (
            <div key={y} style={{ display: 'flex' }}>
              {row.map((cell, x) => (
                <div
                  key={x}
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: cell ? holdPiece.color : 'transparent',
                    border: cell ? '1px solid #333' : 'none',
                    opacity: canHold ? 1 : 0.5
                  }}
                />
              ))}
            </div>
          ))
        ) : (
          <div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
            Empty
          </div>
        )}
      </div>
    </div>
  )
}