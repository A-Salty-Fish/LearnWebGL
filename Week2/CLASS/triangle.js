var canvas = document.getElementById("canvas");
var gl;
var program;

var IsLength = true;//判断当前是否绘制空心三角形边长
canvas_rect = canvas.getBoundingClientRect();
canvas_width = canvas_rect.width

var LengthPoints = [];//边数组
var TrianglePoints = [];//三角形数组
window.onload = function() {
    // Get A WebGL context
    gl = canvas.getContext("experimental-webgl");

    // setup a GLSL program
    var vertexShader = createShaderFromScriptElement(gl, "2d-vertex-shader");
    var fragmentShader = createShaderFromScriptElement(gl, "2d-fragment-shader");
    program = createProgram(gl, [vertexShader, fragmentShader]);
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

    //DrawPict

    DrawRotatedTriangleLength(200,200,200,10,1);
    // DrawRotatedTriangle(200,200,200,6,1);
}


//
//空心三角形部分
//

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
//生成中心坐标为XY，宽度为X，边nums等分的空心三角形坐标
function GenerateTriangleLengthPoints(centerX,centerY,width,nums){
    LengthPoints = [];//清空边长数组
    GenerateRecursiveTriangleLengthPoints(centerX - width/2,
        centerY + width * Math.sqrt(3)/6,
        width/nums,
        nums);
}
//画中心坐标为XY，宽度为X，边nums等分的空心三角形
function DrawTriangleLength(centerX,centerY,width,nums){
    CleanBackGround();
    GenerateTriangleLengthPoints(centerX,centerY,width,nums);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(LengthPoints), gl.STATIC_DRAW);
    gl.drawArrays(gl.LINES, 0, LengthPoints.length/2);
    console.log(LengthPoints);
}
//画中心坐标为XY，宽度为X，边nums等分,逆时针旋转degree度的空心三角形
function DrawRotatedTriangleLength(centerX,centerY,width,nums,degree){
    SetCenter(centerX, centerY);
    SetRotatedDegree(degree);
    DrawTriangleLength(centerX,centerY,width,nums);
}

//
//实心三角形部分
//

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
function GenerateTrianglePoints(centerX,centerY,width,nums){
    TrianglePoints = [];//清空三角形数组
    GenerateRecursiveTrianglePoints(centerX - width/2,
        centerY + width * Math.sqrt(3)/6,
        width/nums,
        nums);
}
//画中心坐标为XY，宽度为X，边nums等分的实心三角形
function DrawTriangle(centerX,centerY,width,nums){
    CleanBackGround();
    GenerateTrianglePoints(centerX,centerY,width,nums);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(TrianglePoints), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, TrianglePoints.length/2);
    console.log(TrianglePoints);
}
//画中心坐标为XY，宽度为X，边nums等分,逆时针旋转degree度的实心三角形
function DrawRotatedTriangle(centerX,centerY,width,nums,degree) {
    SetCenter(centerX, centerY);
    SetRotatedDegree(degree);
    DrawTriangle(centerX,centerY,width,nums);
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


//
//着色器杂项函数部分
//


//清除画布 默认白色
function CleanBackGround(r=1.0,g=1.0,b=1.0,a=1.0){
    gl.clearColor(r,g,b,a);
    gl.clear(gl.COLOR_BUFFER_BIT);
}
//设置旋转角度
function SetRotatedDegree(degree){
    var degreeLocation = gl.getUniformLocation(program,"u_degree");
    gl.uniform1f(degreeLocation,degree);
}
//设置中心
function SetCenter(centerX, centerY){
    var centerLocation = gl.getUniformLocation(program,"u_center");
    gl.uniform2f(centerLocation,centerX, centerY);
}
//
//响应事件函数
//

function TransformTriangle(){

}
