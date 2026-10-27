/* VAC cover: the "vac" device-cover player ([data-cover-anim="vac"], js/device-cover.js, load it first): the hero on projects/vac.html only
   (the homepage and NEXT CASE STUDY cards show the still cover art).
   The Solution end to end, "Lower Funnel Ads — with VAC" (Figma vac_21, assets/vac/vac-21): the user meets a video ad in Feed, taps it into
   Split Screen (video on top, the advertiser's site in a sheet below), swipes the sheet down into the Reels Player, then swipes up through
   the chained ads, and Back returns to Feed. One seamless loop of 20000ms:
     Feed hold 3200 · tap: Feed -> Split 640 · Split hold 2800 · sheet swiped down: Split -> Reels 800 · Porsche hold 3400 ·
     swipe 840 · On hold 2000 · swipe 840 · Away hold 2000 · swipe 840 · Perrier hold 2000 · Back: Reels -> Feed 640 (= Feed at 0)
   Motion is FMSS's vocabulary through the shared helpers: Feed -> Split is FMSS's feed -> split (DeviceCover.spring ω16 resampled to 640ms;
   one media layer travels the Feed rect 0,216 375x375 -> the split video rect 12,44 351x350 r16, the player controls ride up with it and
   fade in, the split backdrop dissolves in, the sheet rises to 406). Split -> Reels: a finger drags the sheet 48px down (160ms, ease-in),
   lifts at 600px/s and the sheet falls away on the same spring (640ms) while the media grows into the Reels rect 0,180 375x375 and the
   Reels page and chrome dissolve in. Chain swipes: the page is dragged 48px up (160ms) and released into the spring (680ms) with that
   velocity, pages 375x734 apart (the Reels chain pitch; the comment bar 734-812 is fixed chrome). Back: Reels slides off to the right
   while Feed comes in from -120px (the iOS pop), ω16 640ms. Every keyframe sits on the 8ms grid; holds are multiples of 8ms.
   Split Screen is drawn with the FMSS cover's own parts and recipe (js/fmss-split.js), shared, not copied: the status bar + close X overlay
   (preview/fmss-sol1/assets/bo1.webp), the live player controls (js/video-scrubber.js: timestamp + 16px pill track in sync with the video,
   the FMSS icon crop ci1.webp, faded out on the scrubber's own HOLD/FADE after split screen is reached, leaving only the close X), the
   shared IAB sheet header (preview/shared/iab/header.js, url/porsche.com.svg) riding the sheet, the sheet image with its header strip blank
   and the white strip under the split line (no hairline), the media squircle r16 at 60% smoothing. No player scrims (FMSS dropped them).
   The video (assets/vac-anim/porsche.mp4, 15.000s) is locked to the loop clock (VideoScrubber lock): loop 0 = video 0:00, 1:1 while it is
   on screen (Feed, Split, Porsche Reels and its swipe away), parked behind the chain (s1e -> tb) on the frame due at tb (14.36s), so the
   Back pop plays its last 0.64s into the wrap. Its frames: the misty opening shot, PORSCHE PRESENTS in over 1.6-2.24s, out over 8.24-8.88s.
   Rest (still, reduced motion, first frame) = the Porsche Reels page, the cover art. Layers: .vc-* in css/card.css. */
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
const HF=3200,HS=2800,HP=3400,HC=2000;
const t1=HF,t1e=t1+dur(FS),t2=t1e+HS,t2e=t2+dur(SR),s1=t2e+HP,s1e=s1+dur(SW),s2=s1e+HC,s2e=s2+dur(SW),s3=s2e+HC,s3e=s3+dur(SW),
  tb=s3e+HC,T=tb+dur(BK);                            // 3200 3840 6640 7440 10840 11680 13680 14520 16520 17360 19360 20000
