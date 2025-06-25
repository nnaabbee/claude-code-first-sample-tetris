import { useState, useCallback, useEffect } from 'react'
import { Piece, Board, Position, PIECES, BOARD_WIDTH, BOARD_HEIGHT, TICK_SPEED } from '../types/tetris'
import { usePieceGeneration } from './usePieceGeneration'
import { useSE } from './useSE'

export const useGameLogic = () => {
  const [board, setBoard] = useState<Board>(() =>
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
  )
  const [currentPiece, setCurrentPiece] = useState<Piece>(PIECES[0])
  const [currentColor, setCurrentColor] = useState<string>(PIECES[0].color)
  const [nextPiece, setNextPiece] = useState<Piece>(PIECES[1])
  const [holdPiece, setHoldPiece] = useState<Piece | null>(null)
  const [canHold, setCanHold] = useState(true)
  const [position, setPosition] = useState<Position>({ x: 4, y: 0 })
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)
  const [lockedCells, setLockedCells] = useState<Set<string>>(new Set())

  const { getNextPieceFromBag, initializeBags, updateBags } = usePieceGeneration()
  const { playLockSound } = useSE()

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('tetris-high-score')
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10))
    }
  }, [])

  // Save high score to localStorage when game over
  useEffect(() => {
    if (gameOver && score > 0) {
      if (score > highScore) {
        setHighScore(score)
        localStorage.setItem('tetris-high-score', score.toString())
      }
    }
  }, [gameOver, score, highScore])

  // Initialize game
  useEffect(() => {
    if (!isInitialized) {
      const { currentPiece: initCurrentPiece, nextPiece: initNextPiece } = initializeBags()
      setCurrentPiece(initCurrentPiece)
      setCurrentColor(initCurrentPiece.color)
      setNextPiece(initNextPiece)
      setIsInitialized(true)
    }
  }, [isInitialized, initializeBags])

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
            newBoard[boardY][boardX] = currentPiece.id + 1
            newLockedCells.add(`${boardX}-${boardY}`)
          }
        }
      }
    }
    
    playLockSound()
    setLockedCells(newLockedCells)
    setTimeout(() => setLockedCells(new Set()), 200)

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
    
    const { pieceIndex, newBag, newNextBag } = getNextPieceFromBag()
    setNextPiece(PIECES[pieceIndex])
    updateBags(newBag, newNextBag)
    
    setPosition({ x: 4, y: 0 })
    setCanHold(true)

    if (!isValidMove(nextPiece, 4, 0)) {
      setGameOver(true)
    }
  }, [board, currentPiece, position, isValidMove, nextPiece, playLockSound, getNextPieceFromBag, updateBags])

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
            newLockedCells.add(`${boardX}-${boardY}`)
          }
        }
      }
    }
    
    playLockSound()
    setLockedCells(newLockedCells)
    setTimeout(() => setLockedCells(new Set()), 200)

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
    
    const { pieceIndex, newBag, newNextBag } = getNextPieceFromBag()
    setNextPiece(PIECES[pieceIndex])
    updateBags(newBag, newNextBag)
    
    setPosition({ x: 4, y: 0 })
    setCanHold(true)

    if (!isValidMove(nextPiece, 4, 0)) {
      setGameOver(true)
    }
  }, [currentPiece, position, board, isValidMove, nextPiece, playLockSound, getNextPieceFromBag, updateBags])

  const holdCurrentPiece = useCallback(() => {
    if (!canHold) return
    
    if (holdPiece === null) {
      setHoldPiece(currentPiece)
      setCurrentPiece(nextPiece)
      setCurrentColor(nextPiece.color)
      
      const { pieceIndex, newBag, newNextBag } = getNextPieceFromBag()
      setNextPiece(PIECES[pieceIndex])
      updateBags(newBag, newNextBag)
    } else {
      const temp = currentPiece
      setCurrentPiece(holdPiece)
      setCurrentColor(holdPiece.color)
      setHoldPiece(temp)
    }
    
    setPosition({ x: 4, y: 0 })
    setCanHold(false)
  }, [canHold, holdPiece, currentPiece, nextPiece, getNextPieceFromBag, updateBags])

  const togglePause = useCallback(() => {
    if (gameOver) return
    setIsPaused(prev => !prev)
  }, [gameOver])

  // Auto-fall logic
  useEffect(() => {
    if (gameOver || !isInitialized || isPaused) return
    
    const interval = setInterval(() => {
      moveDown()
    }, TICK_SPEED)

    return () => clearInterval(interval)
  }, [moveDown, gameOver, isInitialized, isPaused])

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

  return {
    // State
    board,
    currentPiece,
    currentColor,
    nextPiece,
    holdPiece,
    canHold,
    position,
    gameOver,
    isPaused,
    score,
    highScore,
    isInitialized,
    lockedCells,
    
    // Actions
    moveLeft,
    moveRight,
    moveDown,
    rotatePiece,
    hardDrop,
    holdCurrentPiece,
    togglePause,
    
    // Render
    renderBoard
  }
}