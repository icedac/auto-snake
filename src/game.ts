const canvas = document.createElement("canvas")
canvas.width = 600
canvas.height = 600
document.body.appendChild(canvas)
const ctx = canvas.getContext("2d")!
const cellSize = 20, cols = canvas.width / cellSize, rows = canvas.height / cellSize
type Point = { x: number, y: number }
enum Direction { Up, Down, Left, Right }
function pointEqual(a: Point, b: Point): boolean { return a.x === b.x && a.y === b.y }
function manhattan(a: Point, b: Point): number { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) }
class Snake {
  id: number; body: Point[]; direction: Direction; alive: boolean; color: string
  constructor(id: number, initPos: Point, color: string) {
    this.id = id; this.body = [initPos]; this.direction = Math.floor(Math.random() * 4); this.alive = true; this.color = color
  }
  get head(): Point { return this.body[0] }
  getNextHead(dir: Direction): Point {
    let { x, y } = this.head
    if (dir === Direction.Up) y--
    else if (dir === Direction.Down) y++
    else if (dir === Direction.Left) x--
    else if (dir === Direction.Right) x++
    return { x, y }
  }
  isSafe(pt: Point, snakes: Snake[]): boolean {
    if (pt.x < 0 || pt.x >= cols || pt.y < 0 || pt.y >= rows) return false
    for (let snake of snakes) for (let seg of snake.body) if (pointEqual(pt, seg)) return false
    return true
  }
  decideDirection(foods: Point[], snakes: Snake[]): Direction {
    const dirs = [Direction.Up, Direction.Down, Direction.Left, Direction.Right]
    let safeDirs: Direction[] = []
    for (let d of dirs) { if (this.isSafe(this.getNextHead(d), snakes)) safeDirs.push(d) }
    if (safeDirs.length === 0) return this.direction
    let target = foods.length
      ? foods.reduce((a, b) => manhattan(this.head, a) < manhattan(this.head, b) ? a : b)
      : { x: Math.floor(cols / 2), y: Math.floor(rows / 2) }
    let best = safeDirs[0], bestDist = Infinity
    for (let d of safeDirs) {
      let next = this.getNextHead(d)
      let dman = manhattan(next, target)
      if (dman < bestDist) { bestDist = dman; best = d }
    }
    return best
  }
  move(newHead: Point, grow: boolean) {
    this.body.unshift(newHead)
    if (!grow) this.body.pop()
  }
}
class Game {
  snakes: Snake[]; foods: Point[]; tickInterval: number
  constructor() {
    this.snakes = [
      new Snake(1, { x: 5, y: 5 }, "red"),
      new Snake(2, { x: cols - 6, y: 5 }, "blue"),
      new Snake(3, { x: Math.floor(cols / 2), y: rows - 6 }, "green")
    ]
    this.foods = []
    this.spawnFood()
    this.tickInterval = 100
  }
  spawnFood() {
    let pt: Point
    do {
      pt = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) }
    } while (this.isOccupied(pt))
    this.foods.push(pt)
  }
  isOccupied(pt: Point): boolean {
    for (let s of this.snakes) for (let seg of s.body) if (pointEqual(pt, seg)) return true
    return false
  }
  update() {
    for (let snake of this.snakes.filter(s => s.alive)) {
      snake.direction = snake.decideDirection(this.foods, this.snakes)
      let next = snake.getNextHead(snake.direction)
      let grow = false
      for (let i = 0; i < this.foods.length; i++) {
        if (pointEqual(next, this.foods[i])) { grow = true; this.foods.splice(i, 1); this.spawnFood(); break }
      }
      if (!snake.isSafe(next, this.snakes)) { snake.alive = false; continue }
      snake.move(next, grow)
    }
  }
  draw() {
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    for (let food of this.foods) {
      ctx.fillStyle = "yellow"
      ctx.fillRect(food.x * cellSize, food.y * cellSize, cellSize, cellSize)
    }
    for (let snake of this.snakes) {
      if (!snake.alive) continue
      ctx.fillStyle = snake.color
      for (let seg of snake.body)
        ctx.fillRect(seg.x * cellSize, seg.y * cellSize, cellSize, cellSize)
    }
  }
  run() { setInterval(() => { this.update(); this.draw() }, this.tickInterval) }
}
new Game().run()
