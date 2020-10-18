"use strict";

var canvas;
var gl;
//普通绘制
var points = [];
var colors = [];
//顶点索引绘制
var VerticesIndex = [];
var IndexColors = []

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];

var thetaLoc;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    //普通方法绘制
    NormalSphere(0.5,13,15);
    //顶点索引方法
    // IndexSphere(0.5,5,4);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    //普通绘制
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    //顶点索引
    // gl.bufferData( gl.ARRAY_BUFFER, flatten(IndexColors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    //普通绘制
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    //顶点索引
    // gl.bufferData( gl.ARRAY_BUFFER, flatten(Vertices), gl.STATIC_DRAW );
    // var iBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,iBuffer);
    // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint8Array(VerticesIndex),gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    thetaLoc = gl.getUniformLocation(program, "theta");

    //event listeners for buttons

    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
    };

    render();
}

function degToRad(deg){return deg * Math.PI / 180;}
function lglt2xyz(longitude,latitude,radius){//经纬度转三维坐标
    var lg = degToRad(longitude) , lt = degToRad(latitude);
    var z = radius * Math.sin(lt);
    var temp = radius * Math.cos(lt);
    var y = temp * Math.sin(lg);
    var x = temp * Math.cos(lg);
    return vec4(x,y,z,1.0);
}
var Vertices=[];
function InitVertices(radius, columns ,rows){//生成球上的点
    Vertices[0] = vec4(0,0, -1 *radius,1.0);
    var index = 1;
    var PerLatitude = 180 / ( columns -1 );
    var CurrentLatitude = -90 +  PerLatitude;
    var PerLongitude = 360 / rows;
    for (var i =1 ; i < columns - 1 ; i++){
        var CureentLongitude = 0;
        for (var j=0;j<rows;j++){
            Vertices[index] = lglt2xyz(CureentLongitude,CurrentLatitude,radius);
            CureentLongitude += PerLongitude;
            index ++;
        }
        CurrentLatitude += PerLatitude;
    }
    Vertices[index] = vec4(0,0,radius,1.0);
}
//普通方法绘制
function NormalSphere(radius,columns ,rows){
    InitVertices(radius,columns,rows);
    //第一层
    for (var i = 1 ; i < rows ; i++){
        MyTri(0,i,(i+1));
    }
    MyTri(0,rows,1);
    //中间层
    for (var c = 1 ; c < columns - 2; c++)
    {
        var BeginIndex = (c - 1) * rows + 1;
        for (var i = 0 ; i < rows-1 ; i++){
            MyQuad(BeginIndex+i,BeginIndex+i+rows,
                BeginIndex+i+rows+1,BeginIndex+i+1);
        }
        MyQuad(c*rows,(c+1)*rows,
            c*rows+1, BeginIndex);
    }
    //最后一层
    var lastIndex = Vertices.length - 1;
    for (var i = 1 ; i < rows ; i++){
        MyTri(lastIndex,lastIndex-i,lastIndex-i-1);
    }
    MyTri(lastIndex,lastIndex-rows,lastIndex-1);
}
var vertexColors = [
    [ 0.0, 0.0, 0.0, 1.0 ],  // black
    [ 1.0, 0.0, 0.0, 1.0 ],  // red
    [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
    [ 0.0, 1.0, 0.0, 1.0 ],  // green
    [ 0.0, 0.0, 1.0, 1.0 ],  // blue
    [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
    [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
    [ 1.0, 1.0, 1.0, 1.0 ]   // white
];
function MyTri(a,b,c){
    points.push(Vertices[a]);
    colors.push(vertexColors[a%8]);
    points.push(Vertices[b]);
    colors.push(vertexColors[b%8]);
    points.push(Vertices[c]);
    colors.push(vertexColors[c%8]);
}
function MyQuad(a, b, c, d) {
    points.push(Vertices[a]);
    colors.push(vertexColors[a%8]);
    points.push(Vertices[b]);
    colors.push(vertexColors[b%8]);
    points.push(Vertices[c]);
    colors.push(vertexColors[c%8]);
    points.push(Vertices[a]);
    colors.push(vertexColors[a%8]);
    points.push(Vertices[c]);
    colors.push(vertexColors[c%8]);
    points.push(Vertices[d]);
    colors.push(vertexColors[d%8]);
}
//顶点索引方法
var VerticesIndex = [];
function MyTriIndex(a,b,c){
    VerticesIndex.push(a);IndexColors.push(vertexColors[a%8]);
    VerticesIndex.push(b);IndexColors.push(vertexColors[b%8]);
    VerticesIndex.push(c);IndexColors.push(vertexColors[c%8]);
}
function MyQuadIndex(a,b,c,d){
    VerticesIndex.push(a);IndexColors.push(vertexColors[a%8]);
    VerticesIndex.push(b);IndexColors.push(vertexColors[b%8]);
    VerticesIndex.push(c);IndexColors.push(vertexColors[c%8]);
    VerticesIndex.push(a);IndexColors.push(vertexColors[a%8]);
    VerticesIndex.push(c);IndexColors.push(vertexColors[c%8]);
    VerticesIndex.push(d);IndexColors.push(vertexColors[d%8]);
}
function IndexSphere(radius,columns ,rows) {
    InitVertices(radius,columns,rows);
    //第一层
    for (var i = 1 ; i < rows ; i++){
        MyTriIndex(0,i,(i+1));
    }
    MyTriIndex(0,rows,1);
    //中间层
    for (var c = 1 ; c < columns - 2; c++)
    {
        var BeginIndex = (c - 1) * rows + 1;
        for (var i = 0 ; i < rows-1 ; i++){
            MyQuadIndex(BeginIndex+i,BeginIndex+i+rows,
                BeginIndex+i+rows+1,BeginIndex+i+1);
        }
        MyQuadIndex(c*rows,(c+1)*rows,
            c*rows+1, BeginIndex);
    }
    //最后一层
    var lastIndex = Vertices.length - 1;
    for (var i = 1 ; i < rows ; i++){
        MyTriIndex(lastIndex,lastIndex-i,lastIndex-i-1);
    }
    MyTriIndex(lastIndex,lastIndex-rows,lastIndex-1)
}
function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, theta);

    //普通绘制
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    //顶点索引绘制
    // gl.drawElements(gl.TRIANGLES,Vertices.length,gl.UNSIGNED_BYTE,0);

    requestAnimFrame( render );
}
