/* Shared dial sound (home + project pages). Silent until first input; mute: window.__sound.set(false) (localStorage dbh-sound). */
(()=>{const sfx=(()=>{const VOL=.18,DET=4,MINGAP=38;let ac=null,out=null,nb=null,lastT=0,lastD=null,mute=localStorage.getItem('dbh-sound')==='off';
  const unlock=()=>{if(ac){if(ac.state==='suspended')ac.resume();return;}const C=window.AudioContext||window.webkitAudioContext;if(!C)return;ac=new C();out=ac.createGain();out.gain.value=VOL;out.connect(ac.destination);
    nb=ac.createBuffer(1,Math.round(ac.sampleRate*.03),ac.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);};
  ['pointerdown','keydown','wheel','touchstart'].forEach(e=>addEventListener(e,unlock,{passive:true,capture:true}));
  const hit=(f,q,g,dur)=>{if(!ac||mute||ac.state!=='running')return;const t=ac.currentTime,s=ac.createBufferSource(),bp=ac.createBiquadFilter(),a=ac.createGain();s.buffer=nb;s.playbackRate.value=.9+Math.random()*.2;
    bp.type='bandpass';bp.frequency.value=f*(.94+Math.random()*.12);bp.Q.value=q;a.gain.setValueAtTime(g,t);a.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(bp).connect(a).connect(out);s.start(t);s.stop(t+dur+.01);};
  const body=(f,g,dur)=>{if(!ac||mute||ac.state!=='running')return;const t=ac.currentTime,o=ac.createOscillator(),a=ac.createGain();o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*.5,t+dur);a.gain.setValueAtTime(g,t);a.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(a).connect(out);o.start(t);o.stop(t+dur+.01);};
  /* broken-circuit crackle: noise only. Sparse random-amplitude noise bursts over a faint hiss, gentle non-resonant lowpass (Q .5);
     no oscillators, no sample-and-hold (it aliased into pitched tones), no resonant pops. Peak-normalised; ZAPG keeps it below the tap click's peak. */
  const ZAPG=.375,zapBuf=(c)=>{const R=Math.random,sr=c.sampleRate,dur=.25+R()*.15,N=Math.round(sr*dur),b=c.createBuffer(1,N,sr),d=b.getChannelData(0);let burst=0,amp=0,pk=1e-9;
    for(let i=0;i<N;i++){if(burst<=0&&R()<.0025){burst=Math.round(sr*(.001+R()*.004));amp=.3+R()*.7;}const env=Math.pow(1-i/N,1.2),cr=burst>0?(R()*2-1)*amp*(burst--/(sr*.005)+.2):0;d[i]=(cr+(R()*2-1)*.04)*env;pk=Math.max(pk,Math.abs(d[i]));}
    for(let i=0;i<N;i++)d[i]/=pk;return b;},
    zapOn=(c,dst,t)=>{const s=c.createBufferSource(),lp=c.createBiquadFilter(),g=c.createGain();s.buffer=zapBuf(c);lp.type='lowpass';lp.frequency.value=5000+Math.random()*2000;lp.Q.value=.5;g.gain.value=ZAPG;s.connect(lp).connect(g).connect(dst);s.start(t);s.stop(t+s.buffer.duration+.01);},
    zap=()=>{if(!ac||mute||ac.state!=='running')return;zapOn(ac,out,ac.currentTime);};
  window.__sfxTest={zapOn,nbOf:c=>{const b=c.createBuffer(1,Math.round(c.sampleRate*.03),c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);return b;}};
  return{count:{tick:0,land:0,tap:0} /* land: clunk removed, stays 0 */,
    move(x,span){const d=Math.floor(x/(span/DET));if(lastD===null){lastD=d;return;}if(d===lastD)return;lastD=d;const n=performance.now();if(n-lastT<MINGAP)return;lastT=n;this.count.tick++;hit(3200,6,.5,.012);},
    tap(){this.count.tap++;hit(1200,2,1,.04);body(140,.6,.08);},
    /* easter egg: 7th+ consecutive theme toggle (counter resets after 6s idle) = broken-circuit short */
    _tg:0,_tgT:0,toggle(){const n=performance.now();if(n-this._tgT>6000)this._tg=0;this._tgT=n;this._tg++;if(this._tg<7){this.tap();return'tap';}this.count.zap=(this.count.zap||0)+1;zap();return'zap';},
    set(on){mute=!on;localStorage.setItem('dbh-sound',on?'on':'off');},get on(){return!mute;}};})();
window.dbhSfx=window.__sound=sfx;})();
