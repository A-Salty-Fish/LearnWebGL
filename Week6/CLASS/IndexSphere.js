"use strict";

var canvas;
var gl;

var numVertices  = 36;

var axis = 0;
var xAxis = 0;
var yAxis =1;
var zAxis = 2;
var theta = [ 0, 0, 0 ];
var thetaLoc;

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

window.onload = function init()
{
    for (var i =0 ;i <vertexColors.length;i++) vertexColors[i] =
        [
            Math.random(),
            Math.random(),
            Math.random(),
            1]
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    //初始化球
    IndexSphere(0.5,11,15);
    // InitColor(11,15);
    // array element buffer
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(VerticesIndex), gl.STATIC_DRAW);
    // color array atrribute buffer
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(IndexColors), gl.STATIC_DRAW );
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
    // vertex array attribute buffer
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(Vertices), gl.STATIC_DRAW );
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
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

function degToRad(deg){return deg * Math.PI / 180;}//角度转弧度
function lglt2xyz(longitude,latitude,radius){//经纬度转三维坐标
    var lg = degToRad(longitude) , lt = degToRad(latitude);
    var z = radius * Math.sin(lt);
    var temp = radius * Math.cos(lt);
    var y = temp * Math.sin(lg);
    var x = temp * Math.cos(lg);
    return vec3(x,y,z);
}

var Vertices=[];//存放顶点坐标
function InitVertices(radius, columns ,rows){//生成球上的点 columns为纬度数 rows为经度数
    Vertices[0] = vec3(0,0, -1 *radius);
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
    Vertices[index] = vec3(0,0,radius);
}
//顶点索引方法
var VerticesIndex = [];//存放顶点索引
var IndexColors = [];//存放顶点色彩
function MyTriIndex(a,b,c){
    VerticesIndex.push(a);
    VerticesIndex.push(b);
    VerticesIndex.push(c);
    IndexColors.push(vertexColors[a%vertexColors.length]);
    IndexColors.push(vertexColors[b%vertexColors.length]);
    IndexColors.push(vertexColors[c%vertexColors.length]);
}
function MyQuadIndex(a,b,c,d){
    VerticesIndex.push(a);
    VerticesIndex.push(b);
    VerticesIndex.push(c);
    VerticesIndex.push(a);
    VerticesIndex.push(c);
    VerticesIndex.push(d);
    IndexColors.push(vertexColors[a%vertexColors.length]);
    IndexColors.push(vertexColors[b%vertexColors.length]);
    IndexColors.push(vertexColors[c%vertexColors.length]);
    IndexColors.push(vertexColors[a%vertexColors.length]);
    IndexColors.push(vertexColors[c%vertexColors.length]);
    IndexColors.push(vertexColors[d%vertexColors.length]);
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

    gl.drawElements( gl.TRIANGLES, VerticesIndex.length, gl.UNSIGNED_BYTE, 0 );

    requestAnimFrame( render );
}
