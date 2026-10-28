/* VAC cover: the "vac" device-cover player ([data-cover-anim="vac"], js/device-cover.js, load it first): the hero on projects/vac.html only
   (the homepage and NEXT CASE STUDY cards show the still cover art).
   The Solution end to end, "Lower Funnel Ads — with VAC" (Figma vac_21): the user meets a video ad in Feed, taps it into Split Screen
   (the video on top, the advertiser's site in a sheet below), swipes the sheet down into the Reels Player, swipes up through the chained
   ads, and Back returns to Feed. Every gesture is scripted and shown by the touch marker (DeviceCover.finger); the demo takes no input.
   The ads are Hang's (Ad Video Assets). The seed is Porsche (porsche.mp4, Hang's Porsche Taycan spot, portrait; the same file and poster
   as the VAC prototype, preview/vac-proto: one shared seed, defined once in ADS[0] below), then the eyewear chain VAC serves on the intent
   that click signals: Ray-Ban Meta (rayban.mp4, 7.0-11.4s of the spot), Warby Parker (warby.mp4, 6.0-10.4s) and LensCrafters
   (lenscrafters.mp4, 6.4-10.4s, cropped to the frame's top 80% so its burned-in subtitles never reach the Reels caption band), all in
   assets/vac-anim/v4/. The seed is 670x1060 (the spot's own frame), cropped by object-fit:cover, centred (object-position 50% 50%,
   css/card.css; the prototype's .mv video is the same): the middle 63% of its height in the Feed media 375x375 and the split video
   351x350, the middle 81% of its width full bleed in Reels (R.reels, 375x734). Its edit is the spot as delivered, in order, 0-12.533s
   (376 frames at 30fps): the Taycan wordmark drive (0:00, the poster and cover frame), the wheel close-up, the desert drive and drift,
   the purple Taycan, the fade to black and the PORSCHE end card, which is in by the swipe out of the seed (11.04s) and holds under the
   Back pop; only the spot's last 2.74s (the end card's static hold) is cut. The wrap is the spot's own end card -> opening cut. Ray-Ban
   7.0-11.4s and Warby 6.0-10.4s have no burned-in text.
   One seamless loop of 21400ms:
     Feed hold 3200 · tap: Feed -> Split 640 · Split hold 3200 · sheet swiped down: Split -> Reels 800 · Porsche Reels hold 3200 ·
     swipe 840 · Ray-Ban hold 2400 · swipe 840 · Warby Parker hold 2400 · swipe 840 · LensCrafters hold 2400 · Back: Reels -> Feed 640
   Motion is FMSS's vocabulary through the shared helpers: Feed -> Split is FMSS's feed -> split (DeviceCover.spring ω16 resampled to 640ms;
   one media layer travels the Feed rect 0,216 375x375 -> the split video rect 12,44 351x350 r16, the player controls ride up with it and
   fade in, the split backdrop dissolves in, the sheet rises to 406). Split -> Reels: the finger drags the sheet 48px down (160ms, ease-in),
   lifts at 600px/s and the sheet falls away on the same spring (640ms) while the media grows into the full Reels frame 0,0 375x734 and
   the Reels UI and chrome dissolve in. Chain swipes: the page is dragged 48px up (160ms) and released into the spring (680ms) with that
   velocity, pages 375x734 apart (the comment bar 734-812 is fixed chrome). Back: a tap on the back chevron, Reels slides off to the right
   while Feed comes in from -120px (the iOS pop), ω16 640ms. Every keyframe sits on the 8ms grid; holds are multiples of 8ms.
   Screens, drawn live (the Figma's Reels component, "Card 6" Screen 140796:11916, for every Reels measure):
   - Feed: Hang's Figma Feed (vac_21) with the advertiser's parts cleared (feed.webp: status bar, Facebook header, "Sponsored", the post's
     menu, the link bar and CTA shapes, reactions, UFI, tab bar) under the post's own DOM: avatar, name + verified badge, caption, link
     bar domain + headline, CTA label, and the seed video in the media rect
   - Split Screen: FMSS's parts and recipe (js/fmss-split.js), shared: status bar + close X overlay (preview/fmss-sol1/assets/bo1.webp),
     the live player controls (js/video-scrubber.js, read only, the FMSS icon crop ci1.webp, faded on the scrubber's HOLD/FADE), the
     shared IAB sheet header (preview/shared/iab/header.js, url/porsche.com.svg) on a white sheet (r16, 60% smoothing) with the advertiser's
     page (porsche-site.webp: the top of the prototype's porsche.com page, preview/vac-proto/assets/page.webp); the backdrop is the video itself, live: drawn small every frame and blurred
   - Reels: each ad full frame with the Figma's bottom gradient, author row (avatar 36, name, verified, globe, Sponsored), one-line
     caption with "more", the advertiser's CTA (303x36 r8, the ad's own colour as Reels does; LensCrafters takes its logo navy #182b50, per Hang), the vertical UFI and fixed chrome (status
     bar, back, protective gradient, comment composer, home indicator)
   Videos are locked to the loop clock (VideoScrubber lock), so every loop shows the same frames: the seed 0:00 at loop 0, 1:1 while it is
   on screen, parked behind the chain (s1e -> tb) on the frame due at tb (11.88s) so the Back pop plays its last 0.64s into the wrap; each
   chained ad starts at 0:00 as its page comes in and is parked while off screen (headless scrubbers: only their lock is
   used; their hidden roots sit in the screen so the in-view ticker runs them).
   Rest (still, reduced motion, first frame) = 0: Feed on the seed's 0:00 frame (the Taycan and its wordmark), which is also its poster
   (porsche.webp) and the cover art. Layers: .vc-* in css/card.css. */
