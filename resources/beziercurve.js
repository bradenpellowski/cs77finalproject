// Class definition for a Bezier Curve
var BezierCurve = function(canvasId, ctx)
{
    // Setup all the data related to the actual curve.
    this.nodes = new Array();
    this.showControlPolygon = true;
    this.showAdaptiveSubdivision = true;
    this.showSubEnds = true;
    this.tParameter = 0;
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
    
    // this.dCanvas.addEventListener('mousedown', function(event) {
    //     that.mousePress(event);
    // });
    
    // this.dCanvas.addEventListener('mousemove', function(event) {
    //     that.mouseMove(event);
    // });
    
    // this.dCanvas.addEventListener('mouseup', function(event) {
    //     that.mouseRelease(event);
    // });
    
    // this.dCanvas.addEventListener('mouseleave', function(event) {
    //     that.mouseRelease(event);
    // });
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

BezierCurve.prototype.setShowSubEnds = function(bShow)
{
    this.showSubEnds = bShow;
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

        left.nodes.push(this.nodes[0]);

        right.nodes.push(this.nodes[2]);

        var a = new Node;
        a.lerp(this.nodes[0],this.nodes[1],t);
        

        left.nodes.push(a);

        var b = new Node;
        b.lerp(this.nodes[1],this.nodes[2],t);

        right.nodes.push(b);

        var c = new Node;
        c.lerp(a,b,t);

        left.nodes.push(c);
        right.nodes.push(c);
        // degree 2 bezier curve
        // split the segments about 't'
        // Hint : use lerp()
    }
    else if (this.nodes.length == 4)
    {    

        left.nodes.push(this.nodes[0]);

        right.nodes.push(this.nodes[3]);

        var l2 = new Node;
        l2.lerp(this.nodes[0],this.nodes[1],t);
        

        left.nodes.push(l2);

        var H = new Node;
        H.lerp(this.nodes[1],this.nodes[2],t);


        var l3 = new Node;
        l3.lerp(l2,H,t);
        left.nodes.push(l3);




        var r3 = new Node;
        r3.lerp(this.nodes[3],this.nodes[2],t);
        right.nodes.push(r3);

        var r2 = new Node;
        r2.lerp(H,r3,t);
        right.nodes.push(r2);


        var l4 = new Node;
        l4.lerp(l3,r2,t);
        left.nodes.push(l4);
        right.nodes.push(l4);


        // degree 3 bezier curve
    }

    return {left: left, right: right};
}

// TODO: Task 2 - Implement the De Casteljau draw function.
BezierCurve.prototype.deCasteljauDraw = function(depth)
{
    
    if(depth==0){
        this.drawControlPolygon();
        return;
    }
    else{

        var children = this.deCasteljauSplit(this.tParameter);
        children.left.deCasteljauDraw(depth-1);
        children.right.deCasteljauDraw(depth-1);

    }

    // Check if depth == 0; if so draw the control polygon
    // Else get both children by split
    // recursively call draw on both children
}

// TODO: Task 3 - Implement the adaptive De Casteljau draw function
BezierCurve.prototype.adapativeDeCasteljauDraw = function(showSubEnds){

    var th = 10;
    // NOTE: Only for graduate students
    if(this.nodes.length == 3){
        
        x2x1 = this.nodes[1].x-this.nodes[0].x;
        y2y1 = this.nodes[1].y-this.nodes[0].y;
        x2x3 = this.nodes[1].x-this.nodes[2].x;
        y2y3 = this.nodes[1].y-this.nodes[2].y;

        d1 = Math.pow(Math.pow(x2x1,2) + Math.pow(y2y1,2),.5);
        d2 = Math.pow(Math.pow(x2x3,2) + Math.pow(y2y3,2),.5);

        if((d1>th)||(d2>th)){
            if(showSubEnds){
                setColors(this.ctx,'red');
                this.nodes[0].draw(this.ctx);
                this.nodes[2].draw(this.ctx);
                setColors(this.ctx,'black');
            }
            var children = this.deCasteljauSplit(this.tParameter);
            children.left.adapativeDeCasteljauDraw(showSubEnds);
            children.right.adapativeDeCasteljauDraw(showSubEnds);

        }
        else{
            this.drawControlPolygon();
        }



    }


    if(this.nodes.length == 4){
        
        x2x1 = this.nodes[1].x-this.nodes[0].x;
        y2y1 = this.nodes[1].y-this.nodes[0].y;
        x4x3 = this.nodes[3].x-this.nodes[2].x;
        y4y3 = this.nodes[3].y-this.nodes[2].y;

        d1 = Math.pow(Math.pow(x2x1,2) + Math.pow(y2y1,2),.5);
        d2 = Math.pow(Math.pow(x4x3,2) + Math.pow(y4y3,2),.5);

        if((d1>th)||(d2>th)){
            if(showSubEnds){
                setColors(this.ctx,'red');
                this.nodes[0].draw(this.ctx);
                this.nodes[3].draw(this.ctx);
                setColors(this.ctx,'black');

            }
            var children = this.deCasteljauSplit(this.tParameter);
            children.left.adapativeDeCasteljauDraw(showSubEnds);
            children.right.adapativeDeCasteljauDraw(showSubEnds);

        }
        else{
            this.drawControlPolygon();
        }

    }


    // Compute a flatness measure.
    // If not flat, split and recurse on both
    // Else draw control vertices of the curve
}






// NOTE: Code for task 1
BezierCurve.prototype.drawTask1 = function()
{

    xcen = (this.dCanvas.width/2);
    ycen = (this.dCanvas.height/2);
    p1 = new Node(xcen + 100*Math.sin(0), ycen + 100*Math.cos(0));
    p2 = new Node(xcen + 100*Math.sin(2*Math.PI/3), ycen + 100*Math.cos(2*Math.PI/3));
    p3 = new Node(xcen + 100*Math.sin(4*Math.PI/3), ycen + 100*Math.cos(4*Math.PI/3));

    this.nodes.push(p1);
    this.nodes.push(p2);
    this.nodes.push(p3);

    this.helper();


    this.ctx.clearRect(0, 0, this.dCanvas.width, this.dCanvas.height);
    
    this.drawControlPolygon();


}

BezierCurve.prototype.helper = function(){

    var dir = 0;

    for (var i = 0; i < this.nodes.length; i++) {

    }

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
    //this.deCasteljauDraw(this.tDepth);
    
    // adaptive draw evaluation
    if(this.showAdaptiveSubdivision){
        this.adapativeDeCasteljauDraw(this.showSubEnds);
    }
    else
        this.deCasteljauDraw(this.tDepth);
}

// Add a contro point to the Bezier curve
BezierCurve.prototype.addNode = function(x,y)
{
    if (this.nodes.length < 4)
        this.nodes.push(new Node(x,y));
}
