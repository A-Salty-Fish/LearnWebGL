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

    drawAllGroupOfTriColorEqTriangle(gl,colorLocation,canvas_width/2,canvas_width/2 + canvas_width/8,canvas_width/8);
}

// Returns a random integer from 0 to range - 1.
function randomInt(range) {
    return Math.floor(Math.random() * range);
}
function GenerateTrianglePoints(centerX, centerY, width, nums){//中心坐标，边长，边长等分数
    //小三角形边长
    SmallWidth = width / nums;
    //左下角点的坐标
    LeftDownX = centerX - width / 2;
    LeftDownY = centerY + width * Math.sqrt(3) / 6;
    //当前迭代的坐标 始终为每一层梯形的左下角坐标
    CurrentX = LeftDownX;
    CurrentY = LeftDownY;
    points = []
    for (i = 0; i < nums; i++){
        points.push(CurrentX,CurrentY)
        for (j = 1; j <= n - i; j++){
            points.push(CurrentX + j * SmallWidth / 2, CurrentY - SmallWidth * Math.sqrt(3) / 2);
            points.push(CurrentX + j * SmallWidth, CurrentY);
        }
        CurrentX += SmallWidth / 2;
        CurrentY -= SmallWidth * Math.sqrt(3) / 2;
    }
    return points;
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
