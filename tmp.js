
var PIXEL_WIDTH  = 160
var PIXEL_HEIGHT = 120

var WIN_WIDTH  = window.innerWidth
var WIN_HEIGHT = window.innerHeight

var ratio_width  = WIN_WIDTH / PIXEL_WIDTH
var ratio_height = WIN_HEIGHT / PIXEL_HEIGHT
var pixel_size = Math.floor(Math.min(ratio_width, ratio_height))

// offscreen canvas used to render in pixels
var canvas = document.createElement('canvas')
canvas.width = PIXEL_WIDTH
canvas.height = PIXEL_HEIGHT

var ctx = canvas.getContext("2d")
ctx.fillStyle = "black"
ctx.fillRect(0, 0, PIXEL_WIDTH*pixel_size, PIXEL_HEIGHT*pixel_size)
var imageData = ctx.getImageData(0, 0, PIXEL_WIDTH, PIXEL_HEIGHT)

// onscreen canvas which is zoomed version of offscreen canvas
var onscreen_canvas = document.getElementById("canvas")
onscreen_canvas.width = PIXEL_WIDTH * pixel_size
onscreen_canvas.height = PIXEL_HEIGHT * pixel_size

var onscreen_ctx = onscreen_canvas.getContext("2d")

function setPixel(ctx, x, y) {
  if (x > 0 && x < PIXEL_WIDTH && y > 0 && y < PIXEL_HEIGHT) {
    var ix = y*imageData.width*4 + x*4
    console.log(x, y, ix)
    imageData[ix + 0] = 200
    imageData[ix + 2] = 200
    imageData[ix + 3] = 0
  }
}

console.log("screen info", [PIXEL_WIDTH, PIXEL_HEIGHT], [WIN_WIDTH, WIN_HEIGHT], [ratio_width, ratio_height], pixel_size, PIXEL_WIDTH*pixel_size, PIXEL_HEIGHT*pixel_size)

var screen_dist = 100

function drawPoint3d(ctx, p) {
  var x = Math.round(p.x * (screen_dist / p.z))
  var y = Math.round(p.y * (screen_dist / p.z))
  setPixel(ctx, x + PIXEL_WIDTH/2, y + PIXEL_HEIGHT/2)
}

var cube = [
  { x: 50,  y: 50,  z: 250},
  { x: 50,  y: 50,  z: 150},
  { x: 50,  y: -50, z: 250},
  { x: -50, y: 50,  z: 250},
  { x: 50,  y: -50, z: 150},
  { x: -50, y: 50,  z: 150},
  { x: -50, y: -50, z: 250}, 
  { x: -50, y: -50, z: 150}
]

