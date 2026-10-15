/* Shared dial sound (home + project pages). Silent until first input; mute: window.__sound.set(false) (localStorage dbh-sound). */
(()=>{const sfx=(()=>{const VOL=.18,DET=4,MINGAP=38;let ac=null,out=null,nb=null,lastT=0,lastD=null,mute=localStorage.getItem('dbh-sound')==='off';
  const unlock=()=>{if(ac){if(ac.state==='suspended')ac.resume();return;}const C=window.AudioContext||window.webkitAudioContext;if(!C)return;ac=new C();out=ac.createGain();out.gain.value=VOL;out.connect(ac.destination);
    nb=ac.createBuffer(1,Math.round(ac.sampleRate*.03),ac.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);};
  ['pointerdown','keydown','wheel','touchstart'].forEach(e=>addEventListener(e,unlock,{passive:true,capture:true}));
  const hit=(f,q,g,dur)=>{if(!ac||mute||ac.state!=='running')return;const t=ac.currentTime,s=ac.createBufferSource(),bp=ac.createBiquadFilter(),a=ac.createGain();s.buffer=nb;s.playbackRate.value=.9+Math.random()*.2;
    bp.type='bandpass';bp.frequency.value=f*(.94+Math.random()*.12);bp.Q.value=q;a.gain.setValueAtTime(g,t);a.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(bp).connect(a).connect(out);s.start(t);s.stop(t+dur+.01);};
  const body=(f,g,dur)=>{if(!ac||mute||ac.state!=='running')return;const t=ac.currentTime,o=ac.createOscillator(),a=ac.createGain();o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*.5,t+dur);a.gain.setValueAtTime(g,t);a.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(a).connect(out);o.start(t);o.stop(t+dur+.01);};
  return{count:{tick:0,land:0,tap:0} /* land: clunk removed, stays 0 */,
    move(x,span){const d=Math.floor(x/(span/DET));if(lastD===null){lastD=d;return;}if(d===lastD)return;lastD=d;const n=performance.now();if(n-lastT<MINGAP)return;lastT=n;this.count.tick++;hit(3200,6,.5,.012);},
    tap(){this.count.tap++;hit(1200,2,1,.04);body(140,.6,.08);},
    set(on){mute=!on;localStorage.setItem('dbh-sound',on?'on':'off');},get on(){return!mute;}};})();
window.dbhSfx=window.__sound=sfx;})();
