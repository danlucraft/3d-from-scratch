var PIXEL_WIDTH  = 160
var PIXEL_HEIGHT = 120

var WIN_WIDTH  = window.innerWidth
var WIN_HEIGHT = window.innerHeight

var ratio_width  = WIN_WIDTH / PIXEL_WIDTH
var ratio_height = WIN_HEIGHT / PIXEL_HEIGHT
var pixel_size = Math.floor(Math.min(ratio_width, ratio_height))

var canvas = document.getElementById("canvas") as HTMLCanvasElement
canvas.width = PIXEL_WIDTH * pixel_size
canvas.height = PIXEL_HEIGHT * pixel_size

var ctx = canvas.getContext("2d")


interface Point2D {
  x: number,
  y: number
}

interface Point {
  x: number,
  y: number,
  z: number
}

interface Vector {
  x: number,
  y: number,
  z: number
}

interface Model {
  points: Point[],
  edges: Edge[]
}

type Edge = number[]

var cubeModel: Model = {
  points: [
	  { x: 50,  y: 50,  z: 50},
	  { x: 50,  y: 50,  z: -50},
	  { x: 50,  y: -50, z: 50},
	  { x: -50, y: 50,  z: 50},
	  { x: 50,  y: -50, z: -50},
	  { x: -50, y: 50,  z: -50},
	  { x: -50, y: -50, z: 50}, 
	  { x: -50, y: -50, z: -50}
	],
  edges: [
	  [0, 1],
	  [0, 2],
	  [0, 3],
	  [1, 4],
	  [1, 5],
	  [2, 4],
	  [2, 6],
	  [3, 5],
	  [3, 6],
	  [4, 7],
	  [5, 7],
	  [6, 7],
	]
}

interface Instance {
  model: Model,
  location: Point
}

var objects: Instance[] = [
  {model: cubeModel, location: {x: 0, y: 0, z: 400}},
  
  {model: cubeModel, location: {x: 150, y: 0, z: 500}},
  {model: cubeModel, location: {x: -150, y: 0, z: 500}},

  {model: cubeModel, location: {x: 300, y: -300, z: 500}},
  {model: cubeModel, location: {x: 150, y: -300, z: 500}},
  {model: cubeModel, location: {x: 0, y: -300, z: 500}},
  {model: cubeModel, location: {x: -150, y: -300, z: 500}},
  {model: cubeModel, location: {x: -300, y: -300, z: 500}},

  {model: cubeModel, location: {x: 300, y: -150, z: 500}},
  {model: cubeModel, location: {x: 150, y: -150, z: 500}},
  {model: cubeModel, location: {x: 0, y: -150, z: 500}},
  {model: cubeModel, location: {x: -150, y: -150, z: 500}},
  {model: cubeModel, location: {x: -300, y: -150, z: 500}},

  {model: cubeModel, location: {x: 300, y: +150, z: 500}},
  {model: cubeModel, location: {x: 150, y: +150, z: 500}},
  {model: cubeModel, location: {x: 0, y: +150, z: 500}},
  {model: cubeModel, location: {x: -150, y: +150, z: 500}},
  {model: cubeModel, location: {x: -300, y: +150, z: 500}},

  {model: cubeModel, location: {x: 300, y: +300, z: 500}},
  {model: cubeModel, location: {x: 150, y: +300, z: 500}},
  {model: cubeModel, location: {x: 0, y: +300, z: 500}},
  {model: cubeModel, location: {x: -150, y: +300, z: 500}},
  {model: cubeModel, location: {x: -300, y: +300, z: 500}},
]

var keyState = {
  up: false,
  down: false,
  left: false,
  right: false,
}

document.addEventListener('keydown', function(e) {
  var keyName = e.key || e["keyIdentifier"] // Chrome vs Safari
  if (keyName == "ArrowUp"    || keyName == "Up")    keyState.up = true
  if (keyName == "ArrowDown"  || keyName == "Down")  keyState.down = true
  if (keyName == "ArrowLeft"  || keyName == "Left")  keyState.left = true
  if (keyName == "ArrowRight" || keyName == "Right")  keyState.right = true
})

document.addEventListener('keyup', function(e) {
  var keyName = e.key || e["keyIdentifier"] 
  if (keyName == "ArrowUp"    || keyName == "Up")    keyState.up = false
  if (keyName == "ArrowDown"  || keyName == "Down")  keyState.down = false
  if (keyName == "ArrowLeft"  || keyName == "Left")  keyState.left = false
  if (keyName == "ArrowRight" || keyName == "Right") keyState.right = false
})

var screen_dist = 100
var transform = {x: 0, y: 0, z: 0}

function setPixel(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  if (x > 0 && x < PIXEL_WIDTH && y > 0 && y < PIXEL_HEIGHT)
    ctx.fillRect(x*pixel_size, y*pixel_size, pixel_size, pixel_size)
}

