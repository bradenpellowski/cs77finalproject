var Mesh = function(vertices, faces, joinVerts) {
    this.vertices = vertices;
    this.faces = faces;
    
    if (joinVerts)
        this.joinVertices();
}

Mesh.prototype.joinVertices = function() {
    var vertexMap = {};
    var vertexIndices = [];
    var vertices = [];
    
    function stringCoord(a) {
        if (Math.abs(a) < 1e-3)
            a = 0;
        return a.toFixed(3);
    }
    
    for (var i = 0; i < this.vertices.length; ++i) {
        var key =
            stringCoord(this.vertices[i].x) + ":" +
            stringCoord(this.vertices[i].y) + ":" +
            stringCoord(this.vertices[i].z);
        
        if (key in vertexMap) {
            vertexIndices.push(vertexMap[key]);
        } else {
            vertexMap[key] = vertices.length;
            vertexIndices.push(vertices.length);
            vertices.push(this.vertices[i]);
        }
    }
    
    this.vertices = vertices;
    for (var i = 0; i < this.faces.length; ++i) {
        for (var j = 0; j < this.faces[i].length; ++j)
            this.faces[i][j] = vertexIndices[this.faces[i][j]];
        
        for (var j = 0, k = this.faces[i].length - 1; j < this.faces[i].length;) {
            if (this.faces[i][k] == this.faces[i][j])
                this.faces[i].splice(j, 1);
            else {
                k = j;
                j++;
            }
        }
    }
}

Mesh.prototype.toTriangleMesh = function(gl) {
    var positions = [];
    for (var i = 0; i < this.vertices.length; ++i) {
        positions.push(this.vertices[i].x);
        positions.push(this.vertices[i].y);
        positions.push(this.vertices[i].z);
    }
    
    var edgeIndices = [];
    var indices = [];
    for (var i = 0; i < this.faces.length; ++i) {
        for (var j = 0; j < this.faces[i].length - 2; ++j) {
            indices.push(this.faces[i][0]);
            indices.push(this.faces[i][j + 1]);
            indices.push(this.faces[i][j + 2]);
        }
        for (var j = 0, k = this.faces[i].length - 1; j < this.faces[i].length; k = j, ++j)
            edgeIndices.push(this.faces[i][k], this.faces[i][j]);
    }
    return new TriangleMesh(gl, positions, indices, edgeIndices);
}
