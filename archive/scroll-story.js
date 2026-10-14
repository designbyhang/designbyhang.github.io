/* Generic scroll-driven story renderer. Reads a scenes.json exported from Figma frames
   (artboard coordinates) and plays build steps as the user scrolls. No dependencies. */
(async()=>{
const host=document.getElementById('story');const src=host.dataset.src;const base=src.replace(/[^/]+$/,'');
const RM=matchMedia('(prefers-reduced-motion: reduce)');
const FONT={'SF Pro':'-apple-system,"SF Pro Text","SF Pro Display",Inter,system-ui,sans-serif','Instrument Sans':'"Instrument Sans",system-ui,sans-serif','Bitcount Grid Single':'"Bitcount Grid Single","Bitcount Prop Single",monospace'};
let doc;try{doc=await (await fetch(src,{cache:'no-cache'})).json();}catch(e){host.innerHTML='<p class="ss-err">Couldn’t load the story. Serve the site over http (see README).</p>';return;}
const [AW,AH]=doc.artboard;const imgBase=base+(doc.imagesBase||'images/');
const view=document.createElement('div');view.className='ss-view';host.appendChild(view);
const panel=document.createElement('div');panel.className='ss-panel';panel.setAttribute('aria-live','polite');host.appendChild(panel);
const spacer=document.createElement('div');spacer.className='ss-spacer';host.appendChild(spacer);
const bar=document.createElement('div');bar.className='ss-bar';bar.innerHTML='<i></i>';document.body.appendChild(bar);
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
function textNode(e,el){
  el.className='ss-t';const s=el.style;
  s.fontFamily=FONT[e.font]||e.font;s.fontWeight=e.weight;s.fontSize=e.size+'px';s.color=e.color;
  if(e.lhr)s.lineHeight=e.lhr;else if(e.lh)s.lineHeight=e.lh+'px';if(e.ls)s.letterSpacing=e.ls+'px';s.textAlign=e.align==='justified'?'justify':e.align;
  if(e.italic)s.fontStyle='italic';if(e.nowrap)s.whiteSpace='pre';if(e.case==='UPPER')s.textTransform='uppercase';
  s.justifyContent={top:'flex-start',center:'center',bottom:'flex-end'}[e.valign]||'flex-start';
  const inner=document.createElement('span');
  const fix=t=>t.replace(/\u2028/g,'\n');
  if(e.runs){const dom=e.runs.reduce((m,r)=>{const k=(r.s||e.size)+'|'+(r.lh||e.lh)+'|'+(r.ls??e.ls);m[k]=(m[k]||0)+r.t.length;return m;},{});
    const [ds,dl,dls]=Object.entries(dom).sort((a,b)=>b[1]-a[1])[0][0].split('|');s.fontSize=ds+'px';const dr=e.runs.find(r=>(r.s||e.size)==ds&&r.lhr);if(dr)s.lineHeight=dr.lhr;else if(e.lhr)s.lineHeight=e.lhr;else if(dl!=='undefined'&&dl!=='null')s.lineHeight=dl+'px';s.letterSpacing=dls+'px';e.runs.forEach(r=>{const sp=document.createElement('span');sp.textContent=fix(r.t);if(r.c)sp.style.color=r.c;if(r.w)sp.style.fontWeight=r.w;if(r.s)sp.style.fontSize=r.s+'px';if(r.ls!=null)sp.style.letterSpacing=r.ls+'px';sp.style.fontSize=(r.s||e.size)+'px';if(r.i)sp.style.fontStyle='italic';if(r.u==='UNDERLINE')sp.style.textDecoration='underline';if(r.u==='STRIKETHROUGH')sp.style.textDecoration='line-through';inner.appendChild(sp);});}
  else if(e.list){let n=0;e.text.split('\n').map(fix).forEach((ln,i)=>{const d=document.createElement('div');const t=e.list[i]||'NONE';
    if(t==='ORDERED'){n++;d.className='ss-li';d.dataset.m=n+'.';}else if(t==='UNORDERED'){d.className='ss-li';d.dataset.m='•';}else n=0;
    d.textContent=ln||'\u00a0';if(e.para)d.style.marginBottom=e.para+'px';inner.appendChild(d);});}
  else inner.textContent=fix(e.text);
  el.appendChild(inner);
}
const scenes=doc.scenes.map((sc,si)=>{
  const root=document.createElement('section');root.className='ss-scene';root.setAttribute('aria-label',`Slide ${si+1}`);
  const art=document.createElement('div');art.className='ss-art';root.appendChild(art);view.appendChild(root);
  const nodes={};
  sc.elements.forEach(e=>{
    let el;
    if(e.kind==='img'){
      if(e.video){el=document.createElement('video');Object.assign(el,{muted:true,loop:true,playsInline:true,autoplay:true,poster:imgBase+e.src,src:imgBase+e.video});}
      else{el=document.createElement('img');el.src=imgBase+e.src;el.alt='';el.decoding='async';if(si>1)el.loading='lazy';}
      el.className='ss-i';
    }else if(e.kind==='text'){el=document.createElement('div');textNode(e,el);}
    else{el=document.createElement('div');el.className='ss-b';const s=el.style;if(e.bg)s.background=e.bg;if(e.clip)s.overflow='hidden';
      if(e.rr)s.borderRadius=e.rr.map(r=>r+'px').join(' ');else if(e.radius)s.borderRadius=e.radius+'px';if(e.shadow)s.boxShadow=e.shadow;
      if(e.stroke){const[w,c,a]=e.stroke;s.outline=`${w}px solid ${c}`;s.outlineOffset=a==='OUTSIDE'?'0px':a==='CENTER'?`${-w/2}px`:`${-w}px`;}}
    const parentKey=e.parent;const p=parentKey&&nodes[parentKey]?nodes[parentKey].el:art;p.appendChild(el);
    nodes[e.key]={el,e,last:''};
  });
  return {sc,root,art,nodes,n:sc.steps.length,start:0};
});
let total=0;const XF=.35;
scenes.forEach(s=>{s.start=total;total+=s.n;});
const UNIT=()=>innerHeight*(innerWidth<700?0.75:0.9);
let mobile=false,scale=1;
function layout(){
  mobile=innerWidth<700&&innerHeight>innerWidth;
  const vw=innerWidth,vh=innerHeight;
  const availH=mobile?vh*0.5:vh;
  scale=Math.min(vw/AW,availH/AH);
  const ox=(vw-AW*scale)/2,oy=mobile?Math.max(56,(availH-AH*scale)/2+40):(vh-AH*scale)/2;
  scenes.forEach(s=>{s.art.style.transform=`translate(${ox}px,${oy}px) scale(${scale})`;});
  panel.style.top=(oy+AH*scale+16)+'px';host.classList.toggle('ss-mobile',mobile);
  spacer.style.height=(total-1)*UNIT()+innerHeight+'px';
  render(true);
}
function stateAt(s,p){ // p: float step index
  const k=Math.floor(p),f=p-k;const A=s.sc.steps[cl(k,0,s.n-1)],B=s.sc.steps[cl(k+1,0,s.n-1)];
  const e=RM.matches?(f<.5?0:1):ease(cl((f-.35)/.65,0,1));
  return {A,B,e};
}
let lastStepKey='';
function render(force){
  const u=scrollY/UNIT();
  bar.firstChild.style.transform=`scaleX(${cl(u/(total-1),0,1)})`;
  scenes.forEach((s,si)=>{
    const t=u-s.start;
    let op=1;
    if(t<-XF||t>s.n-1+XF+ (si===scenes.length-1?9e9:0)){ if(s.vis){s.root.style.visibility='hidden';s.root.setAttribute('aria-hidden','true');s.vis=false;} return;}
    if(si>0&&t<0)op=RM.matches?(t<-XF/2?0:1):ease(cl((t+XF)/XF,0,1));
    if(si<scenes.length-1&&t>s.n-1)op=RM.matches?(t>s.n-1+XF/2?0:1):1-ease(cl((t-(s.n-1))/XF,0,1));
    if(!s.vis){s.root.style.visibility='visible';s.root.removeAttribute('aria-hidden');s.vis=true;}
    s.root.style.opacity=op;s.root.style.zIndex=op>.5?2:1;
    const p=cl(t,0,s.n-1);const {A,B,e}=stateAt(s,p);
    s.root.style.background=e<.5?A.bg:B.bg;
    for(const k in s.nodes){
      const nd=s.nodes[k],a=A.s[k],b=B.s[k];let x,y,w,h,o,dy=0;
      if(a&&b){x=a[0]+(b[0]-a[0])*e;y=a[1]+(b[1]-a[1])*e;w=a[2]+(b[2]-a[2])*e;h=a[3]+(b[3]-a[3])*e;o=a[4]+(b[4]-a[4])*e;}
      else if(a){[x,y,w,h]=a;o=a[4]*(1-cl((e-.35)/.65,0,1));}
      else if(b){[x,y,w,h]=b;o=b[4]*cl(e/.65,0,1);dy=RM.matches?0:(1-e)*28;}
      else{if(nd.last!=='0'){nd.el.style.display='none';nd.last='0';}continue;}
      const key=`${x|0},${y|0},${w|0},${h|0},${o.toFixed(3)},${dy|0}`;
      if(key===nd.last&&!force)continue;nd.last=key;
      const st=nd.el.style;st.display=o<=0.001?'none':'';st.opacity=o;
      st.transform=`translate(${x}px,${y+dy}px)`;st.width=w+'px';st.height=h+'px';
    }
    if(mobile&&op>.5){const sk=s.sc.id+(e<.5?A.frame:B.frame);if(sk!==lastStepKey){lastStepKey=sk;const S=e<.5?A:B;
      let items=s.sc.elements.filter(el=>el.kind==='text'&&S.s[el.key]&&S.s[el.key][4]>0&&el.size>=20&&el.font!=='Bitcount Grid Single')
        .map(el=>{const r=s.nodes[el.key].el.getBoundingClientRect();return {t:el.text.replace(/\u2028/g,'\n'),y:Math.round(r.top/4),x:r.left,big:el.size>=48};})
        .sort((a,b)=>a.y-b.y||a.x-b.x);
      items=items.filter((a,i)=>!items.some((b,j)=>j!==i&&b.t.length>a.t.length&&b.t.includes(a.t.trim())));
      const bg=getComputedStyle(s.root).backgroundImage.match(/rgba?\(([^)]+)\)/);let light=true;
      if(bg){const [r,g,b2]=bg[1].split(',').map(Number);light=(r*.299+g*.587+b2*.114)>150;panel.style.setProperty('--pbg',`rgb(${r},${g},${b2})`);}
      panel.classList.toggle('light',light);
      panel.innerHTML=items.map(it=>`<p class="${it.big?'h':''}">${it.t.replace(/[&<]/g,c=>c==='&'?'&amp;':'&lt;')}</p>`).join('');}}
  });
}
let raf=0;addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(()=>{raf=0;render();});},{passive:true});
addEventListener('resize',layout);RM.addEventListener?.('change',()=>render(true));
document.fonts?.ready.then(()=>render(true));
layout();
})();
