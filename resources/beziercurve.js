// Class definition for a Bezier Curve
var BezierCurve = function(canvasId, ctx)
{
    // Setup all the data related to the actual curve.
    this.nodes = new Array();
    this.showControlPolygon = true;
    this.showAdaptiveSubdivision = false;
    this.tParameter = 0.5;
    this.tDepth = 2;
    
    // Set up all the data related to drawing the curve
    this.cId = canvasId;
    this.dCanvas = document.getElementById(this.cId);
    if (ctx) {
        this.ctx = ctx;
        return;
    } else {
        this.ctx = this.dCanvas.getContext('2d');
    }
    this.computeCanvasSize();
    
    // Setup event listeners
    this.cvState = CVSTATE.Idle;
    this.activeNode = null;
    
    // closure
    var that = this;
    
    // Event listeners
    this.dCanvas.addEventListener('resize', this.computeCanvasSize());
    
    this.dCanvas.addEventListener('mousedown', function(event) {
        that.mousePress(event);
    });
    
    this.dCanvas.addEventListener('mousemove', function(event) {
        that.mouseMove(event);
    });
    
    this.dCanvas.addEventListener('mouseup', function(event) {
        that.mouseRelease(event);
    });
    
    this.dCanvas.addEventListener('mouseleave', function(event) {
        that.mouseRelease(event);
    });
}

// Mutator methods.
BezierCurve.prototype.setT = function(t)
{
    this.tParameter = t;
}

BezierCurve.prototype.setDepth = function(d)
{
    this.tDepth = d;
}

BezierCurve.prototype.setShowControlPolygon = function(bShow)
{
    this.showControlPolygon = bShow;
}

BezierCurve.prototype.setShowAdaptiveSubdivision = function(bShow)
{
    this.showAdaptiveSubdivision = bShow;
}

// Event handlers for the canvas associated with the curve.
BezierCurve.prototype.mousePress = function(event)
{
    if (event.button == 0) {
        this.activeNode = null;
        var pos = getMousePos(event);

        // Try to find a node below the mouse
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].isInside(pos.x,pos.y)) {
                this.activeNode = this.nodes[i];
                break;
            }
        }
    }

    // No node selected: add a new node
    if (this.activeNode == null) {
        this.addNode(pos.x,pos.y);
        this.activeNode = this.nodes[this.nodes.length-1];
    }

    this.cvState = CVSTATE.SelectPoint;
    event.preventDefault();
}

BezierCurve.prototype.mouseMove = function(event) {
    if (this.cvState == CVSTATE.SelectPoint || this.cvState == CVSTATE.MovePoint) {
        var pos = getMousePos(event);
        this.activeNode.setPos(pos.x,pos.y);
    } else {
        // No button pressed. Ignore movement.
    }
}

BezierCurve.prototype.mouseRelease = function(event)
{
    this.cvState = CVSTATE.Idle; this.activeNode = null;
}

// Some util functions.
BezierCurve.prototype.computeCanvasSize = function() 
{
    var renderWidth = Math.min(this.dCanvas.parentNode.clientWidth - 20, 820);
    var renderHeight = Math.floor(renderWidth*9.0/16.0);
    this.dCanvas.width = renderWidth;
    this.dCanvas.height = renderHeight;
}

BezierCurve.prototype.drawControlPolygon = function()
{
    for (var i = 0; i < this.nodes.length-1; i++)
        drawLine(this.ctx, this.nodes[i].x, this.nodes[i].y,
                           this.nodes[i+1].x, this.nodes[i+1].y);
}

BezierCurve.prototype.drawControlPoints = function()
{
    for (var i = 0; i < this.nodes.length; i++)
        this.nodes[i].draw(this.ctx);
}

// TODO: Task 1 - Implement the De Casteljau split, given a parameter location 't' about which the curve should be split.
BezierCurve.prototype.deCasteljauSplit = function(t)
{
    // Create left and right childs and pass the correct contexts.
    var left = new BezierCurve(this.cId, this.ctx);
    var right = new BezierCurve(this.cId, this.ctx);

    if (this.nodes.length == 3)
    {
        // degree 2 bezier curve
        // split the segments about 't'
        // Hint : use lerp()
    }
    else if (this.nodes.length == 4)
    {    
        // degree 3 bezier curve
    }

    return {left: left, right: right};
}

// TODO: Task 2 - Implement the De Casteljau draw function.
BezierCurve.prototype.deCasteljauDraw = function(depth)
{
    // Check if depth == 0; if so draw the control polygon
    // Else get both children by split
    // recursively call draw on both children
}

// TODO: Task 3 - Implement the adaptive De Casteljau draw function
BezierCurve.prototype.adapativeDeCasteljauDraw = function()
{
    // NOTE: Only for graduate students
    // Compute a flatness measure.
    // If not flat, split and recurse on both
    // Else draw control vertices of the curve
}

// NOTE: Code for task 1
BezierCurve.prototype.drawTask1 = function()
{
    this.ctx.clearRect(0, 0, this.dCanvas.width, this.dCanvas.height);
    if(this.showControlPolygon)
    {
        // Connect nodes with a line
        setColors(this.ctx,'rgb(10,70,160)');
        this.drawControlPolygon();

        // Draw control points
        setColors(this.ctx,'rgb(10,70,160)','white');
        this.drawControlPoints();
    }
    
    if (this.nodes.length < 3)
        return;
    
    // De Casteljau split for one time
    var split = this.deCasteljauSplit(this.tParameter);
    setColors(this.ctx, 'red');
    split.left.drawControlPolygon();
    setColors(this.ctx, 'green');
    split.right.drawControlPolygon();
    
    setColors(this.ctx,'red','red');
    split.left.drawControlPoints();
    setColors(this.ctx,'green','green');
    split.right.drawControlPoints();
    
    // Draw the parameter value.
    drawText(this.ctx, this.nodes[0].x - 20,
                       this.nodes[0].y + 20,
                         "t = " + this.tParameter);
}

// NOTE: Code for task 2
BezierCurve.prototype.drawTask2 = function()
{
    this.ctx.clearRect(0, 0, this.dCanvas.width, this.dCanvas.height);
    
    if (this.showControlPolygon)
    {
        // Connect nodes with a line
        setColors(this.ctx,'rgb(10,70,160)');
        this.drawControlPolygon();

        // Draw control points
        setColors(this.ctx,'rgb(10,70,160)','white');
        this.drawControlPoints();
    }

    if (this.nodes.length < 3)
        return;
    
    // De-casteljau's recursive evaluation
    setColors(this.ctx,'black');
    this.deCasteljauDraw(this.tDepth);
}

// NOTE: Code for task 3
BezierCurve.prototype.drawTask3 = function()
{
    this.ctx.clearRect(0, 0, this.dCanvas.width, this.dCanvas.height);
    
    if (this.showControlPolygon)
    {
        // Connect nodes with a line
        setColors(this.ctx,'rgb(10,70,160)');
        this.drawControlPolygon();

        // Draw control points
        setColors(this.ctx,'rgb(10,70,160)','white');
        this.drawControlPoints();
    }

    if (this.nodes.length < 3)
        return;
    
    // De-casteljau's recursive evaluation
    setColors(this.ctx,'black');
    this.deCasteljauDraw(this.tDepth);
    
    // adaptive draw evaluation
    if(this.showAdaptiveSubdivision)
        this.adapativeDeCasteljauDraw();
}

// Add a contro point to the Bezier curve
BezierCurve.prototype.addNode = function(x,y)
{
    if (this.nodes.length < 4)
        this.nodes.push(new Node(x,y));
}
