function setupTask(canvasId, taskFunction) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.log("Could not find canvas with id", canvasId);
        return;
    }
    
    try {
        var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    } catch (e) {}
    if (!gl) {
        console.log("Could not initialise WebGL");
        return;
    }
    
    var renderWidth, renderHeight;
    function computeCanvasSize() {
        renderWidth = Math.min(canvas.parentNode.clientWidth - 20, 820);
        renderHeight = Math.floor(renderWidth*9.0/16.0);
        canvas.width  = renderWidth;
        canvas.height = renderHeight;
        gl.viewport(0, 0, renderWidth, renderHeight);
    }
    
    window.addEventListener('resize', computeCanvasSize);
    computeCanvasSize();
    
    var task = new taskFunction(gl);
    
    var mouseDown = false;
    var lastMouseX, lastMouseY;
    var mouseMoveListener = function(event) {
        task.dragCamera(event.screenX - lastMouseX, event.screenY - lastMouseY);
        lastMouseX = event.screenX;
        lastMouseY = event.screenY;
    };
    canvas.addEventListener('mousedown', function(event) {
        if (!mouseDown && event.button == 0) {
            mouseDown = true;
            lastMouseX = event.screenX;
            lastMouseY = event.screenY;
            document.addEventListener('mousemove', mouseMoveListener);
        }
        event.preventDefault();
    });
    document.addEventListener('mouseup', function(event) {
        if (mouseDown && event.button == 0) {
            mouseDown = false;
            document.removeEventListener('mousemove', mouseMoveListener);
        }
    });
    
    var renderLoop = function() {
        task.render(gl, renderWidth, renderHeight);
        window.requestAnimationFrame(renderLoop);
    }
    window.requestAnimationFrame(renderLoop);
    
    return task;
}

var VertexSource = `
    uniform mat4 ModelViewProjection;
    
    attribute vec3 Position;
    
    void main() {
        gl_Position = ModelViewProjection*vec4(Position, 1.0);
    }
`;
var FragmentSource = `
    precision highp float;
    
    uniform vec4 Color;

    void main() {
        gl_FragColor = Color;
    }
`;

function createVertexBuffer(gl, vertexData) {
    var vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
    return vbo;
}
function createIndexBuffer(gl, indexData) {
    var ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
    return ibo;
}
function createShaderObject(gl, shaderSource, shaderType) {
    var shaderObject = gl.createShader(shaderType);
    gl.shaderSource(shaderObject, shaderSource);
    gl.compileShader(shaderObject);
    
    if (!gl.getShaderParameter(shaderObject, gl.COMPILE_STATUS)) {
        // Add some line numbers for convenience
        var lines = shaderSource.split("\n");
        for (var i = 0; i < lines.length; ++i)
            lines[i] = ("   " + (i + 1)).slice(-4) + " | " + lines[i];
        shaderSource = lines.join("\n");
    
        throw new Error(
            (shaderType == gl.FRAGMENT_SHADER ? "Fragment" : "Vertex") + " shader compilation error for shader '" + name + "':\n\n    " +
            gl.getShaderInfoLog(shaderObject).split("\n").join("\n    ") +
            "\nThe shader source code was:\n\n" +
            shaderSource);
    }
    
    
    return shaderObject;
}
function createShaderProgram(gl, vertexSource, fragmentSource) {
    var   vertexShader = createShaderObject(gl,   vertexSource, gl.  VERTEX_SHADER);
    var fragmentShader = createShaderObject(gl, fragmentSource, gl.FRAGMENT_SHADER);
    
    var program = gl.createProgram();
    gl.attachShader(program,   vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    return program;
}

var TriangleMesh = function(gl, vertexPositions, indices, edgeIndices) {
    this.indexCount = indices.length;
    this.edgeIndexCount = edgeIndices.length;
    this.positionVbo = createVertexBuffer(gl, vertexPositions);
    this.indexIbo = createIndexBuffer(gl, indices);
    this.edgeIndexIbo = createIndexBuffer(gl, edgeIndices);
    this.shaderProgram = createShaderProgram(gl, VertexSource, FragmentSource);
}

TriangleMesh.prototype.render = function(gl, model, view, projection, drawFaces, drawWireframe, wireColor) {
    drawFaces = defaultArg(drawFaces, true);
    drawWireframe = defaultArg(drawWireframe, true);
    wireColor = defaultArg(wireColor, new Vector(0,0,0));

    var modelViewProjection = projection.multiply(view).multiply(model);
    
    gl.useProgram(this.shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionVbo);
    var positionAttrib = gl.getAttribLocation(this.shaderProgram, "Position");
    gl.enableVertexAttribArray(positionAttrib);
    gl.vertexAttribPointer(positionAttrib, 3, gl.FLOAT, false, 0, 0);
    
    if (drawFaces) {
        gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram, "ModelViewProjection"), false, modelViewProjection.transpose().m); 
        gl.uniform4f(gl.getUniformLocation(this.shaderProgram, "Color"), 0, 100, 0, 1); 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexIbo);
        gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
    }
    
    if (drawWireframe) {
        gl.lineWidth(.01);
        
        modelViewProjection = Matrix.translate(0, 0, -1e-4).multiply(modelViewProjection);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram, "ModelViewProjection"), false, modelViewProjection.transpose().m); 
        
        gl.uniform4f(gl.getUniformLocation(this.shaderProgram, "Color"), wireColor.x, wireColor.y, wireColor.z, 1); 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgeIndexIbo);
        gl.drawElements(gl.LINES, this.edgeIndexCount, gl.UNSIGNED_SHORT, 0);
    }
}
