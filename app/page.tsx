'use client'

import { useState, useEffect, useCallback } from 'react'

type Piece = {
  shape: number[][]
  color: string
}
type Board = number[][]

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const TICK_SPEED = 500

const PIECES: Piece[] = [
  { shape: [[1, 1, 1, 1]], color: '#00ffff' }, // I - cyan
  { shape: [[1, 1], [1, 1]], color: '#ffff00' }, // O - yellow
  { shape: [[0, 1, 0], [1, 1, 1]], color: '#ff00ff' }, // T - purple
  { shape: [[1, 0, 0], [1, 1, 1]], color: '#ff7f00' }, // L - orange
  { shape: [[0, 0, 1], [1, 1, 1]], color: '#0000ff' }, // J - blue
  { shape: [[1, 1, 0], [0, 1, 1]], color: '#00ff00' }, // S - green
  { shape: [[0, 1, 1], [1, 1, 0]], color: '#ff0000' }, // Z - red
]

export default function Home() {
  const [board, setBoard] = useState<Board>(() =>
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
  )
  const [currentPiece, setCurrentPiece] = useState<Piece>(PIECES[0])
  const [currentColor, setCurrentColor] = useState<string>(PIECES[0].color)
  const [nextPiece, setNextPiece] = useState<Piece>(PIECES[1])
  const [position, setPosition] = useState({ x: 4, y: 0 })
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!isInitialized) {
      const randomPiece = PIECES[Math.floor(Math.random() * PIECES.length)]
      const randomNextPiece = PIECES[Math.floor(Math.random() * PIECES.length)]
      setCurrentPiece(randomPiece)
      setCurrentColor(randomPiece.color)
      setNextPiece(randomNextPiece)
      setIsInitialized(true)
    }
  }, [isInitialized])

  const rotate = (piece: Piece): Piece => {
    const shape = piece.shape
    const rows = shape.length
    const cols = shape[0].length
    const rotated = Array(cols).fill(null).map(() => Array(rows).fill(0))
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        rotated[j][rows - 1 - i] = shape[i][j]
      }
    }
    return { shape: rotated, color: piece.color }
  }

  const isValidMove = useCallback((piece: Piece, x: number, y: number): boolean => {
    const shape = piece.shape
    for (let py = 0; py < shape.length; py++) {
      for (let px = 0; px < shape[py].length; px++) {
        if (shape[py][px]) {
          const newX = x + px
          const newY = y + py
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT || 
              (newY >= 0 && board[newY][newX])) {
            return false
          }
        }
      }
    }
    return true
  }, [board])

  const lockPiece = useCallback(() => {
    const newBoard = board.map(row => [...row])
    const shape = currentPiece.shape
    for (let py = 0; py < shape.length; py++) {
      for (let px = 0; px < shape[py].length; px++) {
        if (shape[py][px]) {
          const boardY = position.y + py
          const boardX = position.x + px
          if (boardY >= 0) {
            // Find piece index by comparing shapes instead of object reference
            const pieceIndex = PIECES.findIndex(p => 
              JSON.stringify(p.shape) === JSON.stringify(currentPiece.shape)
            )
            newBoard[boardY][boardX] = pieceIndex + 1
          }
        }
      }
    }

    const fullRows: number[] = []
    newBoard.forEach((row, index) => {
      if (row.every(cell => cell !== 0)) {
        fullRows.push(index)
      }
    })
    
    const clearedBoard = newBoard.filter((_, index) => !fullRows.includes(index))
    const clearedLines = fullRows.length
    
    for (let i = 0; i < clearedLines; i++) {
      clearedBoard.unshift(Array(BOARD_WIDTH).fill(0))
    }

    if (clearedLines > 0) {
      if (clearedLines === 4) {
        setScore(prev => prev + 1000)
      } else {
        setScore(prev => prev + clearedLines * 100)
      }
    }

    setBoard(clearedBoard)
    setCurrentPiece(nextPiece)
    setCurrentColor(nextPiece.color)
    setNextPiece(PIECES[Math.floor(Math.random() * PIECES.length)])
    setPosition({ x: 4, y: 0 })

    if (!isValidMove(nextPiece, 4, 0)) {
      setGameOver(true)
    }
  }, [board, currentPiece, position, isValidMove])

  const moveDown = useCallback(() => {
    if (isValidMove(currentPiece, position.x, position.y + 1)) {
      setPosition(prev => ({ ...prev, y: prev.y + 1 }))
    } else {
      lockPiece()
    }
  }, [currentPiece, position, isValidMove, lockPiece])

  const moveLeft = useCallback(() => {
    if (isValidMove(currentPiece, position.x - 1, position.y)) {
      setPosition(prev => ({ ...prev, x: prev.x - 1 }))
    }
  }, [currentPiece, position, isValidMove])

  const moveRight = useCallback(() => {
    if (isValidMove(currentPiece, position.x + 1, position.y)) {
      setPosition(prev => ({ ...prev, x: prev.x + 1 }))
    }
  }, [currentPiece, position, isValidMove])

  const rotatePiece = useCallback(() => {
    const rotated = rotate(currentPiece)
    if (isValidMove(rotated, position.x, position.y)) {
      setCurrentPiece(rotated)
    }
  }, [currentPiece, position, isValidMove])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return
      
      switch (e.key) {
        case 'ArrowLeft':
          moveLeft()
          break
        case 'ArrowRight':
          moveRight()
          break
        case 'ArrowDown':
          moveDown()
          break
        case ' ':
          rotatePiece()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [moveLeft, moveRight, moveDown, rotatePiece, gameOver])

  useEffect(() => {
    if (gameOver) return
    
    const interval = setInterval(() => {
      moveDown()
    }, TICK_SPEED)

    return () => clearInterval(interval)
  }, [moveDown, gameOver])

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row])
    const shape = currentPiece.shape
    
    for (let py = 0; py < shape.length; py++) {
      for (let px = 0; px < shape[py].length; px++) {
        if (shape[py][px]) {
          const boardY = position.y + py
          const boardX = position.x + px
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            displayBoard[boardY][boardX] = -1
          }
        }
      }
    }

    return displayBoard
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
      {gameOver && <h1 style={{ color: 'red' }}>Game Over</h1>}
      <div style={{ display: 'flex', gap: '20px' }}>
        <div>
          <h3 style={{ margin: '0 0 10px 0' }}>Next</h3>
          <div style={{ border: '2px solid #333', padding: '10px', backgroundColor: '#111' }}>
            {nextPiece.shape.map((row, y) => (
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
        <div style={{ border: '2px solid #333', display: 'inline-block' }}>
          {renderBoard().map((row, y) => (
            <div key={y} style={{ display: 'flex' }}>
              {row.map((cell, x) => (
                <div
                  key={x}
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: cell === 0 ? '#111' : cell === -1 ? currentColor : PIECES[cell - 1]?.color || '#999',
                    border: '1px solid #333'
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <div>
          <h3 style={{ margin: '0 0 10px 0' }}>Score</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{score}</div>
        </div>
      </div>
      <p style={{ marginTop: '10px' }}>Arrow Keys: Move | Space: Rotate</p>
    </div>
  )
}