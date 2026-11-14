/* preview/egg-n-glass copy of js/sfx.js (v491) + second sound layers: glassTink (N glass, used here), iceFreeze (N ice) and suckSet (G suction); throwaway. */
/* Shared dial sound (home + project pages). Silent until first input; mute: window.__sound.set(false) (localStorage dbh-sound). */
(()=>{const sfx=(()=>{const VOL=.18,DET=4,MINGAP=38;let ac=null,out=null,nb=null,lastT=0,lastD=null,mute=localStorage.getItem('dbh-sound')==='off';
  const unlock=()=>{if(ac){if(ac.state==='suspended')ac.resume();return;}const C=window.AudioContext||window.webkitAudioContext;if(!C)return;ac=new C();out=ac.createGain();out.gain.value=VOL;out.connect(ac.destination);
    nb=ac.createBuffer(1,Math.round(ac.sampleRate*.03),ac.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);};
  ['pointerdown','pointerup','touchstart','touchend','click','keydown','wheel'].forEach(e=>addEventListener(e,unlock,{passive:true,capture:true}));
  /* play now if the context runs, else resume it (inside the same tap) and play once it does: the first tap on a page, or after iOS suspends audio in the background, is no longer silent */
  const ready=f=>{if(mute)return;if(!ac)unlock();if(!ac)return;if(ac.state==='running'){f();return;}const t0=performance.now();ac.resume().then(()=>{if(ac.state==='running'&&performance.now()-t0<480)f();},()=>{});};
  const hit=(f,q,g,dur,at,dst)=>{if(!ac||mute||ac.state!=='running')return;const t=at??ac.currentTime,s=ac.createBufferSource(),bp=ac.createBiquadFilter(),a=ac.createGain();s.buffer=nb;s.playbackRate.value=.9+Math.random()*.2;
    bp.type='bandpass';bp.frequency.value=f*(.94+Math.random()*.12);bp.Q.value=q;a.gain.setValueAtTime(g,t);a.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(bp).connect(a).connect(dst||out);s.start(t);s.stop(t+dur+.01);};
  const body=(f,g,dur)=>{if(!ac||mute||ac.state!=='running')return;const t=ac.currentTime,o=ac.createOscillator(),a=ac.createGain();o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*.5,t+dur);a.gain.setValueAtTime(g,t);a.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(a).connect(out);o.start(t);o.stop(t+dur+.01);};
  /* broken-circuit crackle: noise only. Sparse random-amplitude noise bursts over a faint hiss, gentle non-resonant lowpass (Q .5);
     no oscillators, no sample-and-hold (it aliased into pitched tones), no resonant pops. Peak-normalised; ZAPG keeps it below the tap click's peak. */
  const ZAPG=.375,zapBuf=(c)=>{const R=Math.random,sr=c.sampleRate,dur=.25+R()*.15,N=Math.round(sr*dur),b=c.createBuffer(1,N,sr),d=b.getChannelData(0);let burst=0,amp=0,pk=1e-9;
    for(let i=0;i<N;i++){if(burst<=0&&R()<.0025){burst=Math.round(sr*(.001+R()*.004));amp=.3+R()*.7;}const env=Math.pow(1-i/N,1.2),cr=burst>0?(R()*2-1)*amp*(burst--/(sr*.005)+.2):0;d[i]=(cr+(R()*2-1)*.04)*env;pk=Math.max(pk,Math.abs(d[i]));}
    for(let i=0;i<N;i++)d[i]/=pk;return b;},
    zapOn=(c,dst,t)=>{const s=c.createBufferSource(),lp=c.createBiquadFilter(),g=c.createGain();s.buffer=zapBuf(c);lp.type='lowpass';lp.frequency.value=5000+Math.random()*2000;lp.Q.value=.5;g.gain.value=ZAPG;s.connect(lp).connect(g).connect(dst);s.start(t);s.stop(t+s.buffer.duration+.01);},
    zap=()=>ready(()=>zapOn(ac,out,ac.currentTime));
  window.__sfxTest={zapOn,nbOf:c=>{const b=c.createBuffer(1,Math.round(c.sampleRate*.03),c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);return b;}};
  /* kalimba spin trill (egg letter H): 21 strikes, interval 24ms -> ~237ms, last strike ~1.898s.
     Shared schedule is the clock for the H letter's 2-turn yaw spin (hang-wire.js). */
  const KTOT=2,KG0=.024,KG1=.28,KPARTS=[[1,1,.28],[5.4,.2,.03],[2,.1,.05]];
  const kalimbaTimes=(()=>{const T=[];let t=0;while(t<KTOT){T.push(t);t+=KG0+(KG1-KG0)*(t/KTOT);}return T;})();
  const kalimbaProgress=t=>{if(t<=0)return 0;const last=kalimbaTimes[kalimbaTimes.length-1];if(t>=last)return 1;let i=0;while(i<kalimbaTimes.length-1&&kalimbaTimes[i+1]<=t)i++;return(i+(t-kalimbaTimes[i])/(kalimbaTimes[i+1]-kalimbaTimes[i]))/(kalimbaTimes.length-1);};
  /* kStart: performance.now() ms at which strike 0 is actually heard (speaker time, output latency included); null until the audio is scheduled.
     The H spin reads this as its clock, so the yaw steps land on the strikes you hear, not on the tap (audio resume can lag the tap by 100ms+). */
  let kV=null,kStart=null;
  const heardAt=ct=>{try{const o=ac.getOutputTimestamp&&ac.getOutputTimestamp();if(o&&o.performanceTime>0&&o.contextTime>0)return o.performanceTime+(ct-o.contextTime)*1000;}catch(_){}
    return performance.now()+(ct-ac.currentTime+(ac.outputLatency||ac.baseLatency||0))*1000;};
  const kalimbaStop=()=>{if(!kV||!ac)return;const v=kV,t=ac.currentTime,f=.008;kV=null;
    try{const g=v.g.gain,cur=Math.max(g.value,1e-6);g.cancelScheduledValues(t);g.setValueAtTime(cur,t);g.linearRampToValueAtTime(0,t+f);}catch(_){}
    const wait=Math.max(16,(v.end-t)*1000+50);setTimeout(()=>{try{v.g.disconnect();}catch(_){}},wait);};
  /* one kalimba tine strike: noise click + 880Hz partials (1, 5.4, 2); g is the strike level (.6 = full) */
  /* kChoke: the gain nodes of the last notch note. Re-striking the same tine releases it over 24ms (KREL), a soft damp rather than a cut.
     ring (s): time to the next expected note; each partial's decay is capped at 1x of it (KRING), so in a fast run the 880Hz tone dips ~25dB
     between plucks while a slow note, or the last note of a spin/fling (ring = Infinity), rings its full .28s. KGAP: notch notes never closer
     than 64ms (~15/s, below the rate where same-pitch strikes fuse into one sustained "bing"); faster notches are dropped, not stacked. */
  let kChoke=null,kLast=-1e9;const KGAP=64,KRING=1,KREL=.024;
  const kStrike=(at,g,dst,nodes,choke,ring)=>{hit(3000,3,.25*g,.006,at,dst);
    if(choke){if(kChoke)for(const a of kChoke){try{a.gain.cancelScheduledValues(at);a.gain.setTargetAtTime(0,at,KREL/3);}catch(_){}}kChoke=[];}
    for(const[r,amp,dec]of KPARTS){const o=ac.createOscillator(),a=ac.createGain(),tau=(ring?Math.min(dec,KRING*ring):dec)/3,atk=.0008,pk=amp*.28*g*Math.exp(-atk/tau);choke&&kChoke.push(a);
      o.type='sine';o.frequency.setValueAtTime(880*r,at);
      a.gain.setValueAtTime(0,at);a.gain.linearRampToValueAtTime(pk,at+atk);a.gain.setTargetAtTime(0,at+atk,tau);
      o.connect(a).connect(dst);o.start(at);o.stop(at+Math.max(dec,.28)+.01);nodes&&nodes.push(o);}};
  const kalimbaOn=()=>{kalimbaStop();const bus=ac.createGain();bus.gain.value=1;bus.connect(out);const t0=ac.currentTime+.008,n=kalimbaTimes.length,nodes=[];kStart=heardAt(t0);
    for(let i=0;i<n;i++){const dt=kalimbaTimes[i],g=i<n-1?.6*(1-.55*dt/KTOT):.6;kStrike(t0+dt,g,bus,nodes);}
    kV={g:bus,n:nodes,end:t0+kalimbaTimes[n-1]+.29};};

  /* dingNote (v488, Hang's pick: single-ding #4 bright-ding-5k3, sim9.py): the notch note of every egg letter (H A N G).
     ONE sine at hz*(1 +-0.5%), linear attack .8ms (>=.7ms or it splatters), exp ramp to .001 at DDEC*c, c = min(1, .8*ring/DDEC)
     (ring = seconds to the next notch; Infinity for the last notes of a spin/fling, so they ring the full 100ms). Level DK*g/.6
     (DK .0806 since v491 = .064 +2dB; v490 .064 = .032 +6dB, both at Hang's ask; was .032: EBU R128 loudness-matched to the gauge tick, same at 4.2-6.4kHz). The previous voice is released with
     setTargetAtTime(0,now,.008) when the next strikes. Shares KGAP / kLast with kalimbaNote (64ms min spacing). */
  let dV=null;const DDEC=.1,DATK=.0008,DK=.0806;
  const dingStop=()=>{if(!dV||!ac)return;const v=dV,t=ac.currentTime;dV=null;try{v.a.gain.cancelScheduledValues(t);v.a.gain.setTargetAtTime(0,t,.008);v.o.stop(t+.064);}catch(_){}};
  const dStrike=(g,ring,hz)=>{if(!ac||mute||ac.state!=='running')return;dingStop();const at=ac.currentTime,o=ac.createOscillator(),a=ac.createGain(),
      c=Math.min(1,.8*ring/DDEC),dd=Math.max(DATK*2,DDEC*c),pk=DK*g/.6;
    o.type='sine';o.frequency.setValueAtTime(hz*(1+(Math.random()*2-1)*.005),at);
    a.gain.setValueAtTime(0,at);a.gain.linearRampToValueAtTime(pk,at+DATK);a.gain.exponentialRampToValueAtTime(pk*.001,at+dd);
    o.connect(a).connect(out);o.start(at);o.stop(at+dd+.01);dV={o,a};};
  /* --- second sound layers (preview: egg-n-ice / egg-g-suck-sfx). Pure builders on any (Offline)AudioContext c into dst at time t; level 0..1.
     Kept under the dings: about 6dB (suction) / 4dB (ice) below the ding notes' loudness and sit mostly in noise bands the 4.2-6.4kHz sines don't occupy. --- */
  const LNB=(c,sec,seed)=>{let s=seed||1;const R=()=>(s=(s*16807)%2147483647)/2147483647;const b=c.createBuffer(1,Math.round(c.sampleRate*sec),c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=R()*2-1;return b;};
  /* N ice: a crisp freeze crackle (sparse ice-tick micro-bursts thinning out over ~700ms, highpassed, a few faint glassy tinks) over a short frosty hiss */
  const iceBuild=(c,dst,t,lv)=>{const sr=c.sampleRate,N=Math.round(sr*.72),b=c.createBuffer(1,N,sr),dd=b.getChannelData(0);let s=9173,R=()=>(s=(s*16807)%2147483647)/2147483647,burst=0,amp=0,pk=1e-9;
    for(let i=0;i<N;i++){const u=i/N,dens=.012*Math.pow(1-u,1.6)+.0015;if(burst<=0&&R()<dens){burst=Math.round(sr*(.0003+R()*.0012));amp=(.35+R()*.65)*Math.pow(1-u,.6);}dd[i]=burst>0?(R()*2-1)*amp*(burst--/(sr*.0015)+.3):0;pk=Math.max(pk,Math.abs(dd[i]));}
    for(let i=0;i<N;i++)dd[i]/=pk;
    const g=c.createGain(),hp=c.createBiquadFilter(),src=c.createBufferSource();src.buffer=b;hp.type='highpass';hp.frequency.value=2200;hp.Q.value=.6;g.gain.value=.05*lv;src.connect(hp).connect(g).connect(dst);src.start(t);
    for(let k=0;k<3;k++){const o=c.createOscillator(),a=c.createGain(),at=t+.03+R()*.45,f=2900+R()*2600;o.type='sine';o.frequency.setValueAtTime(f,at);a.gain.setValueAtTime(0,at);a.gain.linearRampToValueAtTime(.008*lv,at+.0008);a.gain.exponentialRampToValueAtTime(.00001,at+.05+R()*.05);o.connect(a).connect(dst);o.start(at);o.stop(at+.12);}
    const hs=c.createBufferSource(),bp=c.createBiquadFilter(),ha=c.createGain();hs.buffer=LNB(c,.6,4242);bp.type='bandpass';bp.frequency.setValueAtTime(7600,t);bp.frequency.exponentialRampToValueAtTime(3800,t+.5);bp.Q.value=.8;
    ha.gain.setValueAtTime(0,t);ha.gain.linearRampToValueAtTime(.03*lv,t+.064);ha.gain.exponentialRampToValueAtTime(.0005,t+.56);hs.connect(bp).connect(ha).connect(dst);hs.start(t);hs.stop(t+.6);};
  /* G suction: looped noise through a band-pass that keeps sweeping DOWN (2600 -> 380 Hz every 960ms, like air being drawn in) plus a soft low
     inhale (lowpassed noise, cutoff rising with the pull); both follow the suck-in intensity (set(level,t) per frame, 64ms smoothing). */
  const suckBuild=(c,dst)=>{const src=c.createBufferSource(),bp=c.createBiquadFilter(),ga=c.createGain(),lp=c.createBiquadFilter(),gb=c.createGain(),bus=c.createGain();
    src.buffer=LNB(c,2,777);src.loop=true;bp.type='bandpass';bp.Q.value=1.6;bp.frequency.value=1200;lp.type='lowpass';lp.frequency.value=220;lp.Q.value=.7;ga.gain.value=0;gb.gain.value=0;bus.gain.value=1;
    src.connect(bp).connect(ga).connect(bus);src.connect(lp).connect(gb).connect(bus);bus.connect(dst);let started=0,nextSw=0,lvl=0;
    return{set(lv,t){if(!started){src.start(t);started=1;nextSw=t;}lvl=lv;ga.gain.setTargetAtTime(.0375*Math.pow(lv,1.3),t,.064);gb.gain.setTargetAtTime(.055*lv,t,.064);lp.frequency.setTargetAtTime(180+300*lv,t,.064);
        if(lv>.04&&t>=nextSw){bp.frequency.cancelScheduledValues(t);bp.frequency.setValueAtTime(2600,t);bp.frequency.exponentialRampToValueAtTime(380,t+.96);nextSw=t+.96;}},
      stop(t){try{src.stop(t)}catch(_){}},get level(){return lvl}};};
  let sV=null,sIdle=0;
  const suckSet=lv=>{if(mute||!ac||ac.state!=='running'){return;}const t=ac.currentTime;if(lv<=.002){if(sV){sV.set(0,t);if(!sIdle)sIdle=t;else if(t-sIdle>1.2){sV.stop(t+.05);sV=null;sIdle=0;}}return;}sIdle=0;sV||(sV=suckBuild(ac,out));sV.set(Math.min(1,lv),t);};
  /* glassTink: a soft clean glass ring as the N sets into glass. Inharmonic glass partials on 2385Hz (an octave under the N's 4770Hz ding):
     x1 / x2.32 / x4.25, 2ms attack, ring-outs 960 / 560 / 240ms, plus a 6ms high-passed contact tick; kept about 6dB under the dings. */
  const glassBuild=(c,dst,t,lv)=>{const g=c.createGain();g.gain.value=lv;g.connect(dst);[[1,.017,.96],[2.32,.0065,.56],[4.25,.0025,.24]].forEach(([m,a0,d0])=>{const o=c.createOscillator(),a=c.createGain();o.type='sine';o.frequency.setValueAtTime(2385*m,t);o.detune.setValueAtTime(m>1?6:0,t);a.gain.setValueAtTime(0,t);a.gain.linearRampToValueAtTime(a0,t+.002);a.gain.exponentialRampToValueAtTime(a0*.001,t+d0);o.connect(a).connect(g);o.start(t);o.stop(t+d0+.02);});
    const n=Math.round(c.sampleRate*.012),b=c.createBuffer(1,n,c.sampleRate),dd=b.getChannelData(0);for(let i=0;i<n;i++)dd[i]=(Math.random()*2-1)*Math.exp(-i/(c.sampleRate*.0015));const s=c.createBufferSource(),hp=c.createBiquadFilter(),ga=c.createGain();s.buffer=b;hp.type='highpass';hp.frequency.value=5200;ga.gain.value=.015;s.connect(hp).connect(ga).connect(g);s.start(t);};
  /* glassSet(level): v3, the glass ring as a continuous layer that swells with the glass amount (no discrete hit): the same glass partials
     (2385Hz x1 / x2.32 / x4.25, an octave under the N's 4770Hz ding) sustained with a slow 0.5Hz beat, gain ~ level^1.5, 64ms smoothing,
     released after 1.2s of silence; ~6dB under the dings. */
  const glassPadBuild=(c,dst)=>{const t=c.currentTime,g=c.createGain();g.gain.value=0;g.connect(dst);const os=[[1,.006,0],[2.32,.0024,4],[4.25,.001,-3]].map(([m,a0,dt])=>{const o=c.createOscillator(),a=c.createGain(),o2=c.createOscillator(),a2=c.createGain();o.frequency.value=2385*m;o.detune.value=dt;a.gain.value=a0;o.connect(a).connect(g);o2.frequency.value=.5+m*.07;a2.gain.value=a0*.35;o2.connect(a2).connect(a.gain);o.start(t);o2.start(t);return[o,o2];});
    return{set(lv,t0){g.gain.setTargetAtTime(Math.pow(Math.max(0,Math.min(1,lv)),1.5),t0,.064);},stop(t0){os.forEach(p=>p.forEach(o=>{try{o.stop(t0)}catch(e){}}));}};};
  let gsN=null,gsIdle=0;
  const glassSet=lv=>{lv=mute?0:Math.max(0,Math.min(1,lv||0));if(!ac){if(lv>0)ready(()=>{});return;}const t=ac.currentTime;if(!gsN){if(lv<=0)return;gsN=glassPadBuild(ac,out);}
    gsN.set(lv,t);if(lv>0)gsIdle=t;else if(t-gsIdle>1.2){gsN.stop(t+.3);gsN=null;}};
  const glassTink=lv=>{ready(()=>glassBuild(ac,out,ac.currentTime+.004,Math.max(.4,Math.min(1,lv))));};
  const iceFreeze=lv=>{ready(()=>iceBuild(ac,out,ac.currentTime+.004,Math.max(.3,Math.min(1,lv))));};
  return{count:{tick:0,land:0,tap:0,kalimba:0} /* land: clunk removed, stays 0 */,
    move(x,span){const d=Math.floor(x/(span/DET));if(lastD===null){lastD=d;return;}if(d===lastD)return;lastD=d;this.tick();},
    /* one gauge detent tick (home dial; also each Studio presentation step) */
    tick(){const n=performance.now();if(n-lastT<MINGAP)return false;lastT=n;this.count.tick++;hit(3200,6,.5,.012);return true;},
    tap(){this.count.tap++;ready(()=>{hit(1200,2,1,.04);body(140,.6,.08);});},
    /* easter egg: 7th+ consecutive theme toggle (counter resets after 2s idle) = broken-circuit short */
    _tg:0,_tgT:0,toggle(){const n=performance.now();if(n-this._tgT>2000)this._tg=0;this._tgT=n;this._tg++;if(this._tg<7){this.tap();return'tap';}this.count.zap=(this.count.zap||0)+1;zap();return'zap';},
    set(on){mute=!on;localStorage.setItem('dbh-sound',on?'on':'off');},get on(){return!mute;},
    /* egg letter H: one strike per 36deg notch the letter's yaw passes (hang-wire.js kTick); ring = seconds per notch at the current speed.
       Returns false (no sound) when the last note was <KGAP ms ago. */
    kalimbaNote(g,ring){const n=performance.now();if(n-kLast<KGAP)return false;kLast=n;this.count.kalimbaNote=(this.count.kalimbaNote||0)+1;
      ready(()=>kStrike(ac.currentTime,g,out,null,1,Math.max(KGAP/1e3,ring||1)));return true;},
    /* egg letters H A N G: one ding per 36deg notch (hang-wire.js kTick); g level (.6 = full), ring s to the next notch, hz the letter's pitch.
       Returns false (no sound) when the last notch note was <KGAP ms ago. */
    dingNote(g,ring,hz){const n=performance.now();if(n-kLast<KGAP)return false;kLast=n;this.count.dingNote=(this.count.dingNote||0)+1;
      ready(()=>dStrike(g,Math.max(KGAP/1e3,ring||1),hz||5300));return true;},dingStop,
    kalimba(){this.count.kalimba++;kStart=null;ready(kalimbaOn);},get kalimbaStart(){return kStart;},kalimbaStop,kalimbaTimes,kalimbaProgress,suckSet,iceFreeze,glassTink,glassSet,_layers:{iceBuild,suckBuild,glassBuild,glassPadBuild},get kalimbaLast(){return kalimbaTimes[kalimbaTimes.length-1];}};})();
window.dbhSfx=window.__sound=sfx;})();
