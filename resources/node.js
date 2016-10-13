var Node = function(_x,_y) {
    this.x = _x;
    this.y = _y;
};

NODERADIUS = 4;

Node.prototype.setPos = function(_x,_y)
{
    this.x = _x;
    this.y = _y;
}

// Set the node's x and y coordinates by linearly interpolating from a to b by a factor t
Node.prototype.lerp = function(a, b, t)
{
    this.x = (1-t)*a.x + t*b.x;
    this.y = (1-t)*a.y + t*b.y;
}

Node.prototype.draw = function(ctx)
{
    drawCircle(ctx, this.x, this.y , NODERADIUS);
}

Node.prototype.isInside = function(px,py)
{
    var dist = (px-this.x)*(px-this.x) + (py-this.y)*(py-this.y);
    var radius = (2*NODERADIUS)*(2*NODERADIUS);
    return dist <= radius;
}
