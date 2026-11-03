/* FMSSBackdrop: the FMSS split-screen backdrop (bu), one model for preview/fmss-all and the Solution 1 / 2 demos (preview/fmss-sol1,
   preview/fmss-sol2); styles in backdrop.css.
   The backdrop sits behind the playing video. On the way into split screen it grows out of the video's surface box (the feed media's
   rect and corners) with the same progress a as the video, to the whole 375 x 734 canvas at a = 1, and on the way out it closes back into
   that box behind the video, frame for frame with it. Its image never moves on screen: bu's rows 0..top, then bu's last row carried
   down past the split line to 734, so whatever shows round the video's bottom corners and under the sheet's top corners is the
   backdrop's own image, never a flat band, the screen white or the bezel black.
   html(src, top, {cls, attrs, dp}): the markup. dp(v) writes a design-px length (default v + 'px'; a drawn-size layer passes its own).
   box(rect, radii, a): the backdrop's box at progress a: {x, y, w, h} from rect [x, y, w, h] to [0, 0, 375, 734], corner radii [tl, tr,
     br, bl] (or one value) to 0.
   clip(b, sm, zx, zy): b (a box()) as a clip-path on the whole canvas, in its own px (zx, zy: canvas px per design px, 1 by default):
     path() with Figma smoothing sm (js/squircle.js) where clip-path:path() is supported, inset() with plain radii otherwise. */
(function(){"use strict";if(window.FMSSBackdrop)return;
const W=375,H=734,lerp=(a,b,e)=>a+(b-a)*e,f2=v=>+v.toFixed(2),
  SQ=typeof CSS!=='undefined'&&CSS.supports&&CSS.supports('clip-path','path(evenodd,"M0 0H1V1Z")');
function html(src,top,o){o=o||{};const d=o.dp||(v=>v+'px');
  return `<div class="${o.cls?o.cls+' ':''}bu"${o.attrs||''}><i><img alt="" src="${src}" style="height:${d(top)}">`+
    `<b style="top:${d(top-1)};height:${d(H+1-top)};background-image:url(${src});background-size:100% ${d(top*(H+1-top))}"></b></i></div>`}
function box(rect,radii,a){const R=Array.isArray(radii)?radii:[radii||0,radii||0,radii||0,radii||0];
  return {x:lerp(rect[0],0,a),y:lerp(rect[1],0,a),w:lerp(rect[2],W,a),h:lerp(rect[3],H,a),R:R.map(v=>f2(v*(1-a)))}}
function clip(b,sm,zx,zy){zx=zx||1;zy=zy||zx;const x=f2(b.x*zx),y=f2(b.y*zy),w=f2(b.w*zx),h=f2(b.h*zy),R=b.R.map(v=>f2(v*zx)),round=R.some(v=>v>.05);
  if(SQ)return `path('${round?Squircle.pathR(w,h,R,sm,x,y):`M${x} ${y}H${f2(x+w)}V${f2(y+h)}H${x}Z`}')`;
  return `inset(${y}px ${f2(W*zx-x-w)}px ${f2(H*zy-y-h)}px ${x}px`+(round?` round ${R.map(v=>v+'px').join(' ')})`:')')}
window.FMSSBackdrop={W,H,html,box,clip};
})();
