"use strict";

var canvas;
var gl;

var points = [];
var colors = [];

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

    // colorCube();
    colorSquare(0.5,5,4);

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );


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

//作业部分
function degToRad(deg){return deg * Math.PI / 180;}
function lglt2xyz(longitude,latitude,radius){//经纬度转三维坐标
    var lg = degToRad(longitude) , lt = degToRad(latitude);
    var z = radius * Math.sin(lt);
    var temp = radius * Math.cos(lt);
    var y = temp * Math.sin(lg);
    var x = temp * Math.cos(lg);
    return vec4(x,y,z,1.0);
}
var TestVertices=[];
function InitVertices(radius, columns ,rows){
    TestVertices[0] = vec4(0,0, -1 *radius,1.0);
    var index = 1;
    var PerLatitude = 180 / ( columns -1 );
    var CurrentLatitude = -90 +  PerLatitude;
    var PerLongitude = 360 / rows;
    for (var i =1 ; i < columns - 1 ; i++){
        var CureentLongitude = 0;
        for (var j=0;j<rows;j++){
            // console.log(CureentLongitude+" "+CurrentLatitude);
            TestVertices[index] = lglt2xyz(CureentLongitude,CurrentLatitude,radius);
            CureentLongitude += PerLongitude;
            index ++;
        }
        CurrentLatitude += PerLatitude;
    }
    TestVertices[index] = vec4(0,0,radius,1.0);
}
function colorSquare(radius,columns ,rows){
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
    var lastIndex = TestVertices.length - 1;
    for (var i = 1 ; i < rows ; i++){
        MyTri(lastIndex,lastIndex-i,lastIndex-i-1);
        // points.push(TestVertices[lastIndex]);
        // colors.push(vertexColors[lastIndex%8]);
        // points.push(TestVertices[lastIndex-i]);
        // colors.push(vertexColors[(lastIndex-i)%8]);
        // points.push(TestVertices[lastIndex-i-1]);
        // colors.push(vertexColors[(lastIndex-i-1)%8]);
    }
    MyTri(lastIndex,lastIndex-rows,lastIndex-1)
    // points.push(TestVertices[lastIndex]);
    // colors.push(vertexColors[lastIndex%8]);
    // points.push(TestVertices[lastIndex-rows]);
    // colors.push(vertexColors[(lastIndex-rows)%8]);
    // points.push(TestVertices[(lastIndex-1)%8]);
    // colors.push(vertexColors[(lastIndex-1)%8]);
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
    console.log("Tri "+a+" "+b+" "+c);
    points.push(TestVertices[a]);
    colors.push(vertexColors[a%8]);
    points.push(TestVertices[b]);
    colors.push(vertexColors[a%8]);
    points.push(TestVertices[c]);
    colors.push(vertexColors[a%8]);

    console.log(TestVertices[a]);
    console.log(TestVertices[b]);
    console.log(TestVertices[c]);
}
function MyQuad(a, b, c, d) {
    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c, a, c, d ];
    console.log("Quad "+a+" "+b+" "+c+" "+d);
    for ( var i = 0; i < indices.length; ++i ) {
        points.push( TestVertices[indices[i]] );
        console.log(TestVertices[indices[i]]);
        // if (TestVertices[indices[i]] == undefined) console.log((indices[i]));
        //colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        colors.push(vertexColors[a%8]);

    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, theta);

    gl.drawArrays( gl.TRIANGLES, 0, points.length );

    requestAnimFrame( render );
}
