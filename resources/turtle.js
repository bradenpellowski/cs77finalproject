var Turtle = function(canvasId, ctx){
	
	this.string = "";
	this.tParameter = 0;
	this.lParameter = 100;
	this.selectedModel = 0;
	this.isLSystem = false;
	this.numF = 0;
	this.xf = 0;

    
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
    this.countF();
    if(this.isLSystem){
		this.xorigin = (this.dCanvas.width/2);
    	this.yorigin = (this.dCanvas.height/2) + (this.lParameter/12);

	}
    else if(this.selectedModel==0){
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
    
}

Turtle.prototype.push = function(){

	var map = {
		x: this.x,
		y: this.y,
		xorigin: this.xorigin,
		yorigin: this.yorigin,
		pd: this.pd,
		a: this.a
	}
	this.stack.push(map);
	this.ctx.save();
	return this;
}

Turtle.prototype.pop = function(){

	var map = this.stack.pop();
	this.x = map.x;
	this.y = map.y;
	this.xorigin = map.xorigin;
	this.yorigin = map.yorigin;
	this.pd = map.pd;
	this.a = map.a;
	this.ctx.restore();
	return this;
}

Turtle.prototype.selectModel = function(idx) {
    this.selectedModel = idx;
    this.countF();
    if(this.isLSystem){
		this.xorigin = (this.dCanvas.width/2);
    	this.yorigin = (this.dCanvas.height/2) + (this.lParameter/12);
	}
    else if(this.selectedModel==0){
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

	// if(xn!=null && this.isLSystem){
	// 	this.xf = xn;
	// }

	this.x = xn;
	this.y = yn;



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

Turtle.prototype.setAngle = function(an){
	
	this.angle = an;
	this.draw();
}

Turtle.prototype.draw = function(){

	this.setA(0);
	this.x = this.xorigin;
	this.y = this.yorigin;
	this.ctx.clearRect(0, 0, this.dCanvas.width, this.dCanvas.height);
	if(this.isLSystem){
		if(this.string != ""){
			this.pd = false;
			this.xf = 0;
			this.drawLSystem(this.tParameter,this.lParameter);
			this.pd = true;
			var dist = (this.xf - this.xorigin)/2;
			this.x= this.xorigin - dist;
			this.drawLSystem(this.tParameter,this.lParameter);
		}
	}else if(this.selectedModel==0){
		this.drawKochCurve(this.tParameter,this.lParameter);
	}else if (this.selectedModel == 1){
		this.drawKochSnowflake(this.tParameter, this.lParameter/2);;
	}else{
		this.drawKochSquare(this.tParameter,this.lParameter);
	}


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



Turtle.prototype.setLSystem = function()
{
    this.isLSystem = true;
}

Turtle.prototype.setT = function(t)
{	

	if(t==0)
		setColors(this.ctx,'white','white');
	else if(t==1)
		setColors(this.ctx,'red','red');
	else if(t==2)
		setColors(this.ctx,'orange','orange');
	else if(t==3)
		setColors(this.ctx,'yellow','yellow');
	else if(t==4)
		setColors(this.ctx,'green','green');
	else if(t==5)
		setColors(this.ctx,'blue','blue');
	else if(t==6)
		setColors(this.ctx,'purple','purple');
	else if(t==7)
		setColors(this.ctx,'pink','pink');

    this.tParameter = t;
    this.draw();
}
Turtle.prototype.setL = function(l)
{
    this.lParameter = l;
    this.countF();
    if(this.isLSystem){
		this.xorigin = (this.dCanvas.width/2);
    	this.yorigin = (this.dCanvas.height/2) + (this.lParameter/12);
	}
    else if(this.selectedModel==0){
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

Turtle.prototype.setString = function(s){
	this.string = s;
	this.countF();
}

Turtle.prototype.countF = function(){
	this.numF=0;

	// if(this.string.charAt(0)=="F"){
	// 		this.numF = this.numF+1;
	// }

	var turn = 0;
	

	for(var i = 0; i < this.string.length; i++){
		var l = this.string.charAt(i);
		if(l=="+"){
			turn = turn + 1;
		}
		if(l=="-"){
			turn = turn - 1;
		}
		if((l=="F") && (turn/4==0)){
			this.numF = this.numF+1;
		}
	}
}

Turtle.prototype.drawLSystem = function(i,length){
	
	this.xf = Math.max(this.xf,this.x);

	if(i==0){
		
		this.parse(0,length);
	}else{
		for(var j = 0; j < this.string.length; j++){
			var l = this.string.charAt(j);

			if(l=="F"){
				
				this.drawLSystem(i-1,length/3)
			}
			else if(l=="+"){
				this.right(this.angle);
			}
			else if(l=="-"){
				this.left(this.angle);
			}
			else if(l=="["){
				this.push();
			}
			else if(l=="]"){
				this.pop();
			}
			else{
				console.log("Error: Invalid Character");
				return;
			}
		}
		
	}

	return this;
}



Turtle.prototype.parse = function(ind, length){
	
	var l = this.string.charAt(ind);
	this.xf = Math.max(this.xf,this.x);

	if(l==null||l==""){
		return;
	}
	else if(l=="F"){
		this.move(length);
	}
	else if(l=="+"){
		this.right(this.angle);
	}
	else if(l=="-"){
		this.left(this.angle);
	}
	else if(l=="["){
		this.push();
	}
	else if(l=="]"){
		this.pop();
	}
	else{
		console.log("Error: Invalid Character");
		return;
	}
	this.parse(ind+1,length);
	return;
}
