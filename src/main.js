var PIXEL_WIDTH=160
var PIXEL_HEIGHT=120

var WIN_WIDTH = window.innerWidth
var WIN_HEIGHT = window.innerHeight

var ratio_width = WIN_WIDTH / PIXEL_WIDTH
var ratio_height = WIN_HEIGHT / PIXEL_HEIGHT

var R = Math.floor(Math.min(ratio_width, ratio_height))

var canvas = document.getElementById("canvas")
canvas.width = PIXEL_WIDTH * R
canvas.height = PIXEL_HEIGHT * R

console.log("screen info", [PIXEL_WIDTH, PIXEL_HEIGHT], [WIN_WIDTH, WIN_HEIGHT], [ratio_width, ratio_height], R, PIXEL_WIDTH*R, PIXEL_HEIGHT*R)

var ctx = canvas.getContext("2d")

var camera = [0, 0]
var win_distance = 100

var points = [
  [ 50, 50, 50], // 0
  [ 50, 50,-50], // 1
  [ 50,-50, 50], // 2
  [-50, 50, 50], // 3
  [ 50,-50,-50], // 4
  [-50, 50,-50], // 5
  [-50,-50, 50], // 6
  [-50,-50,-50]  // 7
]

var edges = [
  [0, 1, "blue"],
  [0, 2, "blue"],
  [0, 3, "blue"],
  [1, 4, "blue"],
  [1, 5, "blue"],
  [2, 4, "blue"],
  [2, 6, "blue"],
  [3, 5, "blue"],
  [3, 6, "blue"],
  [4, 7, "blue"],
  [5, 7, "blue"],
  [6, 7, "blue"],
]

var transformX = 0
var transformY = 0
var transformZ = 200 // increases as gets further away
 
var dz = 0;
var lastFrameTime = Date.now()
var frameRateDisplayCounter = 0

var startTime = Date.now()
var elapsedTime = 0

function drawFrame() {
  console.log("drawFrame", Date.now())
  var funcStartTime = Date.now()
  ctx.fillStyle = "black"
  ctx.fillRect(0, 0, PIXEL_WIDTH*R, PIXEL_HEIGHT*R)

  ctx.fillStyle = "red"

  drawLine(ctx, 10, 10, 10, 50)
  drawLine(ctx, 10, 10, 50, 50)
  drawLine(ctx, 10, 10, 50, 10)
  drawLine(ctx, 10, 50, 50, 50)
  drawLine(ctx, 50, 50, 50, 10)
  drawLine(ctx, 50, 10, 10, 50)

  //drawLine(ctx, 30, 10, 10, 30)
  //drawLine(ctx, 30, 10, 10, 50)
  drawLine(ctx, 30, 10, 10, 50)
  drawLine(ctx, 30, 10, 30, 50)
  drawLine(ctx, 50, 10, 30, 50)
  drawLine(ctx, 30, 50, 10, 10)
  drawLine(ctx, 10, 30, 50, 30)
  drawLine(ctx, 50, 30, 30, 50)
  //drawLine(ctx, 30, 10, 30, 50)

  function drawPoint3d(ctx, x, y, z) {
    var xw = Math.round(x * (win_distance / z))
    var yw = Math.round(y * (win_distance / z))
    setPixel(ctx, xw + PIXEL_WIDTH/2, yw + PIXEL_HEIGHT/2)
  }

  function drawLine3d(ctx, x1, y1, z1, x2, y2, z2) {
    var x1w = Math.round(x1 * (win_distance / z1))
    var y1w = Math.round(y1 * (win_distance / z1))
    var x2w = Math.round(x2 * (win_distance / z2))
    var y2w = Math.round(y2 * (win_distance / z2))
    drawLine(ctx, x1w + PIXEL_WIDTH/2, y1w + PIXEL_HEIGHT/2, x2w + PIXEL_WIDTH/2, y2w + PIXEL_HEIGHT/2)
  }
  console.log("edges", Date.now())

  for (var j = 0; j < edges.length; j++) {
    var p1 = points[edges[j][0]]
    var p2 = points[edges[j][1]]
    ctx.fillStyle = edges[j][2]
    drawLine3d(ctx, p1[0] + transformX, p1[1] + transformY, p1[2] + transformZ,
                    p2[0] + transformX, p2[1] + transformY, p2[2] + transformZ)
  }
  console.log("points", Date.now())

  for (var i = 0; i < points.length; i++) {
    var p = points[i]
    ctx.fillStyle = "white"
    drawPoint3d(ctx, p[0] + transformX, p[1] + transformY, p[2] + transformZ)
  }
  console.log("log", Date.now())

  frameRateDisplayCounter++
  if (frameRateDisplayCounter == 100) {
    var timeSinceLast = Date.now() - lastFrameTime
    console.log({"frame rate": Math.round(1000*1000/timeSinceLast)/10, "runtime percentage": Math.round(1000 * elapsedTime / (Date.now() - startTime))/10})

    lastFrameTime = Date.now()
    frameRateDisplayCounter = 0
  }

  if (keyState.up) transformZ += 10
  if (keyState.down) transformZ -= 10
  if (keyState.left) transformX -= 10
  if (keyState.right) transformX += 10

  elapsedTime += Date.now() - funcStartTime
  window.requestAnimationFrame(drawFrame)
}

