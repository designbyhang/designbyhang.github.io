/* Shared dial sound (home + project pages). Silent until first input; mute: window.__sound.set(false) (localStorage dbh-sound). */
(()=>{const sfx=(()=>{const VOL=.18,DET=4,MINGAP=38;let ac=null,out=null,nb=null,lastT=0,lastD=null,mute=localStorage.getItem('dbh-sound')==='off';
  const unlock=()=>{if(ac){if(ac.state==='suspended')ac.resume();return;}const C=window.AudioContext||window.webkitAudioContext;if(!C)return;ac=new C();out=ac.createGain();out.gain.value=VOL;out.connect(ac.destination);
    nb=ac.createBuffer(1,Math.round(ac.sampleRate*.03),ac.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);};
  ['pointerdown','keydown','wheel','touchstart'].forEach(e=>addEventListener(e,unlock,{passive:true,capture:true}));
  const hit=(f,q,g,dur)=>{if(!ac||mute||ac.state!=='running')return;const t=ac.currentTime,s=ac.createBufferSource(),bp=ac.createBiquadFilter(),a=ac.createGain();s.buffer=nb;s.playbackRate.value=.9+Math.random()*.2;
    bp.type='bandpass';bp.frequency.value=f*(.94+Math.random()*.12);bp.Q.value=q;a.gain.setValueAtTime(g,t);a.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(bp).connect(a).connect(out);s.start(t);s.stop(t+dur+.01);};
  const body=(f,g,dur)=>{if(!ac||mute||ac.state!=='running')return;const t=ac.currentTime,o=ac.createOscillator(),a=ac.createGain();o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*.5,t+dur);a.gain.setValueAtTime(g,t);a.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(a).connect(out);o.start(t);o.stop(t+dur+.01);};
  const zap=()=>{if(!ac||mute||ac.state!=='running')return;const t=ac.currentTime,R=Math.random,dur=.25+R()*.15,sr=ac.sampleRate,N=Math.round(sr*dur),buf=ac.createBuffer(1,N,sr),d=buf.getChannelData(0);
    let hold=0,v=0;const step=Math.round(6+R()*14);for(let i=0;i<N;i++){if(hold--<=0){hold=step;v=R()*2-1;}const env=Math.pow(1-i/N,1.5)*(R()<.12?.15:1);d[i]=Math.sign(v)*Math.pow(Math.abs(v),.4)*env;} /* sample-and-hold bitcrush + hard distortion + dropouts */
    const s=ac.createBufferSource(),hp=ac.createBiquadFilter(),g=ac.createGain();s.buffer=buf;hp.type='highpass';hp.frequency.value=500+R()*400;g.gain.value=.3;s.connect(hp).connect(g).connect(out);s.start(t);
    const pops=3+Math.floor(R()*3);for(let k=0;k<pops;k++){const pt=t+R()*dur*.9,ps=ac.createBufferSource(),pg=ac.createGain();ps.buffer=nb;pg.gain.setValueAtTime(.9,pt);pg.gain.exponentialRampToValueAtTime(.001,pt+.012);ps.connect(pg).connect(out);ps.start(pt);ps.stop(pt+.02);}};
  return{count:{tick:0,land:0,tap:0} /* land: clunk removed, stays 0 */,
    move(x,span){const d=Math.floor(x/(span/DET));if(lastD===null){lastD=d;return;}if(d===lastD)return;lastD=d;const n=performance.now();if(n-lastT<MINGAP)return;lastT=n;this.count.tick++;hit(3200,6,.5,.012);},
    tap(){this.count.tap++;hit(1200,2,1,.04);body(140,.6,.08);},
    /* easter egg: 7th+ consecutive theme toggle (counter resets after 6s idle) = broken-circuit short */
    _tg:0,_tgT:0,toggle(){const n=performance.now();if(n-this._tgT>6000)this._tg=0;this._tgT=n;this._tg++;if(this._tg<7){this.tap();return'tap';}this.count.zap=(this.count.zap||0)+1;zap();return'zap';},
    set(on){mute=!on;localStorage.setItem('dbh-sound',on?'on':'off');},get on(){return!mute;}};})();
window.dbhSfx=window.__sound=sfx;})();