function drawPoint3d(ctx: CanvasRenderingContext2D, p: Point): void {
  var x = Math.round(p.x * (screen_dist / p.z))
  var y = Math.round(p.y * (screen_dist / p.z))
  setPixel(ctx, x + PIXEL_WIDTH/2, y + PIXEL_HEIGHT/2)
}

function drawLine(ctx: CanvasRenderingContext2D, p: Point2D, q: Point2D): void {
  // ensure line from left to right
  if (q.x < p.x) {
    var t = p
    p = q
    q = t
  }

  var x = p.x
  var y = p.y
  var s = (q.x - p.x) / (q.y - p.y)
  if ((s > 0 && s <= 1) || (s == 0 && q.y > p.y)) {
    while (y <= q.y) {
      setPixel(ctx, Math.round(x), y)
      y++
      x += s
    }
  } else if ((s < 0 && s >= -1) || (s == 0 && q.y < p.y)) {
    while (y >= q.y) {
      setPixel(ctx, Math.round(x), y)
      y--
      x -= s
    }
  } else if (s < -1) {
    while (x <= q.x) {
      setPixel(ctx, x, Math.round(y))
      x++
      y += 1/s
    }
  } else if (s > 1) {
    while (x <= q.x) {
      setPixel(ctx, x, Math.round(y))
      x++
      y += 1/s
    }
  }
}

function drawLine3d(ctx: CanvasRenderingContext2D, p1: Point, p2: Point): void {
  var x1 = Math.round(p1.x * (screen_dist / p1.z))
  var y1 = Math.round(p1.y * (screen_dist / p1.z))
  var x2 = Math.round(p2.x * (screen_dist / p2.z))
  var y2 = Math.round(p2.y * (screen_dist / p2.z))
  drawLine(ctx, 
           {x:x1 + PIXEL_WIDTH/2, y:y1 + PIXEL_HEIGHT/2}, 
           {x:x2 + PIXEL_WIDTH/2, y:y2 + PIXEL_HEIGHT/2})
}

function drawDemoLines(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "yellow"
  drawLine(ctx, {x: 10, y: 60}, {x: 10, y: 100})
  drawLine(ctx, {x: 10, y: 60}, {x: 20, y: 100})
  drawLine(ctx, {x: 10, y: 60}, {x: 30, y: 100})
  drawLine(ctx, {x: 10, y: 60}, {x: 40, y: 100})
  drawLine(ctx, {x: 10, y: 60}, {x: 50, y: 100})

  ctx.fillStyle = "red"
  drawLine(ctx, {x: 10, y: 60}, {x: 10, y: 20})
  drawLine(ctx, {x: 10, y: 60}, {x: 20, y: 20})
  drawLine(ctx, {x: 10, y: 60}, {x: 30, y: 20})
  drawLine(ctx, {x: 10, y: 60}, {x: 40, y: 20})
  drawLine(ctx, {x: 10, y: 60}, {x: 50, y: 20})

  ctx.fillStyle = "green"
  drawLine(ctx, {x: 10, y: 60}, {x: 50, y: 30})
  drawLine(ctx, {x: 10, y: 60}, {x: 50, y: 40})
  drawLine(ctx, {x: 10, y: 60}, {x: 50, y: 50})
  drawLine(ctx, {x: 10, y: 60}, {x: 50, y: 60})

  ctx.fillStyle = "purple"
  drawLine(ctx, {x: 10, y: 60}, {x: 50, y: 70})
  drawLine(ctx, {x: 10, y: 60}, {x: 50, y: 80})
  drawLine(ctx, {x: 10, y: 60}, {x: 50, y: 90})
}

var perfInfo = {
  lastCalcUpdateTime:    Date.now(),
  frameCounter:          0,
  elapsedTimeInFunction: 0,
}

function showPerfInfo(frameRate, runtimePercentage) {
  console.log({
    frameRate:frameRate, 
    timeBudgetUsed: Math.round(runtimePercentage*1000)/10 + "%"
  })
}

function updatePerfInfo(perfInfo, funcStartTime) {
  perfInfo.elapsedTimeInFunction += Date.now() - funcStartTime
  perfInfo.frameCounter++

  if (perfInfo.frameCounter == 100) {
    var timeSinceLast = Date.now() - perfInfo.lastCalcUpdateTime
    var frameRate = Math.round(1000*1000/timeSinceLast)/10
    var runtimePercentage = perfInfo.elapsedTimeInFunction / (Date.now() - perfInfo.lastCalcUpdateTime)

    showPerfInfo(frameRate, runtimePercentage)

    perfInfo.lastCalcUpdateTime = Date.now()
    perfInfo.frameCounter = 0
    perfInfo.elapsedTimeInFunction = 0
  }
}

