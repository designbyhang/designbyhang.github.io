/* Renders a case study from content/projects/<slug>.json. No build step. */
(async()=>{
const root=document.getElementById('main');
const slug=document.body.dataset.slug||new URLSearchParams(location.search).get('p');
const base=document.body.dataset.base||'';
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const img=(f,alt='')=>`<img src="${base}content/projects/${slug}/images/${esc(f)}" alt="${esc(alt)}">`;
const paras=(a,cls)=>(a||[]).map(p=>`<p class="${cls}">${esc(p)}</p>`).join('');
const lbl=t=>t?`<p class="lbl">${esc(t)}</p>`:'';
function card(c){
  if(c.placeholder)return `<div class="card dark ph ${c.size||''}" role="img" aria-label="Image placeholder: ${esc(c.title)}"><span class="lbl">${esc(c.label)}</span><div><b>${esc(c.title)}</b><small>${esc(c.note)}</small></div></div>`;
  if(c.scroll)return `<div class="card doc" tabindex="0" aria-label="Scrollable image: ${esc(c.alt)}">${img(c.image,c.alt)}</div>`;
  if(c.summary)return `<div class="card ${c.style} summ">${img(c.image,'')}<div>${lbl(c.label)}<h2 class="h36">${esc(c.heading)}</h2>${paras(c.paragraphs,'body')}</div></div>`;
  let h=lbl(c.label);
  if(c.heading)h+=`<h2 class="${c.headingSize==28?'h28':'h36'}">${esc(c.heading)}</h2>`;
  if(c.big)h+=`<p class="big48">${esc(c.big)}</p>`;
  h+=paras(c.paragraphs,c.muted?'b64':'b75');
  (c.items||[]).forEach(i=>h+=`<div class="ins"><h3 class="h28">${esc(i.heading)}</h3><p class="b75">${esc(i.text)}</p></div>`);
  if(c.numbered)h+=`<ol class="steps">${c.numbered.map((t,i)=>`<li><span aria-hidden="true">${i+1}</span>${esc(t)}</li>`).join('')}</ol>`;
  (c.stats||[]).forEach(s=>h+=`<p class="n">${esc(s.value)}</p><p class="d"><strong>${esc(s.term)}</strong> ${esc(s.text)}</p>`);
  return `<div class="card ${c.style||'dark'} pad${c.stats?' imp':''}">${h}</div>`;
}
const R={
  figure:s=>`<section class="exits"><p>${esc(s.caption)}</p>${img(s.image,s.alt)}</section>`,
  split:s=>`<section class="card problem"><div>${lbl(s.label)}<h2 class="h36">${esc(s.heading)}</h2>${paras(s.paragraphs,'body')}</div>
    <div class="carousel" aria-roledescription="carousel" aria-label="${esc(s.label)} images"><div class="slides">${s.carousel.map((c,i)=>img(c.image,c.alt).replace('<img','<img'+(i?'':' class="on"'))).join('')}</div>
    ${s.carousel.length>1?'<div class="ctrl"><button type="button" data-d="-1" aria-label="Previous image">‹</button><button type="button" data-d="1" aria-label="Next image">›</button></div>':''}</div></section>`,
  row:s=>`<div class="cols stretch">${s.cards.map(card).join('')}</div>`,
  image:s=>`<div class="card full ${s.style||''}">${img(s.image,s.alt)}</div>`,
  columns:s=>`<div class="cols"><div class="col">${s.left.map(card).join('')}</div><div class="col">${s.right.map(card).join('')}</div></div>`
};
try{
  const r=await fetch(`${base}content/projects/${slug}.json`,{cache:'no-cache'});if(!r.ok)throw new Error(r.status);
  const d=await r.json();document.title=`${d.title} — Design by Hang`;
  root.innerHTML=`<section class="p-hero"><h1>${esc(d.title)}</h1><p class="hl-wrap"><span class="hl">${esc(d.tagline)}</span></p></section>`+d.sections.map(s=>(R[s.type]||(()=>''))(s)).join('');
  root.querySelectorAll('.carousel').forEach(c=>{const s=[...c.querySelectorAll('.slides img')];let i=0;
    c.querySelectorAll('button').forEach(b=>b.onclick=()=>{s[i].classList.remove('on');i=(i+ +b.dataset.d+s.length)%s.length;s[i].classList.add('on');});});
}catch(e){root.innerHTML=`<p style="padding:120px 0">Couldn’t load this project (${esc(e.message)}). If you opened the file directly, serve the folder over http — see README.</p>`;}
})();