/* the video's title card (baked into porsche.mp4 at these loop = video times): PORSCHE PRESENTS in 1600-2240, out 8240-8880 */
const L1=1600,L2=t2e+800;
const REST=L2+640+320;                              // 9200: the Porsche Reels hold on the misty shot = the cover art
const LOCK={zero:0,park:[s1e,tb]};                  // video lock (above): 0:00 at loop 0, parked behind the chain
/* the loop as poses: a = Feed -> Split, c = Split -> Reels, k = chain position (0 Porsche .. 3 Perrier), b = Back progress (pop = Back) */
const POSE=(()=>{const P=[{t:0,a:0,c:0,k:0,b:0,pop:0}],seg=(t0,S,f)=>S.forEach((e,i)=>P.push({t:t0+i*STEP,...f(e)}));
  seg(t1,FS,e=>({a:e,c:0,k:0,b:0,pop:0}));seg(t2,SR,e=>({a:1,c:e,k:0,b:0,pop:0}));
  [s1,s2,s3].forEach((s,j)=>seg(s,SW,e=>({a:1,c:1,k:j+e,b:0,pop:0})));
  P.push({t:tb,a:1,c:1,k:3,b:0,pop:0});seg(tb,BK,e=>({a:1,c:1,k:3,b:e,pop:1}));   // Back: a jump to pop at tb, under the full Perrier page
  return P})();
