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

    // drawTriColorEqTriangle(gl,colorLocation,canvas_width/2,canvas_width/2,canvas_width/8);
    // drawAGroupOfTriColorEqTriangle(gl,colorLocation,canvas_width/2,canvas_width/2,canvas_width/8);
    // drawFourGroupOfTriColorEqTriangle(gl,colorLocation,canvas_width/2,canvas_width/2,canvas_width/8);
    drawAllGroupOfTriColorEqTriangle(gl,colorLocation,canvas_width/2,canvas_width/2 + canvas_width/8,canvas_width/8);
}

// Returns a random integer from 0 to range - 1.
function randomInt(range) {
    return Math.floor(Math.random() * range);
}
//将三角形入缓冲区
function setTriangle(gl, x1, y1, x2, y2, x3, y3){
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y2,
        x3, y3,
        ]), gl.STATIC_DRAW);
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
//画一组四个等边三角形
function drawAGroupOfTriColorEqTriangle(gl, colorLocation, centerX, centerY, width){
    drawTriColorEqTriangle(gl, colorLocation, centerX, centerY - width * Math.sqrt(3) /3, width);//up
    drawTriColorEqTriangle(gl, colorLocation, centerX - width / 2, centerY + width * Math.sqrt(3)/6, width);//left
    drawTriColorEqTriangle(gl, colorLocation, centerX + width / 2, centerY + width * Math.sqrt(3)/6, width);//right
    drawTriColorEqTriangle(gl, colorLocation, centerX, centerY, width);//center
}
//画一大组三角形，包含四组一共十六个等边三角形
function drawFourGroupOfTriColorEqTriangle(gl, colorLocation, centerX, centerY, width){
    drawAGroupOfTriColorEqTriangle(gl, colorLocation, centerX, centerY - width * Math.sqrt(3) * 2 /3, width)//up
    drawAGroupOfTriColorEqTriangle(gl, colorLocation, centerX - width, centerY + width * Math.sqrt(3) /3, width)//left
    drawAGroupOfTriColorEqTriangle(gl, colorLocation, centerX + width, centerY + width * Math.sqrt(3) /3, width)//right
    drawAGroupOfTriColorEqTriangle(gl, colorLocation, centerX, centerY, width)//center
}
//画出所有四个大组三角形
function drawAllGroupOfTriColorEqTriangle(gl, colorLocation, centerX, centerY, width){
    drawFourGroupOfTriColorEqTriangle(gl, colorLocation, centerX, centerY - width * Math.sqrt(3) * 4 /3, width)//up
    drawFourGroupOfTriColorEqTriangle(gl, colorLocation, centerX - 2 * width, centerY + width * Math.sqrt(3) * 2 /3, width)//left
    drawFourGroupOfTriColorEqTriangle(gl, colorLocation, centerX + 2 * width, centerY + width * Math.sqrt(3) * 2 /3, width)//right
    drawFourGroupOfTriColorEqTriangle(gl, colorLocation, centerX, centerY, width)//center
}
