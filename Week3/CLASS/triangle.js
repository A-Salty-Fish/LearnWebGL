var canvas = document.getElementById("canvas");
canvas_rect = canvas.getBoundingClientRect();
canvas_width = canvas_rect.width
var program;
var sqrt3 = Math.sqrt(3.0);
window.onload = function() {
    // Get A WebGL context
    var gl = canvas.getContext("experimental-webgl");

    // setup a GLSL program
    var vertexShader = createShaderFromScriptElement(gl, "2d-vertex-shader");
    var fragmentShader = createShaderFromScriptElement(gl, "2d-fragment-shader");
    program = createProgram(gl, [vertexShader, fragmentShader]);
    gl.useProgram(program);

    // set the resolution
    var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

    // Create a buffer
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(resolutionLocation);
    gl.vertexAttribPointer(resolutionLocation, 2, gl.FLOAT, false, 0, 0);

    drawTriangles(gl,canvas_width/2,canvas_width*5/8,canvas_width,5);
}

//将三角形入缓冲区
function setTriangle(gl, x1, y1, x2, y2, x3, y3){
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y2,
        x3, y3,
        ]), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}
function drawRecursiveTriangels(gl, x1,y1,x2,y2,x3,y3, depth){
    if (depth == 0)
        setTriangle(gl, x1,y1,x2,y2,x3,y3,);
    else {
        var x1x2 = (x1 + x2) / 2.0;
        var y1y2 = (y1 + y2) / 2.0;
        var x1x3 = (x1 + x3) / 2.0;
        var y1y3 = (y1 + y3) / 2.0;
        var x2x3 = (x2 + x3) / 2.0;
        var y2y3 = (y2 + y3) / 2.0;
        drawRecursiveTriangels(gl, x1,y1,x1x2,y1y2,x1x3,y1y3, depth-1);
        drawRecursiveTriangels(gl, x2,y2,x2x3,y2y3,x1x2,y1y2, depth-1);
        drawRecursiveTriangels(gl, x3,y3,x1x3,y1y3,x2x3,y2y3, depth-1);
    }
}
function drawTriangles(gl,centerX,centerY,width,depth){
    var centerLocation = gl.getUniformLocation(program,"u_center");
    gl.uniform2f(centerLocation,centerX,centerY);
    var widthLocation = gl.getUniformLocation(program,"u_width");
    gl.uniform1f(widthLocation,width);
    drawRecursiveTriangels(gl,
        centerX,centerY-width/sqrt3,
        centerX-width/2,centerY+width*sqrt3/6.0,
        centerX+width/2,centerY+width*sqrt3/6.0,
        depth
    )
}
