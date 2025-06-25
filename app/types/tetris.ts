export type Piece = {
  shape: number[][]
  color: string
  id: number
}

export type Board = number[][]

export type Position = {
  x: number
  y: number
}

export type GameState = {
  board: Board
  currentPiece: Piece
  currentColor: string
  nextPiece: Piece
  holdPiece: Piece | null
  canHold: boolean
  position: Position
  gameOver: boolean
  score: number
  isInitialized: boolean
  lockedCells: Set<string>
}

export const PIECES: Piece[] = [
  { shape: [[1, 1, 1, 1]], color: '#00ffff', id: 0 }, // I - cyan
  { shape: [[1, 1], [1, 1]], color: '#ffff00', id: 1 }, // O - yellow
  { shape: [[0, 1, 0], [1, 1, 1]], color: '#ff00ff', id: 2 }, // T - purple
  { shape: [[1, 0, 0], [1, 1, 1]], color: '#ff7f00', id: 3 }, // L - orange
  { shape: [[0, 0, 1], [1, 1, 1]], color: '#0000ff', id: 4 }, // J - blue
  { shape: [[1, 1, 0], [0, 1, 1]], color: '#00ff00', id: 5 }, // S - green
  { shape: [[0, 1, 1], [1, 1, 0]], color: '#ff0000', id: 6 }, // Z - red
]

export const BOARD_WIDTH = 10
export const BOARD_HEIGHT = 20
export const TICK_SPEED = 500