window.requestAnimationFrame(drawFrame)

var keyState = {
  up: false,
  down: false,
  left: false,
  right: false,
}

document.addEventListener('keydown', function(e) {
  if (e.keyIdentifier == "Up") {
    keyState.up = true
  }
  if (e.keyIdentifier == "Down") {
    keyState.down = true
  }
  if (e.keyIdentifier == "Left") {
    keyState.left = true
  }
  if (e.keyIdentifier == "Right") {
    keyState.right = true
  }
})

document.addEventListener('keyup', function(e) {
  if (e.keyIdentifier == "Up") {
    keyState.up = false
  }
  if (e.keyIdentifier == "Down") {
    keyState.down = false
  }
  if (e.keyIdentifier == "Left") {
    keyState.left = false
  }
  if (e.keyIdentifier == "Right") {
    keyState.right = false
  }
})

function drawLine(ctx, x1, y1, x2, y2) {
  // TODO clamp line to be onscreen, or return if completely offscreen

  // ensure line from left to right
  if (x2 < x1) {
    var xt = x1
    var yt = y1
    x1 = x2
    y1 = y2
    x2 = xt
    y2 = yt
  }

  // negative infinity slope case
  if (x1 == x2) {
    // ensure line from top to bottom
    if (y2 < y1) {
      var xt = x1
      var yt = y1
      x1 = x2
      y1 = y2
      x2 = xt
      y2 = yt
    }

    var x = x1
    var y = y1
    while (y < y2 + 1) {
      setPixel(ctx, x, y)
      y++
    }
    return
  }

  var x = x1
  var y = y1
  var slope = (y2 - y1) / (x2 - x1)
  if (Math.abs(slope) <= 1) {
    while (x < x2 + 1) {
      setPixel(ctx, x, Math.round(y))
      x++
      y += slope;
    }
    return
  }

  if (slope < -1) {
    var slope = -1*1/slope;
    while (y > y2 - 1) {
      setPixel(ctx, Math.round(x), y)
      y--
      x += slope;
    } 
  } else if (slope > 1) {
    var slopeX = 1/slope;
    while (y < y2 + 1) {
      setPixel(ctx, Math.round(x), y)
      y++
      x += slopeX;
    }
  }
}

function setPixel(ctx, x, y) {
  if (x > 0 && x < PIXEL_WIDTH && y > 0 && y < PIXEL_HEIGHT)
    ctx.fillRect(x*R, y*R, R, R)
}