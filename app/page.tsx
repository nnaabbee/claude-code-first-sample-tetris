'use client'

import React from 'react'
import { useGameLogic } from './hooks/useGameLogic'
import { useBGM } from './hooks/useBGM'
import { GameBoard } from './components/GameBoard'
import { NextPiece } from './components/NextPiece'
import { HoldPiece } from './components/HoldPiece'
import { ScoreDisplay } from './components/ScoreDisplay'

export default function Home() {
  const {
    board,
    currentPiece,
    currentColor,
    nextPiece,
    holdPiece,
    canHold,
    position,
    gameOver,
    score,
    isInitialized,
    lockedCells,
    moveLeft,
    moveRight,
    moveDown,
    rotatePiece,
    hardDrop,
    holdCurrentPiece,
    renderBoard
  } = useGameLogic()
  
  const { isBGMPlaying, toggleBGM, initializeBGM } = useBGM()

  // Initialize BGM when game starts
  React.useEffect(() => {
    initializeBGM(isInitialized)
  }, [isInitialized, initializeBGM])

  // Handle keyboard input
  React.useEffect(() => {
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

  const restartGame = () => {
    window.location.reload()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
      <div style={{ display: 'flex', gap: '20px' }}>
        <HoldPiece holdPiece={holdPiece} canHold={canHold} />
        <NextPiece nextPiece={nextPiece} isInitialized={isInitialized} />
        <GameBoard 
          board={renderBoard()} 
          currentColor={currentColor} 
          lockedCells={lockedCells} 
        />
        <ScoreDisplay 
          score={score}
          gameOver={gameOver}
          isBGMPlaying={isBGMPlaying}
          onToggleBGM={toggleBGM}
          onRestart={restartGame}
        />
      </div>
    </div>
  )
}