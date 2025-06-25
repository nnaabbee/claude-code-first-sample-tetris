import { useState, useCallback } from 'react'
import { PIECES } from '../types/tetris'

export const usePieceGeneration = () => {
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

  const getNextPieceFromBag = useCallback((): { 
    pieceIndex: number
    newBag: number[]
    newNextBag: number[] 
  } => {
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

  const initializeBags = useCallback(() => {
    const firstBag = createNewBag()
    const secondBag = createNewBag()
    
    // Get first two pieces
    const firstPieceIndex = firstBag.shift()!
    const secondPieceIndex = firstBag.shift()!
    
    setPieceBag(firstBag)
    setNextPieceBag(secondBag)
    
    return {
      currentPiece: PIECES[firstPieceIndex],
      nextPiece: PIECES[secondPieceIndex]
    }
  }, [createNewBag])

  const updateBags = useCallback((newBag: number[], newNextBag: number[]) => {
    setPieceBag(newBag)
    setNextPieceBag(newNextBag)
  }, [])

  return {
    getNextPieceFromBag,
    initializeBags,
    updateBags,
    pieceBag,
    nextPieceBag
  }
}