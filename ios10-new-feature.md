# Video autoplay
```
<div id="either-gif-or-video">
  <video src="2.mp4" autoplay loop muted playsinline controls="controls"></video>
  <img src="1.gif">
</div>
```

# 支持document.execCommand

# WebGL
* 单页面限16个ctx，超出自动销毁
```
var context = canvas.getContext('webgl', { antialias: false});// 默认值为true
var context = canvas.getContext('webgl', { alpha: false});    // false有效
```

# 支持WOFF2.0格式

# CSS3
* object-position
* color-gamut
```
css:
@media (color-gamut: p3) {
  .main {
    background-image: url("photo-wide.jpg");
  }
}
js:
if (window.matchMedia("(color-gamut: p3)").matches) {
  // Do especially colorful stuff here.
}
```
* border-image
* break-after、break-before、break-inside
* image-rendering

```
img[src$=".gif"], img[src$=".png"] {
   image-rendering: -moz-crisp-edges;         /* Firefox */
   image-rendering:   -o-crisp-edges;         /* Opera */
   image-rendering: -webkit-optimize-contrast;/* Webkit (non-standard naming) */
   image-rendering: crisp-edges;
   -ms-interpolation-mode: nearest-neighbor;  /* IE (non-standard property) */
 }
```
