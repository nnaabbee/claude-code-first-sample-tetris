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
    isPaused,
    score,
    isInitialized,
    lockedCells,
    moveLeft,
    moveRight,
    moveDown,
    rotatePiece,
    hardDrop,
    holdCurrentPiece,
    togglePause,
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
      
      // Allow pause/resume even when paused
      if (e.key === 'p' || e.key === 'P') {
        togglePause()
        return
      }
      
      // Block other controls when paused
      if (isPaused) return
      
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
  }, [moveLeft, moveRight, moveDown, hardDrop, rotatePiece, holdCurrentPiece, togglePause, gameOver, isInitialized, isPaused])

  const restartGame = () => {
    window.location.reload()
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#000',
      margin: 0,
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
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
          isPaused={isPaused}
          isBGMPlaying={isBGMPlaying}
          onToggleBGM={toggleBGM}
          onTogglePause={togglePause}
          onRestart={restartGame}
        />
      </div>
    </div>
  )
}