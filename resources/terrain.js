var Terrain = function(gl){

    this.pitch = 0;
    this.yaw = 0;
    this.gl = gl;
    this.order = 1;
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    this.terrainPatch = this.buildTerrain();
    this.mesh = new Mesh(this.terrainPatch['vertices'], this.terrainPatch['faces'], false).toTriangleMesh(this.gl);


}

Terrain.prototype.buildTerrain = function() {
    var vertices = [];
    var faces = [];
    var transform = Matrix.rotate(25, 1, 0, 0).multiply(Matrix.rotate(45, 0, 1, 0));
    var coords = [];


    this.heights = [];

    for(var i=0; i <=(this.order+1)*(this.order+1); i++){
        this.heights.push(0);
    }

    this.heights[0] = 1;
    this.heights[this.order] = 1;
    this.heights[(this.order+1)*this.order] = 1;
    this.heights[(this.order+1)*(this.order+1) - 1] = 1;

    this.computeDS(0,this.order,(this.order+1)*this.order,(this.order+1)*(this.order+1) - 1,this.order);



    for(var i = 0; i<=this.order; i++){
        coords.push(-1.5+(i*(3/this.order)));
    }

    for(var u = 0; u <= this.order; ++u){
        for(var v = 0; v <= this.order; ++v){
            vertices.push(transform.transformPoint(new Vector(coords[u], this.heights[u*(this.order+1)+v], coords[v])));
            
        }
    }   

    for(var i = 0; i < this.order; i++){
        for(var j = 0; j < this.order; j++){
            faces.push([j+((this.order+1)*i), ((this.order+1)*i)+j+1, 
                j+1+(((this.order+1)*(i+1))), j+((this.order+1)*(i+1))]);
        }
    }

    // for(var i = 0; i<this.heights.length; i++){
    //     console.log("heights of");
    //     console.log(i);
    //     console.log("is");
    //     console.log(this.heights[i]);
    // }

    // Do not remove this line
    return {'vertices': vertices, 'faces': faces};
}


Terrain.prototype.computeDS = function(a,b,c,d,order){

    if(order == 1){
        //console.log("ending")
        return;
    }
    var numCol = this.order+1;
    var colA = a%numCol;
    var rowA = (a - colA)/numCol;

    var colB = b%numCol;
    var rowB = (b - colB)/numCol;

    var colC = c%numCol;
    var rowC = (c - colC)/numCol;

    var colD = d%numCol;
    var rowD = (d - colD)/numCol;

    //middle
    var midCol = (colA + colB)/2;
    var midRow = (rowA + rowC)/2;
    var middle = midRow*numCol + midCol;

    this.heights[middle] = ((this.heights[a] + this.heights[b] + this.heights[c] + this.heights[d])/4);//+ (Math.random()-.5)*order/this.order;
    //left
    var leftCol = colA;
    var leftRow = midRow;
    var left = leftRow*numCol + leftCol;
    
    this.heights[left] = (this.heights[a]+this.heights[c])/2;// +(Math.random()-.5)*order/this.order;
    //top
    var topCol = midCol;
    var topRow = rowA;
    var top = topRow*numCol + topCol;
    
    this.heights[top] = (this.heights[a]+this.heights[b])/2;// + (Math.random()-.5)*order/this.order;
    //right
    var rightCol = colD;
    var rightRow = midRow;
    var right = rightRow*numCol + rightCol;
       
    this.heights[right] = (this.heights[b] + this.heights[d])/2;// + (Math.random()-.5)*order/this.order;
    //bottom
    var bottomCol = midCol;
    var bottomRow = rowD;
    var bottom = bottomRow*numCol + bottomCol;
    this.heights[bottom] = (this.heights[c] + this.heights[d])/2;// + (Math.random()-.5)*order/this.order;

    this.computeDS(a,top,left,middle,order/2);
    this.computeDS(top,b,middle,right,order/2);
    this.computeDS(left,middle,c,bottom,order/2);
    this.computeDS(middle,right,bottom,d,order/2);

}

Terrain.prototype.render = function(gl, w, h) {
    gl.viewport(0, 0, w, h);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var projection = Matrix.perspective(35, w/h, 0.1, 100);
    var view =
        Matrix.translate(0, 0, -5).multiply(
        Matrix.rotate(this.pitch, 1, 0, 0)).multiply(
        Matrix.rotate(this.yaw, 0, 1, 0));
    var model = new Matrix();
    
    this.mesh.render(gl, model, view, projection);
}

Terrain.prototype.dragCamera = function(dx, dy) {
    this.pitch = Math.min(Math.max(this.pitch + dy*0.5, -90), 90);
    this.yaw = this.yaw + dx*0.5;
}



Terrain.prototype.setOrder = function(t){
    
    this.order = t;
    this.terrainPatch = this.buildTerrain();
    this.mesh = new Mesh(this.terrainPatch['vertices'], this.terrainPatch['faces'], false).toTriangleMesh(this.gl);

}

