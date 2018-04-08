## matrix(n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n)的值及其说明
函数|值的说明
```
只有X轴上的旋转，没有扩大缩小、平移
matrix3d(
1,0,0,0,
0,Math.cos(角度值)，Math.sin(-角度值),0,
0,Math.sin(角度值),Math.cos(角度值),0,
0,0,0,1) 

只有Y轴上的旋转，没有扩大缩小、平移
matrix3d(
Math.cos(角度值),0，Math.sin(角度值),0,
0,1,0,0,
Math.sin(-角度值),Math.cos(角度值),0,
0,0,0,1)

只有Z轴上的旋转，没有扩大缩小、平移
matrix3d(
Math.cos(角度值),Math.sin(-角度值),0,0,
Math.sin(角度值),0,Math.cos(角度值),0,0,
0,0,1,0,
0,0,0,1)

只有扩大缩小、没有回转、平移
matrix3d(
sx,0,0,0,
0,sy,0,0,
0,0,sz,0,
0,0,0,1)

只有平移，没有扩大缩小、回转
matrix3d(
1,0,0,0,
0,1,0,0,
0,0,1,0,
tx,ty,tz,1)
```