function drawFrame(): void {
  var funcStartTime = Date.now()

  // clear frame
  ctx.clearRect(0, 0, PIXEL_WIDTH*pixel_size, PIXEL_HEIGHT*pixel_size)

  // draw edges
  ctx.fillStyle = "yellow"
  for (var i = 0; i < objects.length; i++) {
    var object = objects[i]
    for (var j = 0; j < object.model.edges.length; j++) {
      var p1 = object.model.points[object.model.edges[j][0]]
      var p2 = object.model.points[object.model.edges[j][1]]
      var loc = object.location
      var newP1: Point = {x: p1.x + loc.x + transform.x, y: p1.y + loc.y + transform.y, z: p1.z + loc.z + transform.z}
      var newP2: Point = {x: p2.x + loc.x + transform.x, y: p2.y + loc.y + transform.y, z: p2.z + loc.z + transform.z}
      var clampedLine = clampLineToView(newP1, newP2)
      if (clampedLine)
        drawLine3d(ctx, clampedLine[0], clampedLine[1])
    }
  }

  // update cube locationation
  if (keyState.up)    { transform.z += 8 }
  if (keyState.down)  { transform.z -= 8 }
  if (keyState.left)  { transform.x -= 8 }
  if (keyState.right) { transform.x += 8 }

  window.requestAnimationFrame(drawFrame)

  updatePerfInfo(perfInfo, funcStartTime)
}

window.requestAnimationFrame(drawFrame)

// Cross product of two vectors
// u and v are vectors with x,y,z components
function cross(u: Vector, v: Vector): Vector {
  return {
    x: u.y*v.z - u.z*v.y,
    y: u.z*v.x - u.x*v.z,
    z: u.x*v.y - u.y*v.x,
  }
}

// Dot product of two vectors
// u and v are vectors with x,y,z components
function dot(u: Vector, v: Vector): number {
  return u.x*v.x + u.y*v.y + u.z*v.z
}

// clocationkwise from bottom right
var screen_coords: Point[] = [
  { x:  PIXEL_WIDTH/2, y: PIXEL_HEIGHT/2, z: screen_dist}, // bottom rt
  { x: -PIXEL_WIDTH/2, y: PIXEL_HEIGHT/2, z: screen_dist}, // bottom left
  { x: -PIXEL_WIDTH/2, y:-PIXEL_HEIGHT/2, z: screen_dist}, // top left
  { x:  PIXEL_WIDTH/2, y:-PIXEL_HEIGHT/2, z: screen_dist}, // top right
]

// cross product of two vectors in each plane
var view_plane_normals: Vector[] = [
  cross(screen_coords[0], screen_coords[1]), // bottom
  cross(screen_coords[1], screen_coords[2]), // left
  cross(screen_coords[2], screen_coords[3]), // top
  cross(screen_coords[3], screen_coords[0]), // right
]

// returns whether the point is inside all the planes
// that define the view area
function isPointInView(p: Point): boolean {
  for (var i = 0; i < view_plane_normals.length; i++)
    if (dot(p, view_plane_normals[i]) < -0.001)
      return false
  return true
}

// Returns null if the line between p and q is not visible
// at all. If it is, returns the points for the part of the
// line that is visible.
function clampLineToView(p: Point, q: Point): Point[] {
  var p_in = isPointInView(p)
  var q_in = isPointInView(q)

  if (p_in && q_in)
    return [p, q]

  // we need two endpoints. Include p or q if either of them
  // is visible
  var visible_a: Point = p_in ? p : (q_in ? q : null)
  var visible_b: Point = null

  // now find the intersections and keep going until we have two visible
  // points
  for (var i = 0; i < view_plane_normals.length; i++) {
    var ip = linePlaneIntersection(p, q, view_plane_normals[i])
    if (ip != null && isPointInView(ip)) {
      if (visible_a == null) {
        visible_a = ip
      } else if (visible_b == null) {
        visible_b = ip
        break
      }
    }
  }

  // if we have two visible points, return them, otherwise return 
  // false, meaning none of the line is visible.
  if (visible_a != null && visible_b != null)
    return [visible_a, visible_b]
  else
    return null
}

// takes two points that define a line and a plane normal 
// and returns where the line intersects the plane, or false if 
// it does not
// (assumes (0,0,0) is in the plane)
function linePlaneIntersection(p: Point, q: Point, n: Vector): Point {
  var v = [q.x - p.x, q.y - p.y, q.z - p.z]
  var t = -1*(n.x*p.x + n.y*p.y + n.z*p.z) /
             (n.x*v[0] + n.y*v[1] + n.z*v[2])
  if (t < 0 || t > 1)
    return null
  return {x: p.x + t*v[0], y: p.y + t*v[1], z: p.z + t*v[2]}
}

