/* HANG custom letters for the homepage intro card: outline paths + band ink extents.
   Glyph units: cap 704, y up, baseline 0. Screen: x = x0 + u*s, y = base - v*s. */
(()=>{const D=window.HANG_GLYPHS,GL=D.glyphs,CAP=D.cap;
const f=n=>(+n.toFixed(2));
function path(k,x0,base,s){return GL[k].c.map(c=>'M'+c.map(p=>[f(x0+p[0]*s),f(base-p[1]*s)].join(' ')).join('L')+'Z').join('');}
/* horizontal ink extent [minX,maxX] (units) of the glyph inside the band v in [lo,hi] (y-up units) */
function inkX(k,lo,hi){let a=1e9,b=-1e9;GL[k].c.forEach(c=>{for(let i=0;i<c.length;i++){const p=c[i],q=c[(i+1)%c.length];
  if(p[1]>=lo&&p[1]<=hi){a=Math.min(a,p[0]);b=Math.max(b,p[0]);}
  [lo,hi].forEach(y=>{if((p[1]-y)*(q[1]-y)<0){const x=p[0]+(q[0]-p[0])*(y-p[1])/(q[1]-p[1]);a=Math.min(a,x);b=Math.max(b,x);}});}});return a>b?[0,0]:[a,b];}
function bounds(k){const P=GL[k].c.flat();return[Math.min(...P.map(p=>p[0])),Math.min(...P.map(p=>p[1])),Math.max(...P.map(p=>p[0])),Math.max(...P.map(p=>p[1]))];}
window.HangLetters={GL,CAP,path,inkX,bounds};})();