(function(){"use strict";if(!window.DeviceCover)return;
const DC=window.DeviceCover,STEP=DC.STEP,SQ=DC.SQ,PG=734,SH=406;
const lerp=(a,b,e)=>a+(b-a)*e,clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
/* finger drag + release: DD px in DRAG ms (ease-in from rest, leaving at 2*DD/DRAG), then the ω16 spring from there with that velocity */
const DRAG=160,DD=48,V0=2*DD/(DRAG/1000);
const fling=(dist,ms)=>{const d=[];for(let t=0;t<=DRAG;t+=STEP){const u=t/DRAG;d.push(DD*u*u)}
  return d.concat(DC.resample(DC.spring(DD,dist,16,V0),ms).slice(1).map(e=>DD+(dist-DD)*e)).map(x=>x/dist)};   // 0 → 1
const FS=DC.resample(DC.spring(812,407,16),640);    // Feed -> Split (FMSS's feed -> split curve)
const SR=fling(SH,640);                              // Split -> Reels (sheet swiped down), 800ms
const SW=fling(PG,680);                              // chain swipe, 840ms
const BK=DC.resample(DC.spring(0,375,16),640);      // Back to Feed
const dur=S=>(S.length-1)*STEP;
const HF=3200,HS=3200,HP=3200,HC=2400;
const t1=HF,t1e=t1+dur(FS),t2=t1e+HS,t2e=t2+dur(SR),s1=t2e+HP,s1e=s1+dur(SW),s2=s1e+HC,s2e=s2+dur(SW),s3=s2e+HC,s3e=s3+dur(SW),
  tb=s3e+HC,T=tb+dur(BK);                            // 3200 3840 7040 7840 11040 11880 14280 15120 17520 18360 20760 21400
const REST=0;
const LOCK={zero:0,park:[s1e,tb]};                  // seed video lock (above)
// chained ad j (1-3): 0:00 as its page starts to come in (s_j), shown until its page is gone (the next swipe's end; the last one: the
// Back pop's end = the wrap), parked over the rest (to 8ms before s_j: that last frame is off screen, the clip's own loop wraps it to 0:00)
const SJ=[s1,s2,s3],EJ=[s2e,s3e,T],CLOCK=SJ.map((s,i)=>({zero:s,park:[EJ[i]%T,s-STEP]}));
/* the loop as poses: a = Feed -> Split, c = Split -> Reels, k = chain position (0 Porsche .. 3 LensCrafters), b = Back progress (pop = Back) */
const POSE=(()=>{const P=[{t:0,a:0,c:0,k:0,b:0,pop:0}],seg=(t0,S,f)=>S.forEach((e,i)=>P.push({t:t0+i*STEP,...f(e)}));
  seg(t1,FS,e=>({a:e,c:0,k:0,b:0,pop:0}));seg(t2,SR,e=>({a:1,c:e,k:0,b:0,pop:0}));
  [s1,s2,s3].forEach((s,j)=>seg(s,SW,e=>({a:1,c:1,k:j+e,b:0,pop:0})));
  P.push({t:tb,a:1,c:1,k:3,b:0,pop:0});seg(tb,BK,e=>({a:1,c:1,k:3,b:e,pop:1}));   // Back: a jump to pop at tb, under the full last page
  return P})();
const kf=fn=>DC.track(POSE,T,fn);
/* scripted touches (design px): tap the Feed video, drag the sheet down by its header, swipe each chained ad up, tap Back */
const TOUCH=[{t:t1,x:188,y:404},{t:t2,x:188,y:432,dy:DD,move:DRAG},...SJ.map(s=>({t:s,x:232,y:520,dy:-DD,move:DRAG})),{t:tb,x:24,y:70}];
const R={feed:[0,216,375,375],split:[12,44,351,350],reels:[0,0,375,PG]};   // reels: full bleed, the portrait seed cropped by cover (css/card.css)
const px=v=>v.toFixed(2)+'px',tr=(x,y)=>`translate(${px(x)},${px(y)})`;
const rx=p=>p.pop?375*p.b:0,fx=p=>p.pop?-120*(1-p.b):0;       // Reels group x, Feed x (Back)
const pageY=(p,j)=>PG*clamp(j-p.k,-1,1),onPage=(p,j)=>p.k>j-1&&p.k<j+1?1:0;
/* the ads: page 0 is the seed (its video is the shared media layer), 1-3 the chain; Reels counts are like / comment / share */
const ADS=[
  {k:'porsche',name:'Porsche',cap:'Exhilaration is a renewable resource. The all-electric Taycan. Starting at $90,900.',cta:'Learn more',c:'#a67f53',
    ufi:['3.1K','1.7K','563'],url:'porsche.com',head:'The Porsche Taycan'},   // the seed (the prototype's Porsche ad: copy, counts, CTA colour)
  {k:'rayban',name:'Ray-Ban',cap:'Ray-Ban Meta. Ask Meta AI about what you see, hands-free.',cta:'Learn more',c:'#9e724f',ufi:['12K','3.4K','1.1K']},
  {k:'warby',name:'Warby Parker',cap:'Find your next pair. Try frames on in store or at home.',cta:'Shop now',c:'#5b708f',ufi:['2.3K','486','219']},
  {k:'lenscrafters',name:'LensCrafters',cap:'Glasses for every style, fit and prescription, styled by experts.',cta:'Learn more',c:'#182b50',ufi:['1.6K','312','148']}];
const A=DC.base(document.currentScript,'../assets/vac-anim/v4/'),V='?v=7',FA=DC.base(document.currentScript,'../preview/fmss-sol1/assets/'),FV='?v=5';
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
const im=(cls,f,w,h)=>`<img class="${cls}" alt="" src="${A}${f}${V}" width="${w}" height="${h}" draggable="false">`;
const vid=(cls,k)=>`<video class="${cls}" muted playsinline loop preload="none" disablepictureinpicture disableremoteplayback data-src="${A}${k}.mp4${V}" poster="${A}${k}.webp${V}"></video>`;
// Reels UI over one ad (page px): bottom gradient, vertical UFI (bottom 12, 48 wide), details (author, caption, CTA: bottom 12, left 12, 303)
const reelsUI=d=>`<i class="vc-gb"></i><div class="vc-ufi">`+
  ['like','comment','share'].map((n,i)=>`<span style="top:${495+65*i}px">${im('vc-ic','i-'+n+'.webp',48,48)}<b>${d.ufi[i]}</b></span>`).join('')+
  `<span style="top:690px">${im('vc-ic','i-dots.webp',48,48)}</span></div>`+
  `<div class="vc-dt">${im('vc-av','a-'+d.k+'.webp',80,80)}<p class="vc-nm"><span>${esc(d.name)}</span>${im('vc-bd','i-badge.webp',24,24)}${im('vc-bd','i-globe.webp',24,24)}</p>`+
  `<p class="vc-sp">Sponsored</p><p class="vc-cp"><span>${esc(d.cap)}</span><em>more</em></p><p class="vc-cta" style="background:${d.c}">${esc(d.cta)}</p></div>`;
DC.register('vac',{T,rest:REST,
  build(scr){scr.classList.add('vac');
    const VS=window.VideoScrubber,HD=window.FMSSIABHeader,S=ADS[0];
    scr.innerHTML=
      // Feed: the cleared Figma Feed + the post's own parts
      `<div class="vc-l vc-feed">${im('vc-fb','feed.webp',750,1624)}${im('vc-fav','a-'+S.k+'.webp',80,80)}`+
        `<p class="vc-fn"><span>${esc(S.name)}</span>${im('vc-fbd','feed-badge.webp',24,24)}</p><p class="vc-fc">${esc(S.cap)}</p>`+
        `<p class="vc-fu">${S.url}</p><p class="vc-fh">${esc(S.head)}</p><p class="vc-fcta">${esc(S.cta)}</p></div>`+
      // Split backdrop: the seed video, live, small and blurred (drawn by frame() below), under a 24% dim
      `<div class="vc-l vc-amb"><canvas width="30" height="34"></canvas></div>`+
      `<i class="vc-l vc-p0"></i>`+
      `<div class="vc-l vc-mv">${vid('vc-v',S.k)}</div>`+
      `<div class="vc-l vc-ui vc-u0">${reelsUI(S)}</div>`+
      `<img class="vc-l vc-bo vc-bos" alt="" src="${FA}bo1.webp${FV}"><img class="vc-l vc-bo vc-box" alt="" src="${FA}bo1.webp${FV}">`+
      `<i class="vc-l vc-at"></i>`+
      `<div class="vc-l vc-sh">${im('vc-site',S.k+'-site.webp',750,1444)}</div>`+
      [1,2,3].map(j=>`<div class="vc-l vc-pg vc-p${j}">${vid('vc-v',ADS[j].k)}<div class="vc-ui">${reelsUI(ADS[j])}</div></div>`).join('')+
      `<div class="vc-l vc-chrome"><i class="vc-gt"></i><p class="vc-tm">2:04</p><img class="vc-st" alt="" src="${A}status.svg${V}" width="67" height="11">`+
        `<img class="vc-bk" alt="" src="${A}back.svg${V}" width="24" height="24"></div>`+
      `<div class="vc-l vc-bar"><p class="vc-in">Add a comment${im('vc-em','i-emoji.webp',40,40)}</p><i class="vc-hi"></i></div>`;
    const q=s=>scr.querySelector(s),anims=[],o={duration:T,iterations:Infinity,fill:'both'},An=(s,fn)=>q(s)&&anims.push(q(s).animate(kf(fn),o));
    const sh=q('.vc-sh');if(SQ)sh.style.clipPath=`path('${DC.squircle(375,422,16,.6)}')`;
    // shared IAB sheet header at the sheet's top (FMSS .bhd), riding with it
    if(HD)sh.prepend(HD({url:S.url,cls:'vc-hd'}));
    const seed=q('.vc-mv video'),chain=[1,2,3].map(j=>q('.vc-p'+j+' video'));
    // live player controls (FMSS: js/video-scrubber.js with the FMSS icon crop): split screen from t1 (reached t1e) to t2; the scrubber
    // fades them out HOLD→GONE after t1e (gone at t1e+2400 = 6240, before the sheet is dragged at 7040): only the close X is left
    if(VS){q('.vc-at').replaceWith(VS.create({video:seed,icons:`${FA}ci1.webp${FV}`,trackY:SH-14,className:'vc-l vc-ctl',
      sinceSplit:VS.loop(()=>anims[0],T,[[t1,t1e,t2]]),lock:LOCK,readOnly:true}).el);   // the VAC hero just plays: no seek, no tap on its video
      // the chained ads: only the lock (these scrubbers' controls are never mounted)
      chain.forEach((v,i)=>{const h=VS.create({video:v,sinceSplit:VS.loop(()=>anims[0],T,[]),lock:CLOCK[i],readOnly:true}).el;
        h.style.display='none';h.setAttribute('aria-hidden','true');scr.appendChild(h)})}
    else q('.vc-at').remove();
    const mvR=p=>{let x,y,w,h;const L=(A_,B_,e)=>A_.map((v,i)=>lerp(v,B_[i],e));
      if(p.pop){[x,y,w,h]=R.feed;x+=fx(p)}else if(p.c>0){[x,y,w,h]=L(R.split,R.reels,p.c);y+=pageY(p,0)}else [x,y,w,h]=L(R.feed,R.split,p.a);
      return [x,y,w,h]};
    // Feed: under everything; hidden while Split/Reels cover it, back for Back (the pop slides it in from the left)
    An('.vc-feed',p=>({opacity:p.a<1||p.pop?1:0,transform:tr(fx(p),0)}));
    // Split backdrop dissolves in over Feed (FMSS .bt); gone once Reels covers it
    An('.vc-amb',p=>({opacity:p.c<1&&!p.pop?p.a:0}));
    // the seed's Reels page (black, behind the media): dissolves in with Split -> Reels, then is the first page of the chain
    An('.vc-p0',p=>({opacity:p.k<1?p.c:0,transform:tr(rx(p),pageY(p,0))}));
    // the media (shared element): Feed rect -> split video rect (r 0 -> 16, 60% smoothing) -> the Reels frame (r 16 -> 0), then rides the
    // seed's page; back in the Feed rect for Back (moved there under the full last page). Sized, not scaled.
    An('.vc-mv',p=>{const [x,y,w,h]=mvR(p),rad=p.pop?0:16*p.a*(1-p.c);
      const k={left:px(x),top:px(y),width:px(w),height:px(h)};
      if(SQ)k.clipPath=`path('${DC.squircle(+w.toFixed(2),+h.toFixed(2),rad,.6)}')`;else k.borderRadius=px(rad);
      return k});
    // the seed's Reels UI over the media, with its page
    An('.vc-u0',p=>({opacity:p.k<1?clamp((p.c-.5)/.5):0,transform:tr(rx(p),pageY(p,0))}));
    // FMSS overlay bo1, in two clips: status bar (dissolves in with the backdrop, held until Reels' own status bar is up) and the close X
    // (dissolves in with Split; rides the media's top-right corner into Reels while it fades)
    An('.vc-bos',p=>({opacity:p.c<1&&!p.pop?p.a*(1-p.c):0}));
    An('.vc-box',p=>{const [x,y,w]=mvR(p);return {opacity:p.pop?0:p.a*clamp(1-2*p.c),transform:tr(p.c>0?x+w-363:0,p.c>0?y-44:0)}});
    // player controls: ride up with the media and fade in (FMSS: 185px), then ride with it into Reels and fade out
    An('.vc-ctl',p=>{const y=p.c>0?lerp(R.split[1],R.reels[1],p.c)-44:185*(1-p.a);
      return {opacity:p.pop?0:p.a*clamp(1-2*p.c),transform:tr(0,y)}});
    // the sheet (the advertiser's site under the shared header) rises to 406 for Split, then is swiped down off the screen
    An('.vc-sh',p=>({transform:tr(0,SH+SH*(1-p.a)+SH*p.c)}));
    // chained pages
    [1,2,3].forEach(j=>An('.vc-p'+j,p=>({opacity:onPage(p,j),transform:tr(rx(p),pageY(p,j))})));
    // fixed Reels chrome (protective gradient, status bar, back) and the comment composer
    An('.vc-chrome',p=>({opacity:p.c,transform:tr(rx(p),0)}));
    An('.vc-bar',p=>({opacity:p.c,transform:tr(rx(p),0)}));
    // the touch marker, over everything
    const fg=DC.finger();scr.appendChild(fg);anims.push(fg.animate(DC.touch(T,TOUCH),o));
    anims.forEach(a=>{a.pause();a.currentTime=0});
    // Split backdrop painter: while the backdrop is up, the seed's current frame drawn 30x34 (cover fit), blurred by CSS
    const cv=q('.vc-amb canvas'),cx=cv.getContext('2d'),poster=new Image();poster.src=seed.poster;
    const draw=src=>{const w=src.videoWidth||src.naturalWidth,h=src.videoHeight||src.naturalHeight;if(!w||!h)return;
      const s=Math.max(30/w,34/h);try{cx.drawImage(src,(30-w*s)/2,(34-h*s)/2,w*s,h*s)}catch(_){}};
    poster.decode&&poster.decode().then(()=>draw(poster)).catch(()=>{});
    const frame=()=>{const t=((+anims[0].currentTime%T)+T)%T;if(t<t1-STEP||t>t2e+STEP)return;if(seed.readyState>=2)draw(seed)};
    return {anims,imgs:[...scr.querySelectorAll('img')],videos:[seed,...chain],frame}}});
window.VACChain={T,STEP,REST,POSE,LOCK,CLOCK,TOUCH,marks:{t1,t1e,t2,t2e,s1,s1e,s2,s2e,s3,s3e,tb}};
})();