var edges = [
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

var keyState = {
  up: false,
  down: false,
  left: false,
  right: false,
}

document.addEventListener('keydown', function(e) {
  if (e.keyIdentifier == "Up")    keyState.up = true
  if (e.keyIdentifier == "Down")  keyState.down = true
  if (e.keyIdentifier == "Left")  keyState.left = true
  if (e.keyIdentifier == "Right")  keyState.right = true
})

document.addEventListener('keyup', function(e) {
  if (e.keyIdentifier == "Up")    keyState.up = false
  if (e.keyIdentifier == "Down")  keyState.down = false
  if (e.keyIdentifier == "Left")  keyState.left = false
  if (e.keyIdentifier == "Right") keyState.right = false
})

var touches = ["right", "up", "down", "left"]

for (var i = 0; i < touches.length; i++) {
  var touch = touches[i]
  var controlCanvas = document.getElementById(touch)
  controlCanvas.width = WIN_WIDTH/5
  controlCanvas.height = WIN_WIDTH/5
 
  ;(function() {
    var touchInner = touch
    controlCanvas.addEventListener("touchstart", function(e) {
      e.preventDefault()
      keyState[touchInner] = true
    }, false)
  
    controlCanvas.addEventListener("touchend", function(e) {
      keyState[touchInner] = false
    }, false)
  })()

  var controlCtx = controlCanvas.getContext("2d")
  controlCtx.fillStyle = "blue"
  controlCtx.fillRect(0, 0, 200, 200)
}

var transform = {x: 0, y: 0, z: 0}

function drawLine(ctx, x1, y1, x2, y2) {
  // ensure line from left to right
  if (x2 < x1) {
    var xt = x1
    var yt = y1
    x1 = x2
    y1 = y2
    x2 = xt
    y2 = yt
  }

  var x = x1
  var y = y1
  var s = (x2 - x1) / (y2 - y1)
  if ((s > 0 && s <= 1) || (s == 0 && y2 > y1)) {
    while (y <= y2) {
      setPixel(ctx, Math.round(x), y)
      y++
      x += s
    }
  } else if ((s < 0 && s >= -1) || (s == 0 && y2 < y1)) {
    while (y >= y2) {
      setPixel(ctx, Math.round(x), y)
      y--
      x -= s
    }
  } else if (s < -1) {
    while (x <= x2) {
      setPixel(ctx, x, Math.round(y))
      x++
      y += 1/s
    }
  } else if (s > 1) {
    while (x <= x2) {
      setPixel(ctx, x, Math.round(y))
      x++
      y += 1/s
    }
  }
}

function drawLine3d(ctx, p1, p2) {
  var x1 = Math.round(p1.x * (screen_dist / p1.z))
  var y1 = Math.round(p1.y * (screen_dist / p1.z))
  var x2 = Math.round(p2.x * (screen_dist / p2.z))
  var y2 = Math.round(p2.y * (screen_dist / p2.z))
  drawLine(ctx, x1 + PIXEL_WIDTH/2, y1 + PIXEL_HEIGHT/2, x2 + PIXEL_WIDTH/2, y2 + PIXEL_HEIGHT/2)
}

var changed = true

var perfInfo = {
  lastFrameTime:           Date.now(),
  frameRateDisplayCounter: 0,
  startTime:               Date.now(),
  elapsedTime:             0,
  funcStartTime:           Date.now(),
}

function drawFrame() {
  // try {
  perfInfo.funcStartTime = Date.now()

  // // clear frame
  // ctx.fillStyle = "black"
  // ctx.fillRect(0, 0, PIXEL_WIDTH*pixel_size, PIXEL_HEIGHT*pixel_size)

  // // draw edges
  // for (var j = 0; j < edges.length; j++) {
  //   var p1 = cube[edges[j][0]]
  //   var p2 = cube[edges[j][1]]
  //   var newP1 = {x: p1.x + transform.x, y: p1.y + transform.y, z: p1.z + transform.z}
  //   var newP2 = {x: p2.x + transform.x, y: p2.y + transform.y, z: p2.z + transform.z}
  //   var clampedLine = clampLineToView(newP1, newP2)
  //   if (clampedLine) {
  //     ctx.fillStyle = "blue"
  //     drawLine3d(ctx, clampedLine[0], clampedLine[1])
  //   }
  // }
  drawPoint3d(ctx, cube[0])

  changed = false

  // update cube location
  if (keyState.up)    { changed = true; transform.z += 2 }
  if (keyState.down)  { changed = true; transform.z -= 2 }
  if (keyState.left)  { changed = true; transform.x -= 2 }
  if (keyState.right) { changed = true; transform.x += 2 }

  onscreen_ctx.imageSmoothingEnabled = false
  onscreen_ctx.mozImageSmoothingEnabled = false
  onscreen_ctx.webkitImageSmoothingEnabled = false
  onscreen_ctx.msImageSmoothingEnabled = false

  ctx.putImageData(imageData, 0, 0)
  onscreen_ctx.drawImage(canvas, 0, 0, PIXEL_WIDTH*pixel_size, PIXEL_HEIGHT*pixel_size)

  // window.requestAnimationFrame(drawFrame)

  perfInfo.elapsedTime += Date.now() - perfInfo.funcStartTime
  perfInfo.frameRateDisplayCounter++
  if (perfInfo.frameRateDisplayCounter == 100) {
    var timeSinceLast = Date.now() - perfInfo.lastFrameTime
    showPerfInfo(Math.round(1000*1000/timeSinceLast)/10,
                 perfInfo.elapsedTime / (Date.now() - perfInfo.startTime))
    perfInfo.lastFrameTime = Date.now()
    perfInfo.frameRateDisplayCounter = 0
  }

  // } catch(e) {
  //   var errorLine = document.createElement("div")
  //   errorLine.innerHTML = "<div class=error>" + e.fileName + ":" + e.lineNumber + ": " + e.message + "</div>"
  //   document.getElementById("console").appendChild(errorLine)
  // }
}

window.requestAnimationFrame(drawFrame)

function showPerfInfo(frameRate, runtimePercentage) {
  document.getElementById("frame-rate").innerText = frameRate
  document.getElementById("runtime-perc").innerText = Math.round(runtimePercentage*1000)/10 + "%"
}

function cross(u, v) {
  return [
    u[1]*v[2] - u[2]*v[1], 
    u[2]*v[0] - u[0]*v[2],
    u[0]*v[1] - u[1]*v[0],
  ]
}

// u and v are vectors with x,y,z components
function dot(u, v) {
  return u[0]*v[0] + u[1]*v[1] + u[2]*v[2]
}

// clockwise from bottom right
var screen_coords = [
  [ PIXEL_WIDTH/2,  PIXEL_HEIGHT/2, screen_dist], // bottom rt
  [-PIXEL_WIDTH/2,  PIXEL_HEIGHT/2, screen_dist], // bottom left
  [-PIXEL_WIDTH/2, -PIXEL_HEIGHT/2, screen_dist], // top left
  [ PIXEL_WIDTH/2, -PIXEL_HEIGHT/2, screen_dist], // top right
]

// cross product of two points in each place
var view_plane_normals = [
  cross(screen_coords[0], screen_coords[1]), // bottom
  cross(screen_coords[1], screen_coords[2]), // left
  cross(screen_coords[2], screen_coords[3]), // top
  cross(screen_coords[3], screen_coords[0]), // right
]

// returns whether the point is inside all the planes
// that define the view area
function isPointInView(p) {
  for (var i = 0; i < view_plane_normals.length; i++)
    if (dot([p.x, p.y, p.z], view_plane_normals[i]) < -0.001)
      return false
  return true
}

// returns the list of normals for the planes the point is
// outside of
function outsidePlaneNormalIndexes(p) {
  var result = []
  for (var i = 0; i < view_plane_normals.length; i++)
    if (dot([p.x, p.y, p.z], view_plane_normals[i]) < 0)
      result.push(i)
  return result
}

// can be optimized by removing any line that is entirely on one
// side of any plane 

// Returns false if the line between p and q is not visible
// at all. If it is, returns the points for the part of the
// line that is visible.
function clampLineToView(p, q) {
  var p_in = isPointInView(p)
  var q_in = isPointInView(q)

  if (p_in && q_in)
    return [p, q]

  // we need two endpoints. Include p or q if either of them
  // is visible
  var visible_a = p_in ? p : (q_in ? q : null)
  var visible_b = null

  // now find the intersections and keep going until we have two visible
  // points
  for (var i = 0; i < view_plane_normals.length; i++) {
    var ip = linePlaneIntersection(p, q, view_plane_normals[i])
    if (ip && isPointInView(ip)) {
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
    return false
}

// takes two points that define a line and a plane normal 
// and returns where the line intersects the plane
function linePlaneIntersection(p, q, n) {
  var v = [q.x - p.x, q.y - p.y, q.z - p.z]
  var t = -1*(n[0]*p.x + n[1]*p.y + n[2]*p.z) /
             (n[0]*v[0] + n[1]*v[1] + n[2]*v[2])
  if (t < 0 || t > 1)
    return null
  return {x: p.x + t*v[0], y: p.y + t*v[1], z: p.z + t*v[2]}
}

