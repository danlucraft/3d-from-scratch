var PIXEL_WIDTH = 160;
var PIXEL_HEIGHT = 120;
var WIN_WIDTH = window.innerWidth;
var WIN_HEIGHT = window.innerHeight;
var ratio_width = WIN_WIDTH / PIXEL_WIDTH;
var ratio_height = WIN_HEIGHT / PIXEL_HEIGHT;
var pixel_size = Math.floor(Math.min(ratio_width, ratio_height));
var canvas = document.getElementById("canvas");
canvas.width = PIXEL_WIDTH * pixel_size;
canvas.height = PIXEL_HEIGHT * pixel_size;
var ctx = canvas.getContext("2d");
var Point2D = (function () {
    function Point2D(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point2D;
}());
var Point = (function () {
    function Point(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    return Point;
}());
var Vector = (function () {
    function Vector(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    return Vector;
}());
var Model = (function () {
    function Model(vertices, edges) {
        this.vertices = vertices;
        this.edges = edges;
    }
    return Model;
}());
var cubeModel = new Model([
    new Point(50, 50, 50),
    new Point(50, 50, -50),
    new Point(50, -50, 50),
    new Point(-50, 50, 50),
    new Point(50, -50, -50),
    new Point(-50, 50, -50),
    new Point(-50, -50, 50),
    new Point(-50, -50, -50),
], [
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
]);
var Instance = (function () {
    function Instance(model, location) {
        this.model = model;
        this.location = location;
    }
    return Instance;
}());
var objects = [
    new Instance(cubeModel, new Point(0, 0, 400)),
    new Instance(cubeModel, new Point(150, 0, 500)),
    new Instance(cubeModel, new Point(-150, 0, 500)),
    new Instance(cubeModel, new Point(300, -300, 500)),
    new Instance(cubeModel, new Point(150, -300, 500)),
    new Instance(cubeModel, new Point(0, -300, 500)),
    new Instance(cubeModel, new Point(-150, -300, 500)),
    new Instance(cubeModel, new Point(-300, -300, 500)),
    new Instance(cubeModel, new Point(300, -150, 500)),
    new Instance(cubeModel, new Point(150, -150, 500)),
    new Instance(cubeModel, new Point(0, -150, 500)),
    new Instance(cubeModel, new Point(-150, -150, 500)),
    new Instance(cubeModel, new Point(-300, -150, 500)),
    new Instance(cubeModel, new Point(300, +150, 500)),
    new Instance(cubeModel, new Point(150, +150, 500)),
    new Instance(cubeModel, new Point(0, +150, 500)),
    new Instance(cubeModel, new Point(-150, +150, 500)),
    new Instance(cubeModel, new Point(-300, +150, 500)),
    new Instance(cubeModel, new Point(300, +300, 500)),
    new Instance(cubeModel, new Point(150, +300, 500)),
    new Instance(cubeModel, new Point(0, +300, 500)),
    new Instance(cubeModel, new Point(-150, +300, 500)),
    new Instance(cubeModel, new Point(-300, +300, 500)),
];
var keyState = {
    up: false,
    down: false,
    left: false,
    right: false
};
document.addEventListener('keydown', function (e) {
    var keyName = e.key || e["keyIdentifier"]; // Chrome vs Safari
    if (keyName == "ArrowUp" || keyName == "Up")
        keyState.up = true;
    if (keyName == "ArrowDown" || keyName == "Down")
        keyState.down = true;
    if (keyName == "ArrowLeft" || keyName == "Left")
        keyState.left = true;
    if (keyName == "ArrowRight" || keyName == "Right")
        keyState.right = true;
});
document.addEventListener('keyup', function (e) {
    var keyName = e.key || e["keyIdentifier"];
    if (keyName == "ArrowUp" || keyName == "Up")
        keyState.up = false;
    if (keyName == "ArrowDown" || keyName == "Down")
        keyState.down = false;
    if (keyName == "ArrowLeft" || keyName == "Left")
        keyState.left = false;
    if (keyName == "ArrowRight" || keyName == "Right")
        keyState.right = false;
});
var screen_dist = 100;
var transform = { x: 0, y: 0, z: 0 };
function setPixel(ctx, x, y) {
    if (x > 0 && x < PIXEL_WIDTH && y > 0 && y < PIXEL_HEIGHT)
        ctx.fillRect(x * pixel_size, y * pixel_size, pixel_size, pixel_size);
}
function drawPoint3d(ctx, p) {
    var x = Math.round(p.x * (screen_dist / p.z));
    var y = Math.round(p.y * (screen_dist / p.z));
    setPixel(ctx, x + PIXEL_WIDTH / 2, y + PIXEL_HEIGHT / 2);
}
function drawLine(ctx, p, q) {
    // ensure line from left to right
    if (q.x < p.x) {
        _a = [q, p], p = _a[0], q = _a[1];
    }
    var x = p.x;
    var y = p.y;
    var s = (q.x - p.x) / (q.y - p.y);
    if ((s > 0 && s <= 1) || (s == 0 && q.y > p.y)) {
        while (y <= q.y) {
            setPixel(ctx, Math.round(x), y);
            y++;
            x += s;
        }
    }
    else if ((s < 0 && s >= -1) || (s == 0 && q.y < p.y)) {
        while (y >= q.y) {
            setPixel(ctx, Math.round(x), y);
            y--;
            x -= s;
        }
    }
    else if (s < -1) {
        while (x <= q.x) {
            setPixel(ctx, x, Math.round(y));
            x++;
            y += 1 / s;
        }
    }
    else if (s > 1) {
        while (x <= q.x) {
            setPixel(ctx, x, Math.round(y));
            x++;
            y += 1 / s;
        }
    }
    var _a;
}
function drawLine3d(ctx, p1, p2) {
    var x1 = Math.round(p1.x * (screen_dist / p1.z));
    var y1 = Math.round(p1.y * (screen_dist / p1.z));
    var x2 = Math.round(p2.x * (screen_dist / p2.z));
    var y2 = Math.round(p2.y * (screen_dist / p2.z));
    drawLine(ctx, { x: x1 + PIXEL_WIDTH / 2, y: y1 + PIXEL_HEIGHT / 2 }, { x: x2 + PIXEL_WIDTH / 2, y: y2 + PIXEL_HEIGHT / 2 });
}
function drawDemoLines(ctx) {
    ctx.fillStyle = "yellow";
    drawLine(ctx, { x: 10, y: 60 }, { x: 10, y: 100 });
    drawLine(ctx, { x: 10, y: 60 }, { x: 20, y: 100 });
    drawLine(ctx, { x: 10, y: 60 }, { x: 30, y: 100 });
    drawLine(ctx, { x: 10, y: 60 }, { x: 40, y: 100 });
    drawLine(ctx, { x: 10, y: 60 }, { x: 50, y: 100 });
    ctx.fillStyle = "red";
    drawLine(ctx, { x: 10, y: 60 }, { x: 10, y: 20 });
    drawLine(ctx, { x: 10, y: 60 }, { x: 20, y: 20 });
    drawLine(ctx, { x: 10, y: 60 }, { x: 30, y: 20 });
    drawLine(ctx, { x: 10, y: 60 }, { x: 40, y: 20 });
    drawLine(ctx, { x: 10, y: 60 }, { x: 50, y: 20 });
    ctx.fillStyle = "green";
    drawLine(ctx, { x: 10, y: 60 }, { x: 50, y: 30 });
    drawLine(ctx, { x: 10, y: 60 }, { x: 50, y: 40 });
    drawLine(ctx, { x: 10, y: 60 }, { x: 50, y: 50 });
    drawLine(ctx, { x: 10, y: 60 }, { x: 50, y: 60 });
    ctx.fillStyle = "purple";
    drawLine(ctx, { x: 10, y: 60 }, { x: 50, y: 70 });
    drawLine(ctx, { x: 10, y: 60 }, { x: 50, y: 80 });
    drawLine(ctx, { x: 10, y: 60 }, { x: 50, y: 90 });
}
var PERF_INFO_FRAMES = 100;
var perfInfo = {};
// clear perf info after displaying it
function resetPerfInfo(perfInfo) {
    perfInfo.lastCalcUpdateTime = Date.now();
    perfInfo.frameCounter = 0;
    perfInfo.elapsedTimeInFunction = 0;
}
// set up data
resetPerfInfo(perfInfo);
// update after every frame
function updatePerfInfo(perfInfo, funcStartTime) {
    perfInfo.elapsedTimeInFunction += Date.now() - funcStartTime;
    perfInfo.frameCounter++;
    // after every PERF_INFO_FRAMES frames, dump performance info
    if (perfInfo.frameCounter == PERF_INFO_FRAMES) {
        var timeSinceLast = Date.now() - perfInfo.lastCalcUpdateTime;
        var frameRate = Math.round(1000 * 10 * PERF_INFO_FRAMES / timeSinceLast) / 10;
        var runtimePercentage = perfInfo.elapsedTimeInFunction / (Date.now() - perfInfo.lastCalcUpdateTime);
        console.log({
            frameRate: frameRate,
            timeBudgetUsed: Math.round(runtimePercentage * 1000) / 10 + "%"
        });
        resetPerfInfo(perfInfo);
    }
}
function drawFrame() {
    var funcStartTime = Date.now();
    // clear frame
    ctx.clearRect(0, 0, PIXEL_WIDTH * pixel_size, PIXEL_HEIGHT * pixel_size);
    drawDemoLines(ctx);
    // draw edges
    ctx.fillStyle = "yellow";
    for (var i = 0; i < objects.length; i++) {
        var object = objects[i];
        for (var j = 0; j < object.model.edges.length; j++) {
            var p1 = object.model.vertices[object.model.edges[j][0]];
            var p2 = object.model.vertices[object.model.edges[j][1]];
            var loc = object.location;
            var newP1 = new Point(p1.x + loc.x + transform.x, p1.y + loc.y + transform.y, p1.z + loc.z + transform.z);
            var newP2 = new Point(p2.x + loc.x + transform.x, p2.y + loc.y + transform.y, p2.z + loc.z + transform.z);
            var clampedLine = clampLineToView(newP1, newP2);
            if (clampedLine)
                drawLine3d(ctx, clampedLine[0], clampedLine[1]);
        }
    }
    // update cube locationation
    if (keyState.up) {
        transform.z += 8;
    }
    if (keyState.down) {
        transform.z -= 8;
    }
    if (keyState.left) {
        transform.x -= 8;
    }
    if (keyState.right) {
        transform.x += 8;
    }
    window.requestAnimationFrame(drawFrame);
    updatePerfInfo(perfInfo, funcStartTime);
}
window.requestAnimationFrame(drawFrame);
// Cross product of two vectors
// u and v are vectors with x,y,z components
function cross(u, v) {
    return new Vector(u.y * v.z - u.z * v.y, u.z * v.x - u.x * v.z, u.x * v.y - u.y * v.x);
}
// Dot product of two vectors
// u and v are vectors with x,y,z components
function dot(u, v) {
    return u.x * v.x + u.y * v.y + u.z * v.z;
}
// clocationkwise from bottom right
var screen_coords = [
    new Point(PIXEL_WIDTH / 2, PIXEL_HEIGHT / 2, screen_dist),
    new Point(-PIXEL_WIDTH / 2, PIXEL_HEIGHT / 2, screen_dist),
    new Point(-PIXEL_WIDTH / 2, -PIXEL_HEIGHT / 2, screen_dist),
    new Point(PIXEL_WIDTH / 2, -PIXEL_HEIGHT / 2, screen_dist),
];
// cross product of two vectors in each plane
var view_plane_normals = [
    cross(screen_coords[0], screen_coords[1]),
    cross(screen_coords[1], screen_coords[2]),
    cross(screen_coords[2], screen_coords[3]),
    cross(screen_coords[3], screen_coords[0]),
];
// returns whether the point is inside all the planes
// that define the view area
function isPointInView(p) {
    for (var i = 0; i < view_plane_normals.length; i++)
        if (dot(p, view_plane_normals[i]) < -0.001)
            return false;
    return true;
}
// Returns null if the line between p and q is not visible
// at all. If it is, returns the points for the part of the
// line that is visible.
function clampLineToView(p, q) {
    var p_in = isPointInView(p);
    var q_in = isPointInView(q);
    if (p_in && q_in)
        return [p, q];
    // we need two endpoints. Include p or q if either of them
    // is visible
    var visible_a = p_in ? p : (q_in ? q : null);
    var visible_b = null;
    // now find the intersections and keep going until we have two visible
    // points
    for (var i = 0; i < view_plane_normals.length; i++) {
        var ip = linePlaneIntersection(p, q, view_plane_normals[i]);
        if (ip != null && isPointInView(ip)) {
            if (visible_a == null) {
                visible_a = ip;
            }
            else if (visible_b == null) {
                visible_b = ip;
                break;
            }
        }
    }
    // if we have two visible points, return them, otherwise return 
    // false, meaning none of the line is visible.
    if (visible_a != null && visible_b != null)
        return [visible_a, visible_b];
    else
        return null;
}
// takes two points that define a line and a plane normal 
// and returns where the line intersects the plane, or false if 
// it does not
// (assumes (0,0,0) is in the plane)
function linePlaneIntersection(p, q, n) {
    var v = [q.x - p.x, q.y - p.y, q.z - p.z];
    var t = -1 * (n.x * p.x + n.y * p.y + n.z * p.z) /
        (n.x * v[0] + n.y * v[1] + n.z * v[2]);
    if (t < 0 || t > 1)
        return null;
    return new Point(p.x + t * v[0], p.y + t * v[1], p.z + t * v[2]);
}
