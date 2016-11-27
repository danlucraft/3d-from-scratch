
var PIXEL_WIDTH  = 160
var PIXEL_HEIGHT = 120

var WIN_WIDTH  = window.innerWidth
var WIN_HEIGHT = window.innerHeight

var ratio_width  = WIN_WIDTH / PIXEL_WIDTH
var ratio_height = WIN_HEIGHT / PIXEL_HEIGHT
var pixel_size = Math.floor(Math.min(ratio_width, ratio_height))
var scaleX = pixel_size
var scaleY = pixel_size

//var scaleToFit = Math.min(scaleX, scaleY);
//var scaleToCover = Math.max(scaleX, scaleY);
//var stage = document.getElementById("stage")
//stage.style.transformOrigin = "0 0"; //scale from top left
//stage.style.transform = "scale(" + scaleToFit + ")";

var canvas = document.getElementById("canvas")
canvas.width = PIXEL_WIDTH * pixel_size
canvas.height = PIXEL_HEIGHT * pixel_size

var ctx = canvas.getContext("2d")

console.log("screen info", [PIXEL_WIDTH, PIXEL_HEIGHT], [WIN_WIDTH, WIN_HEIGHT], [ratio_width, ratio_height], pixel_size, PIXEL_WIDTH*pixel_size, PIXEL_HEIGHT*pixel_size)

var screen_dist = 100
var camera_location = {x:0, y:0, z:0}
var camera_orientation = {pitch: 0, yaw: 0, roll: 0.4}

// clockwise from bottom right
var screen_vectors = [
  [ PIXEL_WIDTH/2,  PIXEL_HEIGHT/2, screen_dist], // bottom rt
  [-PIXEL_WIDTH/2,  PIXEL_HEIGHT/2, screen_dist], // bottom left
  [-PIXEL_WIDTH/2, -PIXEL_HEIGHT/2, screen_dist], // top left
  [ PIXEL_WIDTH/2, -PIXEL_HEIGHT/2, screen_dist], // top right
]

// cross product of two points in each place
var view_plane_normals = [
  cross(screen_vectors[0], screen_vectors[1]), // bottom
  cross(screen_vectors[1], screen_vectors[2]), // left
  cross(screen_vectors[2], screen_vectors[3]), // top
  cross(screen_vectors[3], screen_vectors[0]), // right
]

