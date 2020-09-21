var canvas = document.getElementById("canvas");
canvas_rect = canvas.getBoundingClientRect();
canvas_width = canvas_rect.width

var LengthPoints = [];//边数组
var TrianglePoints = [];//三角形数组
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

    GenerateTriangleLengthPoints(200,200,200,6);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(LengthPoints), gl.STATIC_DRAW);
    gl.drawArrays(gl.LINES, 0, LengthPoints.length/2);
    console.log(LengthPoints);
    // GenerateTrianglePoints(200,200,200,6);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(TrianglePoints), gl.STATIC_DRAW);
    // gl.drawArrays(gl.TRIANGLES, 0, TrianglePoints.length/2);
    // console.log(TrianglePoints);
}

//将三角形入缓冲区
function setTriangle(gl, x1, y1, x2, y2, x3, y3){
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y2,
        x3, y3,
        ]), gl.STATIC_DRAW);
}
//递归生成按边画的等边三角形顶点
function GenerateRecursiveTriangleLengthPoints(leftDownX, leftDownY, width, depth){
    if (depth == 0) return;
    else{
        LengthPoints.push(leftDownX,leftDownY);
        LengthPoints.push(leftDownX+width/2,leftDownY-width*Math.sqrt(3)/2);
        LengthPoints.push(leftDownX+width/2,leftDownY-width*Math.sqrt(3)/2);
        LengthPoints.push(leftDownX+width,leftDownY);
        LengthPoints.push(leftDownX+width,leftDownY);
        LengthPoints.push(leftDownX,leftDownY);

        GenerateRecursiveTriangleLengthPoints(leftDownX+width/2,leftDownY-width*Math.sqrt(3)/2, width,depth-1);
        GenerateRecursiveTriangleLengthPoints(leftDownX+width, leftDownY, width, depth-1);
    }
}
//生成由递归三角形组成的大等边三角形
function GenerateTriangleLengthPoints(centerX,centerY,width,nums){//生成中心坐标为XY，宽度为X，边nums等分的空心三角形
    LengthPoints = [];//清空边长数组
    GenerateRecursiveTriangleLengthPoints(centerX - width/2,
        centerY + width * Math.sqrt(3)/6,
        width/nums,
        nums);
}
//递归生成等边三角形顶点
function GenerateRecursiveTrianglePoints(leftDownX, leftDownY, width, depth) {
    if (depth == 0) return;
    else{
        TrianglePoints.push(leftDownX,leftDownY);
        TrianglePoints.push(leftDownX+width/2,leftDownY-width*Math.sqrt(3)/2);
        TrianglePoints.push(leftDownX+width,leftDownY);
        //补齐空白
        if (depth == 1){}
        else {
            TrianglePoints.push(leftDownX+width/2,leftDownY-width*Math.sqrt(3)/2);
            TrianglePoints.push(leftDownX+width,leftDownY);
            TrianglePoints.push(leftDownX+width*3/2,leftDownY-width*Math.sqrt(3)/2);
        }
        GenerateRecursiveTrianglePoints(leftDownX+width/2,leftDownY-width*Math.sqrt(3)/2, width,depth-1);
        GenerateRecursiveTrianglePoints(leftDownX+width, leftDownY, width, depth-1);
    }
}
//生成由递归三角形组成的大等边三角形
function GenerateTrianglePoints(centerX,centerY,width,nums){//生成中心坐标为XY，宽度为X，边nums等分的空心三角形
    TrianglePoints = [];//清空三角形数组
    GenerateRecursiveTrianglePoints(centerX - width/2,
        centerY + width * Math.sqrt(3)/6,
        width/nums,
        nums);
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
