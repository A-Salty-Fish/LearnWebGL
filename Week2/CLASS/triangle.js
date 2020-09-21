var canvas = document.getElementById("canvas");
canvas_rect = canvas.getBoundingClientRect();
canvas_width = canvas_rect.width
var points = [];

window.onload = function() {
    // Get A WebGL context
    var gl = canvas.getContext("experimental-webgl");

    // setup a GLSL program
    var vertexShader = createShaderFromScriptElement(gl, "2d-vertex-shader");
    var fragmentShader = createShaderFromScriptElement(gl, "2d-fragment-shader");
    var program = createProgram(gl, [vertexShader, fragmentShader]);
    gl.useProgram(program);

    // set color
    // var colorLocation = gl.getUniformLocation(program, "u_color");

    // set the resolution
    var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

    // Create a buffer
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(resolutionLocation);
    gl.vertexAttribPointer(resolutionLocation, 2, gl.FLOAT, false, 0, 0);
    GenerateRecursiveTrianglePoints(0,200,40,5);
    console.log(points);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
    gl.drawArrays(gl.LINES, 0, points.length/2);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
    // gl.uniform4f(colorLocation,
    //     1,
    //     0,
    //     0,
    //     1
    // );
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, points.length);
}

//将三角形入缓冲区
function setTriangle(gl, x1, y1, x2, y2, x3, y3){
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y2,
        x3, y3,
        ]), gl.STATIC_DRAW);
}
function GenerateRecursiveTrianglePoints(leftDownX, leftDownY, width, depth){
    if (depth == 0) return;
    else{
        points.push(leftDownX,leftDownY);
        points.push(leftDownX+width/2,leftDownY-width*Math.sqrt(3)/2);
        points.push(leftDownX+width/2,leftDownY-width*Math.sqrt(3)/2);
        points.push(leftDownX+width,leftDownY);
        points.push(leftDownX+width,leftDownY);
        points.push(leftDownX,leftDownY);

        GenerateRecursiveTrianglePoints(leftDownX+width/2,leftDownY-width*Math.sqrt(3)/2, width,depth-1);
        GenerateRecursiveTrianglePoints(leftDownX+width, leftDownY, width, depth-1);
    }
}
//画三分之一部分的三角形
function setPartOfEqTriangle(gl,centerX,centerY,width,part){
    switch (part){
        case 0://red
            setTriangle(gl,
                centerX, centerY,
                centerX, centerY - width * Math.sqrt(3) /3,
                centerX - width / 2, centerY + width * Math.sqrt(3)/6
            )
            break;
        case 1://green
            setTriangle(gl,
                centerX, centerY,
                centerX - width / 2, centerY + width * Math.sqrt(3)/6,
                centerX + width / 2, centerY + width * Math.sqrt(3)/6,
            )
            break;
        case 2://blue
            setTriangle(gl,
                centerX, centerY,
                centerX, centerY - width * Math.sqrt(3) /3,
                centerX + width / 2, centerY + width * Math.sqrt(3)/6,
            )
            break;
    }
}
//画三色的等边三角形
function drawTriColorEqTriangle(gl, colorLocation, centerX, centerY, width){
    for (var ii = 0; ii < 3; ++ii) {
        // Setup a random rectangle
        setPartOfEqTriangle(gl,centerX,centerY,width,ii%3);
        // Set a random color.
        gl.uniform4f(colorLocation,
            ii % 3 == 0 ? 1 : 0,//red
            ii % 3 == 1 ? 1 : 0,//green
            ii % 3 == 2 ? 1 : 0,//blue
            1);
        // Draw the rectangle.
        gl.drawArrays(gl.TRIANGLES, 0, 4);
    }
}
