/* FMSSSnap(stage): puts the scaled 375×812 stage's top-left on a whole device pixel. Call it after every fit (--s change).
   The phone is drawn under one transform, translate(-50%,-50%) scale(--s); centring leaves its origin at a fraction of a device pixel
   (e.g. x 549.92 css px at 2x). Chrome composites the reel's <video> and squashes the overlay drawn over it into a layer of its own;
   a layer at a fractional device offset is resampled when it is drawn, which softened every edge of the overlay by about half a
   pixel (Caption & Browse inline and in full screen). The nudge is under half a device pixel and is not animated. */
(function(){'use strict';
if(window.FMSSSnap)return;
window.FMSSSnap=function(stage){
  stage.style.translate='';const r=stage.getBoundingClientRect(),d=devicePixelRatio||1;
  const f=v=>(Math.round(v*d)-v*d)/d,x=f(r.left),y=f(r.top);
  if(Math.abs(x)>1e-3||Math.abs(y)>1e-3)stage.style.translate=x.toFixed(4)+'px '+y.toFixed(4)+'px'};
})();