const kf=fn=>DC.track(POSE,T,fn);
const R={feed:[0,216,375,375],split:[12,44,351,350],reels:[0,180,375,375]};
const px=v=>v.toFixed(2)+'px',tr=(x,y)=>`translate(${px(x)},${px(y)})`;
const rx=p=>p.pop?375*p.b:0,fx=p=>p.pop?-120*(1-p.b):0;       // Reels group x, Feed x (Back)
const pageY=(p,j)=>PG*clamp(j-p.k,-1,1),onPage=(p,j)=>p.k>j-1&&p.k<j+1?1:0;
const A=DC.base(document.currentScript,'../assets/vac-anim/'),V='?v=3',FA=DC.base(document.currentScript,'../preview/fmss-sol1/assets/'),FV='?v=5';
const img=(cls,f)=>`<img class="vc-l ${cls}" alt="" src="${A}${f}.webp${V}">`;
DC.register('vac',{T,rest:REST,
  build(scr){scr.classList.add('vac');
    const VS=window.VideoScrubber,HD=window.FMSSIABHeader;
    scr.innerHTML=img('vc-feed','feed')+`<i class="vc-l vc-bw"></i>`+img('vc-bu','split-bu')+img('vc-pp','porsche')+
      `<div class="vc-l vc-mv"><video muted playsinline loop preload="none" data-src="${A}porsche.mp4${V}" disableremoteplayback poster="${A}mist.webp${V}"></video></div>`+
      img('vc-ufi','ufi')+`<img class="vc-l vc-bo vc-bos" alt="" src="${FA}bo1.webp${FV}"><img class="vc-l vc-bo vc-box" alt="" src="${FA}bo1.webp${FV}">`+
      `<i class="vc-l vc-at"></i>`+img('vc-sh','split-bl')+
      img('vc-pg vc-p1','on')+img('vc-pg vc-p2','away')+img('vc-pg vc-p3','perrier')+img('vc-chrome','chrome')+`<i class="vc-l vc-bar"></i>`;
    const q=s=>scr.querySelector(s),anims=[],o={duration:T,iterations:Infinity,fill:'both'},An=(s,fn)=>q(s)&&anims.push(q(s).animate(kf(fn),o));
    // shared IAB sheet header on the sheet's blank header strip, riding with it (FMSS .bhd)
    if(HD)q('.vc-sh').after(HD({url:'porsche.com',cls:'vc-hd',style:`top:${SH}px;will-change:transform`}));
    // live player controls (FMSS: js/video-scrubber.js with the FMSS icon crop): split screen from t1 (reached t1e) to t2; the scrubber
    // fades them out HOLD→GONE after t1e (gone at t1e+2400 = 6240, before the sheet is swiped at 6640): only the close X is left
    if(VS)q('.vc-at').replaceWith(VS.create({video:q('video'),icons:`${FA}ci1.webp${FV}`,trackY:SH-14,className:'vc-l vc-ctl',
      sinceSplit:VS.loop(()=>anims[0],T,[[t1,t1e,t2]]),lock:LOCK,readOnly:true}).el);   // the VAC hero just plays: no seek, no tap on its video
    else q('.vc-at').remove();
    const mvR=p=>{let x,y,w,h;const L=(A_,B_,e)=>A_.map((v,i)=>lerp(v,B_[i],e));
      if(p.pop){[x,y,w,h]=R.feed;x+=fx(p)}else if(p.c>0){[x,y,w,h]=L(R.split,R.reels,p.c);y+=pageY(p,0)}else [x,y,w,h]=L(R.feed,R.split,p.a);
      return [x,y,w,h]};
    // Feed: under everything; hidden while Split/Reels cover it, back for Back (the pop slides it in from the left)
    An('.vc-feed',p=>({opacity:p.a<1||p.pop?1:0,transform:tr(fx(p),0)}));
    // seam underlay under the split line (FMSS .bw): the backdrop's last row meets the sheet's on the sheet's own top rows, not on the screen's black
    An('.vc-bw',p=>({opacity:p.c>0||p.pop?0:1}));
    // Split backdrop (blurred video) dissolves in over Feed (FMSS .bt); gone once Reels covers it
    An('.vc-bu',p=>({opacity:p.c<1&&!p.pop?p.a:0}));
    // Porsche Reels page (behind the media): dissolves in with Split -> Reels, then is the first page of the chain
    An('.vc-pp',p=>({opacity:p.k<1?p.c:0,transform:tr(rx(p),pageY(p,0))}));
    // the media (shared element): Feed rect -> split video rect (r 0 -> 16, 60% smoothing) -> Reels rect (r 16 -> 0), then rides the
    // Porsche page; back in the Feed rect for Back (moved there under the full Perrier page). Sized, not scaled.
    An('.vc-mv',p=>{const [x,y,w,h]=mvR(p),rad=p.pop?0:16*p.a*(1-p.c);
      const k={left:px(x),top:px(y),width:px(w),height:px(h)};
      if(SQ)k.clipPath=`path('${DC.squircle(+w.toFixed(2),+h.toFixed(2),rad,.6)}')`;else k.borderRadius=px(rad);
      return k});
    // Reels like icon + count over the media, with the Porsche page
    An('.vc-ufi',p=>({opacity:p.k<1?clamp((p.c-.5)/.5):0,transform:tr(rx(p),pageY(p,0))}));
    // FMSS overlay bo1, in two clips: status bar (dissolves in with the backdrop, held until Reels' own status bar is up) and the close X
    // (dissolves in with Split; rides the media's top-right corner into Reels while it fades)
    An('.vc-bos',p=>({opacity:p.c<1&&!p.pop?p.a:0}));
    An('.vc-box',p=>{const [x,y,w]=mvR(p);return {opacity:p.pop?0:p.a*clamp(1-2*p.c),transform:tr(p.c>0?x+w-363:0,p.c>0?y-44:0)}});
    // player controls: ride up with the media and fade in (FMSS: 185px), then ride with it into Reels and fade out
    An('.vc-ctl',p=>{const y=p.c>0?lerp(R.split[1],R.reels[1],p.c)-44:185*(1-p.a);
      return {opacity:p.pop?0:p.a*clamp(1-2*p.c),transform:tr(0,y)}});
    // the sheet (advertiser's site) and its header rise to 406 for Split, then are swiped down off the screen
    An('.vc-sh',p=>({transform:tr(0,SH*(1-p.a)+SH*p.c)}));
    An('.vc-hd',p=>({transform:tr(0,SH*(1-p.a)+SH*p.c)}));
    // chained pages
    [1,2,3].forEach(j=>An('.vc-p'+j,p=>({opacity:onPage(p,j),transform:tr(rx(p),pageY(p,j))})));
    // fixed Reels chrome (status bar, back, top scrim) and comment bar
    An('.vc-chrome',p=>({opacity:p.c,transform:tr(rx(p),0)}));
    An('.vc-bar',p=>({opacity:p.c,transform:tr(rx(p),0)}));
    anims.forEach(a=>{a.pause();a.currentTime=0});
    return {anims,imgs:[...scr.querySelectorAll('img')],video:q('video')}}});
window.VACChain={T,STEP,REST,POSE,LOCK,marks:{L1,L2,t1,t1e,t2,t2e,s1,s1e,s2,s2e,s3,s3e,tb}};
})();
