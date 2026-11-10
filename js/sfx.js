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
  /* kChoke: the gain nodes of the last notch note. Re-striking the same tine damps it (4ms).
     ring (s): time to the next expected note; each partial's decay is capped at half of it (KRING), so the 880Hz tone is only on between plucks
     while a slow note still rings its full .28s. KGAP: notch notes never closer than 64ms (~15/s, below the rate where same-pitch strikes fuse
     into one sustained "bing"); faster notches are dropped, not stacked. */
  let kChoke=null,kLast=-1e9;const KGAP=64,KRING=.5;
  const kStrike=(at,g,dst,nodes,choke,ring)=>{hit(3000,3,.25*g,.006,at,dst);
    if(choke){if(kChoke)for(const a of kChoke){try{a.gain.cancelScheduledValues(at);a.gain.setTargetAtTime(0,at,.004/3);}catch(_){}}kChoke=[];}
    for(const[r,amp,dec]of KPARTS){const o=ac.createOscillator(),a=ac.createGain(),tau=(ring?Math.min(dec,KRING*ring):dec)/3,atk=.0008,pk=amp*.28*g*Math.exp(-atk/tau);choke&&kChoke.push(a);
      o.type='sine';o.frequency.setValueAtTime(880*r,at);
      a.gain.setValueAtTime(0,at);a.gain.linearRampToValueAtTime(pk,at+atk);a.gain.setTargetAtTime(0,at+atk,tau);
      o.connect(a).connect(dst);o.start(at);o.stop(at+Math.max(dec,.28)+.01);nodes&&nodes.push(o);}};
  const kalimbaOn=()=>{kalimbaStop();const bus=ac.createGain();bus.gain.value=1;bus.connect(out);const t0=ac.currentTime+.008,n=kalimbaTimes.length,nodes=[];kStart=heardAt(t0);
    for(let i=0;i<n;i++){const dt=kalimbaTimes[i],g=i<n-1?.6*(1-.55*dt/KTOT):.6;kStrike(t0+dt,g,bus,nodes);}
    kV={g:bus,n:nodes,end:t0+kalimbaTimes[n-1]+.29};};

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
    kalimba(){this.count.kalimba++;kStart=null;ready(kalimbaOn);},get kalimbaStart(){return kStart;},kalimbaStop,kalimbaTimes,kalimbaProgress,get kalimbaLast(){return kalimbaTimes[kalimbaTimes.length-1];}};})();
window.dbhSfx=window.__sound=sfx;})();