var cubeModel = {
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

var objects = [
  {model: cubeModel, loc: {x: 0, y: 0, z: 400}},
  
  {model: cubeModel, loc: {x: 150, y: 0, z: 500}},
  {model: cubeModel, loc: {x: -150, y: 0, z: 500}},

  //{model: cubeModel, loc: {x: 300, y: -300, z: 500}},
  //{model: cubeModel, loc: {x: 150, y: -300, z: 500}},
  //{model: cubeModel, loc: {x: 0, y: -300, z: 500}},
  //{model: cubeModel, loc: {x: -150, y: -300, z: 500}},
  //{model: cubeModel, loc: {x: -300, y: -300, z: 500}},

  //{model: cubeModel, loc: {x: 300, y: -150, z: 500}},
  {model: cubeModel, loc: {x: 150, y: -150, z: 500}},
  {model: cubeModel, loc: {x: 0, y: -150, z: 500}},
  {model: cubeModel, loc: {x: -150, y: -150, z: 500}},
  //{model: cubeModel, loc: {x: -300, y: -150, z: 500}},

  //{model: cubeModel, loc: {x: 300, y: +150, z: 500}},
  {model: cubeModel, loc: {x: 150, y: +150, z: 500}},
  {model: cubeModel, loc: {x: 0, y: +150, z: 500}},
  {model: cubeModel, loc: {x: -150, y: +150, z: 500}},
  //{model: cubeModel, loc: {x: -300, y: +150, z: 500}},

  //{model: cubeModel, loc: {x: 300, y: +300, z: 500}},
  //{model: cubeModel, loc: {x: 150, y: +300, z: 500}},
  //{model: cubeModel, loc: {x: 0, y: +300, z: 500}},
  //{model: cubeModel, loc: {x: -150, y: +300, z: 500}},
  //{model: cubeModel, loc: {x: -300, y: +300, z: 500}},
]

function setPixel(ctx, x, y) {
  if (x > 0 && x < PIXEL_WIDTH && y > 0 && y < PIXEL_HEIGHT)
    ctx.fillRect(x*pixel_size, y*pixel_size, pixel_size, pixel_size)
}

function drawPoint3d(ctx, p) {
  var x = Math.round((p.x-camera_location.x) * (screen_dist / (p.z-camera_location.z)))
  var y = Math.round((p.y-camera_location.y) * (screen_dist / (p.z-camera_location.z)))
  setPixel(ctx, x + PIXEL_WIDTH/2, y + PIXEL_HEIGHT/2)
}

function drawVertLine(ctx, x, y1, y2) {
  ctx.fillRect(x*pixel_size, y1*pixel_size, pixel_size, (y2-y1 + 1)*pixel_size)
}

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
  var x1 = Math.round((p1.x-camera_location.x) * (screen_dist / (p1.z-camera_location.z)))
  var y1 = Math.round((p1.y-camera_location.y) * (screen_dist / (p1.z-camera_location.z)))
  var x2 = Math.round((p2.x-camera_location.x) * (screen_dist / (p2.z-camera_location.z)))
  var y2 = Math.round((p2.y-camera_location.y) * (screen_dist / (p2.z-camera_location.z)))
  var r = -camera_orientation.roll
  drawLine(ctx, 
    x1*Math.cos(r) - y1*Math.sin(r) + PIXEL_WIDTH/2, 
    y1*Math.cos(r) + x1*Math.sin(r) + PIXEL_HEIGHT/2,
    x2*Math.cos(r) - y2*Math.sin(r) + PIXEL_WIDTH/2,
    y2*Math.cos(r) + x2*Math.sin(r) + PIXEL_HEIGHT/2)
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
  try {
  perfInfo.funcStartTime = Date.now()

	screen_vectors = [
		[ PIXEL_WIDTH/2,  PIXEL_HEIGHT/2, screen_dist], // bottom rt
		[-PIXEL_WIDTH/2,  PIXEL_HEIGHT/2, screen_dist], // bottom left
		[-PIXEL_WIDTH/2, -PIXEL_HEIGHT/2, screen_dist], // top left
		[ PIXEL_WIDTH/2, -PIXEL_HEIGHT/2, screen_dist], // top right
	]

  // apply roll
  var h = Math.sqrt(screen_vectors[0][0]*screen_vectors[0][0] + screen_vectors[0][1]*screen_vectors[0][1])
  for (var i = 0; i < screen_vectors.length; i++) {
    var v = screen_vectors[i]
    var r = camera_orientation.roll
    var x = v[0]
    var y = v[1]
    v[0] = x*Math.cos(r) - y*Math.sin(r)
    v[1] = y*Math.cos(r) + x*Math.sin(r)
  }

	view_plane_normals = [
		cross(screen_vectors[0], screen_vectors[1]), // bottom
		cross(screen_vectors[1], screen_vectors[2]), // left
		cross(screen_vectors[2], screen_vectors[3]), // top
		cross(screen_vectors[3], screen_vectors[0]), // right
	]

  document.getElementById("debug").innerHTML = JSON.stringify([camera_location, camera_orientation])
  // document.getElementById("debug2").innerHTML = JSON.stringify(view_plane_normals)

  // clear frame
  ctx.clearRect(0, 0, PIXEL_WIDTH*pixel_size, PIXEL_HEIGHT*pixel_size)

  // draw edges
  for (var i = 0; i < objects.length; i++) {
    var object = objects[i]
    for (var j = 0; j < object.model.edges.length; j++) {
      var p1 = object.model.points[object.model.edges[j][0]]
      var p2 = object.model.points[object.model.edges[j][1]]
      var loc = object.loc
      var newP1 = {x: p1.x + loc.x, y: p1.y + loc.y, z: p1.z + loc.z}
      var newP2 = {x: p2.x + loc.x, y: p2.y + loc.y, z: p2.z + loc.z}
      var clampedLine = clampLineToView(newP1, newP2)
      if (clampedLine) {
        ctx.fillStyle = "yellow"
        drawLine3d(ctx, clampedLine[0], clampedLine[1])
      }
    }
  }

  changed = false

  // update camera location
	if (keyState.w)  { changed = true; camera_location.z += 8 }
	if (keyState.s)  { changed = true; camera_location.z -= 8 }
	if (keyState.a)  { changed = true; camera_location.x -= 8*Math.cos(camera_orientation.roll) - 8*Math.sin(camera_orientation.roll) }
	if (keyState.d)  { changed = true; camera_location.x += 8 }
	if (keyState.left)  { changed = true; camera_orientation.roll -= 0.01 }
	if (keyState.right)  { changed = true; camera_orientation.roll += 0.01 }

  window.requestAnimationFrame(drawFrame)

  perfInfo.elapsedTime += Date.now() - perfInfo.funcStartTime
  perfInfo.frameRateDisplayCounter++
  if (perfInfo.frameRateDisplayCounter == 100) {
    var timeSinceLast = Date.now() - perfInfo.lastFrameTime
    showPerfInfo(Math.round(1000*1000/timeSinceLast)/10,
                 perfInfo.elapsedTime / (Date.now() - perfInfo.startTime))
    perfInfo.lastFrameTime = Date.now()
    perfInfo.frameRateDisplayCounter = 0
  }

  } catch(e) {
    var errorLine = document.createElement("div")
    errorLine.innerHTML = "<div class=error>" + e.fileName + ":" + e.lineNumber + ": " + e.message + "</div>"
    document.getElementById("console").appendChild(errorLine)
  }
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

// returns whether the point is inside all the planes
// that define the view area
function isPointInView(p) {
  for (var i = 0; i < view_plane_normals.length; i++)
    if (dot([p.x-camera_location.x, 
					   p.y-camera_location.y, 
						 p.z-camera_location.z], 
						 view_plane_normals[i]) < -0.001)
      return false
  return true
}

// Returns false if the line between p and q is not visible
// at all. If it is, returns the points for the part of the
// line that is visible.
function clampLineToView(p, q) {
  var p_in = isPointInView(p)
  var q_in = isPointInView(q)

  if (p_in && q_in) {
    return [p, q]
	}

  // we need two endpoints. Include p or q if either of them
  // is visible
  var visible_a = p_in ? p : (q_in ? q : null)
  var visible_b = null

  // now find the intersections and keep going until we have two visible
  // points
  for (var i = 0; i < view_plane_normals.length; i++) {
    var ip = linePlaneIntersection(p, q, view_plane_normals[i], camera_location)
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

// takes two points that define a line and a plane normal (n) plus point 
// in plane (c) and returns where the line intersects the plane
function linePlaneIntersection(p, q, n, c) {
  var v = [q.x - p.x, q.y - p.y, q.z - p.z]
  var w = [c.x - p.x, c.y - p.y, c.z - p.z]
  var t = (n[0]*w[0] + n[1]*w[1] + n[2]*w[2]) /
          (n[0]*v[0] + n[1]*v[1] + n[2]*v[2])
  if (t < 0 || t > 1)
    return null
  return {x: p.x + t*v[0], y: p.y + t*v[1], z: p.z + t*v[2]}
}


var keyState = {
  up: false,
  down: false,
  left: false,
  right: false,
  a: false,
  w: false,
  s: false,
  d: false,
}

document.addEventListener('keydown', function(e) {
  if (e.keyIdentifier == "U+0057")    keyState.w = true
  if (e.keyIdentifier == "U+0041")    keyState.a = true
  if (e.keyIdentifier == "U+0053")    keyState.s = true
  if (e.keyIdentifier == "U+0044")    keyState.d = true
  if (e.keyIdentifier == "Up")    keyState.up = true
  if (e.keyIdentifier == "Down")  keyState.down = true
  if (e.keyIdentifier == "Left")  keyState.left = true
  if (e.keyIdentifier == "Right")  keyState.right = true
})

document.addEventListener('keyup', function(e) {
  if (e.keyIdentifier == "U+0057")    keyState.w = false
  if (e.keyIdentifier == "U+0041")    keyState.a = false
  if (e.keyIdentifier == "U+0053")    keyState.s = false
  if (e.keyIdentifier == "U+0044")    keyState.d = false
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
