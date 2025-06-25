'use client'

import { useState, useEffect, useCallback } from 'react'

type Piece = {
  shape: number[][]
  color: string
  id: number
}
type Board = number[][]

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const TICK_SPEED = 500

const PIECES: Piece[] = [
  { shape: [[1, 1, 1, 1]], color: '#00ffff', id: 0 }, // I - cyan
  { shape: [[1, 1], [1, 1]], color: '#ffff00', id: 1 }, // O - yellow
  { shape: [[0, 1, 0], [1, 1, 1]], color: '#ff00ff', id: 2 }, // T - purple
  { shape: [[1, 0, 0], [1, 1, 1]], color: '#ff7f00', id: 3 }, // L - orange
  { shape: [[0, 0, 1], [1, 1, 1]], color: '#0000ff', id: 4 }, // J - blue
  { shape: [[1, 1, 0], [0, 1, 1]], color: '#00ff00', id: 5 }, // S - green
  { shape: [[0, 1, 1], [1, 1, 0]], color: '#ff0000', id: 6 }, // Z - red
]

export default function Home() {
  const [board, setBoard] = useState<Board>(() =>
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
  )
  const [currentPiece, setCurrentPiece] = useState<Piece>(PIECES[0])
  const [currentColor, setCurrentColor] = useState<string>(PIECES[0].color)
  const [nextPiece, setNextPiece] = useState<Piece>(PIECES[1])
  const [holdPiece, setHoldPiece] = useState<Piece | null>(null)
  const [canHold, setCanHold] = useState(true)
  const [position, setPosition] = useState({ x: 4, y: 0 })
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)
  const [lockedCells, setLockedCells] = useState<Set<string>>(new Set())
  const [isBGMPlaying, setIsBGMPlaying] = useState(true)
  const [bgmInterval, setBgmInterval] = useState<NodeJS.Timeout | null>(null)
  const [pieceBag, setPieceBag] = useState<number[]>([])
  const [nextPieceBag, setNextPieceBag] = useState<number[]>([])

  // 7-bag system for uniform piece distribution
  const createNewBag = useCallback((): number[] => {
    const bag = [0, 1, 2, 3, 4, 5, 6] // All 7 piece types
    // Shuffle the bag using Fisher-Yates algorithm
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[bag[i], bag[j]] = [bag[j], bag[i]]
    }
    return bag
  }, [])

  const getNextPieceFromBag = useCallback((): { pieceIndex: number, newBag: number[], newNextBag: number[] } => {
    let currentBag = [...pieceBag]
    let nextBag = [...nextPieceBag]
    
    // If current bag is empty, create a new one
    if (currentBag.length === 0) {
      currentBag = createNewBag()
    }
    
    // If next bag is empty, create a new one
    if (nextBag.length === 0) {
      nextBag = createNewBag()
    }
    
    // Take the next piece from current bag
    const pieceIndex = currentBag.shift()!
    
    return { pieceIndex, newBag: currentBag, newNextBag: nextBag }
  }, [pieceBag, nextPieceBag, createNewBag])

  useEffect(() => {
    if (!isInitialized) {
      // Initialize with bag system
      const firstBag = createNewBag()
      const secondBag = createNewBag()
      
      // Get first two pieces
      const firstPieceIndex = firstBag.shift()!
      const secondPieceIndex = firstBag.shift()!
      
      setCurrentPiece(PIECES[firstPieceIndex])
      setCurrentColor(PIECES[firstPieceIndex].color)
      setNextPiece(PIECES[secondPieceIndex])
      setPieceBag(firstBag)
      setNextPieceBag(secondBag)
      setIsInitialized(true)
    }
  }, [isInitialized, createNewBag])

  const playLockSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Create a "click" sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1)
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.15)
    } catch (error) {
      // Fallback for browsers that don't support Web Audio API
      console.log('Audio not supported')
    }
  }, [])

  const playBGMNote = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // テトリス風のメロディー
      const melody = [523.25, 587.33, 659.25, 698.46, 783.99, 659.25, 587.33, 523.25] // C-D-E-F-G-E-D-C
      const noteIndex = Math.floor(Date.now() / 500) % melody.length
      
      oscillator.type = 'square'
      oscillator.frequency.setValueAtTime(melody[noteIndex], audioContext.currentTime)
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.005, audioContext.currentTime + 0.05)
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.log('BGM note not supported')
    }
  }, [])

  const startBGM = useCallback(() => {
    // Stop any existing interval first
    if (bgmInterval) {
      clearInterval(bgmInterval)
      setBgmInterval(null)
    }
    
    // Play first note immediately
    playBGMNote()
    
    // Then play every 500ms
    const interval = setInterval(() => {
      playBGMNote()
    }, 500)
    
    setBgmInterval(interval)
  }, [playBGMNote, bgmInterval])

  const stopBGM = useCallback(() => {
    if (bgmInterval) {
      clearInterval(bgmInterval)
      setBgmInterval(null)
    }
  }, [bgmInterval])


  const toggleBGM = useCallback(() => {
    if (isBGMPlaying) {
      // Stop BGM
      stopBGM()
      setIsBGMPlaying(false)
    } else {
      // Start BGM
      setIsBGMPlaying(true)
      // Use setTimeout to ensure state is updated before starting BGM
      setTimeout(() => {
        startBGM()
      }, 50)
    }
  }, [isBGMPlaying, stopBGM, startBGM])

  // Auto-start BGM when game initializes
  useEffect(() => {
    if (isInitialized && isBGMPlaying && !bgmInterval) {
      startBGM()
    }
  }, [isInitialized, isBGMPlaying, bgmInterval, startBGM])

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
    return { shape: rotated, color: piece.color, id: piece.id }
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
    const newLockedCells = new Set<string>()
    
    for (let py = 0; py < shape.length; py++) {
      for (let px = 0; px < shape[py].length; px++) {
        if (shape[py][px]) {
          const boardY = position.y + py
          const boardX = position.x + px
          if (boardY >= 0) {
            // Use the piece ID to identify the piece type
            newBoard[boardY][boardX] = currentPiece.id + 1
            // Add to locked cells for visual effect
            newLockedCells.add(`${boardX}-${boardY}`)
          }
        }
      }
    }
    
    // Play lock sound
    playLockSound()
    
    // Show visual feedback for locked cells
    setLockedCells(newLockedCells)
    setTimeout(() => setLockedCells(new Set()), 200) // Clear effect after 200ms

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
    
    // Use bag system for next piece
    const { pieceIndex, newBag, newNextBag } = getNextPieceFromBag()
    setNextPiece(PIECES[pieceIndex])
    setPieceBag(newBag)
    setNextPieceBag(newNextBag)
    
    setPosition({ x: 4, y: 0 })
    setCanHold(true) // Reset hold ability after piece is locked

    if (!isValidMove(nextPiece, 4, 0)) {
      setGameOver(true)
    }
  }, [board, currentPiece, position, isValidMove, nextPiece, playLockSound, getNextPieceFromBag])

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

  const hardDrop = useCallback(() => {
    let newY = position.y
    while (isValidMove(currentPiece, position.x, newY + 1)) {
      newY++
    }
    
    // Update position and lock piece with the new position
    const newBoard = board.map(row => [...row])
    const shape = currentPiece.shape
    const newLockedCells = new Set<string>()
    
    for (let py = 0; py < shape.length; py++) {
      for (let px = 0; px < shape[py].length; px++) {
        if (shape[py][px]) {
          const boardY = newY + py
          const boardX = position.x + px
          if (boardY >= 0) {
            newBoard[boardY][boardX] = currentPiece.id + 1
            // Add to locked cells for visual effect
            newLockedCells.add(`${boardX}-${boardY}`)
          }
        }
      }
    }
    
    // Play lock sound
    playLockSound()
    
    // Show visual feedback for locked cells
    setLockedCells(newLockedCells)
    setTimeout(() => setLockedCells(new Set()), 200) // Clear effect after 200ms

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
    
    // Use bag system for next piece
    const { pieceIndex, newBag, newNextBag } = getNextPieceFromBag()
    setNextPiece(PIECES[pieceIndex])
    setPieceBag(newBag)
    setNextPieceBag(newNextBag)
    
    setPosition({ x: 4, y: 0 })
    setCanHold(true) // Reset hold ability after hard drop

    if (!isValidMove(nextPiece, 4, 0)) {
      setGameOver(true)
    }
  }, [currentPiece, position, board, isValidMove, nextPiece, playLockSound, getNextPieceFromBag])

  const holdCurrentPiece = useCallback(() => {
    if (!canHold) return
    
    if (holdPiece === null) {
      // First time holding - store current piece and get next piece
      setHoldPiece(currentPiece)
      setCurrentPiece(nextPiece)
      setCurrentColor(nextPiece.color)
      
      // Use bag system for next piece
      const { pieceIndex, newBag, newNextBag } = getNextPieceFromBag()
      setNextPiece(PIECES[pieceIndex])
      setPieceBag(newBag)
      setNextPieceBag(newNextBag)
    } else {
      // Swap current piece with held piece
      const temp = currentPiece
      setCurrentPiece(holdPiece)
      setCurrentColor(holdPiece.color)
      setHoldPiece(temp)
    }
    
    setPosition({ x: 4, y: 0 })
    setCanHold(false) // Prevent holding again until next piece
  }, [canHold, holdPiece, currentPiece, nextPiece, getNextPieceFromBag])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver || !isInitialized) return
      
      switch (e.key) {
        case 'a':
        case 'A':
        case 'ArrowLeft':
          moveLeft()
          break
        case 'd':
        case 'D':
        case 'ArrowRight':
          moveRight()
          break
        case 's':
        case 'S':
        case 'ArrowDown':
          moveDown()
          break
        case 'w':
        case 'W':
        case 'ArrowUp':
          hardDrop()
          break
        case ' ':
          rotatePiece()
          break
        case 'h':
        case 'H':
        case 'Shift':
          holdCurrentPiece()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [moveLeft, moveRight, moveDown, hardDrop, rotatePiece, holdCurrentPiece, gameOver, isInitialized])

  useEffect(() => {
    if (gameOver || !isInitialized) return
    
    const interval = setInterval(() => {
      moveDown()
    }, TICK_SPEED)

    return () => clearInterval(interval)
  }, [moveDown, gameOver, isInitialized])

  // Clean up BGM on component unmount or game over
  useEffect(() => {
    if (gameOver) {
      stopBGM()
    }
  }, [gameOver, stopBGM])

  useEffect(() => {
    return () => {
      stopBGM()
    }
  }, [stopBGM])

  const renderBoard = () => {
    if (!isInitialized) {
      return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
    }
    
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
          <h3 style={{ margin: '0 0 10px 0' }}>Hold</h3>
          <div style={{ border: '2px solid #333', padding: '10px', backgroundColor: '#111', minHeight: '80px', minWidth: '80px' }}>
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
              <div style={{ color: '#666', fontSize: '12px', textAlign: 'center', paddingTop: '30px' }}>Empty</div>
            )}
          </div>
        </div>
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
                    border: '1px solid #333',
                    boxShadow: lockedCells.has(`${x}-${y}`) ? '0 0 10px #fff, inset 0 0 10px #fff' : 'none',
                    transform: lockedCells.has(`${x}-${y}`) ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <div>
          <h3 style={{ margin: '0 0 10px 0' }}>Score</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{score}</div>
          <button
            onClick={toggleBGM}
            style={{
              marginTop: '20px',
              padding: '10px 15px',
              backgroundColor: isBGMPlaying ? '#4CAF50' : '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              minWidth: '80px'
            }}
          >
            🎵 {isBGMPlaying ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
      <p style={{ marginTop: '10px' }}>Arrow Keys: Move | Up: Hard Drop | Space: Rotate | H/Shift: Hold</p>
    </div>
  )
}