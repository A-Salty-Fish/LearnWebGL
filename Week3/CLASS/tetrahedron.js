var canvas = document.getElementById("canvas");
canvas_rect = canvas.getBoundingClientRect();
canvas_width = canvas_rect.width

window.onload = function() {
    // Get A WebGL context
    var gl = canvas.getContext("experimental-webgl");

    // setup a GLSL program
    var vertexShader = createShaderFromScriptElement(gl, "2d-vertex-shader");
    var fragmentShader = createShaderFromScriptElement(gl, "2d-fragment-shader");
    var program = createProgram(gl, [vertexShader, fragmentShader]);
    gl.useProgram(program);

    // set color
    var colorLocation = gl.getUniformLocation(program, "u_color");

    // set the resolution
    var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

    // Create a buffer
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(resolutionLocation);
    gl.vertexAttribPointer(resolutionLocation, 2, gl.FLOAT, false, 0, 0);
    //z-buffer algorithm
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawRecursiveTriangels(gl,colorLocation,canvas_width/2,canvas_width/2 + canvas_width/8,canvas_width,4);
}

//将三角形入缓冲区
function setTriangle(gl, x1, y1, x2, y2, x3, y3){
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y2,
        x3, y3,
    ]), gl.STATIC_DRAW);
}
