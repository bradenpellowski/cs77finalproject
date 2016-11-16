var Turtle = function(canvasId, ctx){
	
	this.tParameter = 0;
	this.lParameter = 100;
	this.selectedModel = 0;

	//this.lParameter = 500;
	//this.tParameter = 3;
    // Setup all the data related to the actual curve.
    // this.nodes = new Array();
    // this.showControlPolygon = true;
    // this.showAdaptiveSubdivision = true;
    // this.showSubEnds = true;
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
    if(this.selectedModel==0){
	    this.xorigin = (this.dCanvas.width/2) - (.5*this.lParameter);
	    this.yorigin = (this.dCanvas.height/2) + (this.lParameter/12);
	}
	else if(this.selectedModel==1){
		this.xorigin = (this.dCanvas.width/2) - (this.lParameter/(2*Math.pow(3,.5)))*(Math.cos(30*this.degreeToRadian));
		this.yorigin = (this.dCanvas.height/2) - (this.lParameter/(2*Math.pow(3,.5)) ) * (Math.sin(30*this.degreeToRadian));
	}
	else{
		this.xorigin = (this.dCanvas.width/2) - (.5*this.lParameter);
    	this.yorigin = (this.dCanvas.height/2) + (this.lParameter/12) + 80;
	}
    this.x = this.xorigin;
    this.y = this.yorigin;

    this.a = 0;

    this.pd = true;

    this.stack = [];

    this.degreeToRadian = Math.PI/180;
    
    // Event listeners
    //this.dCanvas.addEventListener('resize', this.computeCanvasSize());
    
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


Turtle.prototype.selectModel = function(idx) {
    this.selectedModel = idx;
    if(this.selectedModel==0){
	    this.xorigin = (this.dCanvas.width/2) - (.5*this.lParameter);
	    this.yorigin = (this.dCanvas.height/2) + (this.lParameter/12);
	}
	else if(this.selectedModel==1){
		this.xorigin = (this.dCanvas.width/2) - (this.lParameter/(2*Math.pow(3,.5)))*(Math.cos(30*this.degreeToRadian));
		this.yorigin = (this.dCanvas.height/2) - (this.lParameter/(2*Math.pow(3,.5)) ) * (Math.sin(30*this.degreeToRadian));
	}
	else{
		this.xorigin = (this.dCanvas.width/2) - (.5*this.lParameter);
    	this.yorigin = (this.dCanvas.height/2) + (this.lParameter/12) + 80;
	}
	this.setA(0);
	this.x = this.xorigin;
	this.y = this.yorigin;
	this.draw();
}

Turtle.prototype.computeCanvasSize = function() 
{
    var renderWidth = Math.min(this.dCanvas.parentNode.clientWidth - 20, 820);
    var renderHeight = Math.floor(renderWidth*9.0/16.0);
    this.dCanvas.width = renderWidth;
    this.dCanvas.height = renderHeight;
}

Turtle.prototype.move = function(d){


	var xn = this.x + d*Math.cos(this.a);
	var yn = this.y + d*Math.sin(this.a);
	
	if(this.pd){
		drawLine(this.ctx,this.x,this.y,xn,yn);
	}

	this.x = xn;
	this.y = yn;

	//console.log("check");

	return(this);
}


Turtle.prototype.left = function(an){
	this.a -= an*this.degreeToRadian;

	return(this);
}

Turtle.prototype.right = function(an){
	this.a += an*this.degreeToRadian;

	return(this);
}

Turtle.prototype.back = function(){
	this.pd = false;

	return(this);
}

Turtle.prototype.setA = function(an){

	this.a = this.degreeToRadian*an;

	return(this);

}

Turtle.prototype.draw = function(){
	//this.move(15);
	//this.setA(60);
	//this.move(15).left(60).move(15).right(120);
	//console.log("check 2");
	// this.move(this.unit);
	// this.lParametereft(60);
	// this.move(this.unit);
	// this.right(120);
	// this.move(this.unit);
	// this.lParametereft(60);
	// this.move(this.unit);
	// return(this);
	this.ctx.clearRect(0, 0, this.dCanvas.width, this.dCanvas.height);
	if(this.selectedModel==0){
		this.drawKochCurve(this.tParameter,this.lParameter);
	}else if (this.selectedModel == 1){
		this.drawKochSnowflake(this.tParameter, this.lParameter/2);
		this.setA(0);
	}else{
		this.drawKochSquare(this.tParameter,this.lParameter);
	}
	this.x = this.xorigin;
	this.y = this.yorigin;

}
Turtle.prototype.drawKochCurve = function(i,length){
	if (i == 0){
		this.move(length);
	}else{
		this.drawKochCurve(i-1, length/3);
		this.left(60);
		this.drawKochCurve(i-1, length/3);
		this.right(120);
		this.drawKochCurve(i-1, length/3);
		this.left(60);
		this.drawKochCurve(i-1, length/3);

	}
	return this;
}

Turtle.prototype.drawKochSnowflake = function(i,length){
	this.drawKochCurve(i,length);
	this.right(120);
	this.drawKochCurve(i,length);
	this.right(120);
	this.drawKochCurve(i,length);
	return this;
}

Turtle.prototype.drawKochSquare = function(i,length){
	if(i==0)
		this.move(length)
	else{
		this.drawKochSquare(i-1,length/3);
		this.left(90);
		this.drawKochSquare(i-1,length/3);
		this.right(90);
		this.drawKochSquare(i-1,length/3);
		this.right(90);
		this.drawKochSquare(i-1,length/3);
		this.left(90);
		this.drawKochSquare(i-1,length/3);
	}

	return this;

}

Turtle.prototype.setT = function(t)
{
    this.tParameter = t;
    this.draw();
}
Turtle.prototype.setL = function(l)
{
    this.lParameter = l;
    if(this.selectedModel==0){
	    this.xorigin = (this.dCanvas.width/2) - (.5*this.lParameter);
	    this.yorigin = (this.dCanvas.height/2) + (this.lParameter/12);
	}
	else if(this.selectedModel==1){
		this.xorigin = (this.dCanvas.width/2) - (this.lParameter/(2*Math.pow(3,.5)))*(Math.cos(30*this.degreeToRadian));
		this.yorigin = (this.dCanvas.height/2) - (this.lParameter/(2*Math.pow(3,.5)) ) * (Math.sin(30*this.degreeToRadian));
	}
	else{
		this.xorigin = (this.dCanvas.width/2) - (.5*this.lParameter);
    	this.yorigin = (this.dCanvas.height/2) + (this.lParameter/12) + 80;
	}
	this.draw();
}
