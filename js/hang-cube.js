/* HANG cube — easter-egg embed for designbyhang.com. Vanilla JS + canvas 2D, no dependencies.
   OVERLAP VARIANT (hang-cube-overlap.src.js). Built by make_embed_overlap.py (inlines glyphs/glyphs-custom-s184-g7.json). See README.md.
   API:  HangCube.mount(el, opts) -> {setG, renderAt, redraw, destroy}
         HangCube.egg(opts)        -> wires a trigger (default: the homepage copyright "footer.bot > span") to a page-coloured overlay
   Colours are read live from the site's CSS variables: --page (background) and --ink (cube). No blue, greys only. */
(function(){"use strict";
if(window.HangCube)return;
const GL={"H":{"W":704,"contours":[[[0,0],[0,704],[184.0,704],[184.0,426.0],[520.0,426.0],[520.0,704],[704,704],[704,0],[520.0,0],[520.0,278.0],[184.0,278.0],[184.0,0]]],"guides":{"H":[0,278.0,426.0,704],"V":[0,184.0,520.0,704],"L":[],"axes":[["v",352.0],["h",352.0]],"center":null},"dots":[[0,0],[0,704],[184.0,704],[184.0,426.0],[520.0,426.0],[520.0,704],[704,704],[704,0],[520.0,0],[520.0,278.0],[184.0,278.0],[184.0,0]]},"A":{"W":776,"contours":[[[0,0],[276.0,704],[500.0,704],[776,0],[580,0],[543.188,102],[232.812,102],[196,0]],[[286.226,250],[489.774,250],[388.0,532]]],"guides":{"H":[0,102,250,704],"V":[],"L":[[[0,0],[276.0,704]],[[776,0],[500.0,704]],[[196,0],[388.0,532]],[[580,0],[388.0,532]]],"axes":[["v",388.0]],"center":null},"dots":[[0,0],[276.0,704],[500.0,704],[776,0],[580,0],[543.188,102],[232.812,102],[196,0],[286.226,250],[489.774,250],[388.0,532]]},"N":{"W":704,"contours":[[[0,0],[0,704],[192,704],[520.0,261.112],[520.0,704],[704,704],[704,0],[512,0],[184.0,442.888],[184.0,0]]],"guides":{"H":[0,261.112,442.888,704],"V":[0,184.0,520.0,704],"L":[[[192,704],[520.0,261.112]],[[512,0],[184.0,442.888]]],"axes":[],"center":[352.0,352.0]},"dots":[[0,0],[0,704],[192,704],[520.0,261.112],[520.0,704],[704,704],[704,0],[512,0],[184.0,442.888],[184.0,0]]},"G1":{"W":736,"contours":[[[552.5,400.0],[552.0,400.0],[360.0,400.0],[360.0,224.0],[552.0,224.0],[552.0,148.0],[248.0,148.0],[243.814,148.137],[239.646,148.548],[235.514,149.23],[231.436,150.181],[227.428,151.397],[223.508,152.872],[219.694,154.6],[216.0,156.574],[212.444,158.786],[209.039,161.225],[205.802,163.882],[202.745,166.745],[199.882,169.802],[197.225,173.039],[194.786,176.444],[192.574,180.0],[190.6,183.694],[188.872,187.508],[187.397,191.428],[186.181,195.436],[185.23,199.514],[184.548,203.646],[184.137,207.814],[184.0,212.0],[184.0,492.0],[184.137,496.186],[184.548,500.354],[185.23,504.486],[186.181,508.564],[187.397,512.572],[188.872,516.492],[190.6,520.307],[192.574,524.0],[194.786,527.557],[197.225,530.961],[199.882,534.198],[202.745,537.255],[205.802,540.118],[209.039,542.775],[212.444,545.214],[216.0,547.426],[219.694,549.4],[223.508,551.128],[227.428,552.604],[231.436,553.819],[235.514,554.77],[239.646,555.452],[243.814,555.863],[248.0,556.0],[488.0,556.0],[492.186,555.863],[496.354,555.452],[500.486,554.77],[504.564,553.819],[508.572,552.604],[512.492,551.128],[516.307,549.4],[520.0,547.426],[523.557,545.214],[526.961,542.775],[530.198,540.118],[533.255,537.255],[536.118,534.198],[538.775,530.961],[541.214,527.557],[543.426,524.0],[545.4,520.307],[547.128,516.492],[548.604,512.572],[549.819,508.564],[550.77,504.486],[551.452,500.354],[551.863,496.186],[552.0,492.0],[552.0,464.0],[736.0,464.0],[736.0,512.0],[735.589,524.557],[734.357,537.061],[732.311,549.457],[729.458,561.693],[725.811,573.716],[721.385,585.475],[716.2,596.919],[710.277,608.0],[703.642,618.669],[696.324,628.882],[688.353,638.594],[679.764,647.764],[670.594,656.353],[660.882,664.324],[650.669,671.642],[640.0,678.277],[628.919,684.2],[617.475,689.385],[605.716,693.811],[593.693,697.458],[581.457,700.311],[569.061,702.357],[556.557,703.589],[544.0,704.0],[192.0,704.0],[179.443,703.589],[166.939,702.357],[154.543,700.311],[142.307,697.458],[130.284,693.811],[118.525,689.385],[107.081,684.2],[96.0,678.277],[85.331,671.642],[75.118,664.324],[65.406,656.353],[56.236,647.764],[47.647,638.594],[39.676,628.882],[32.358,618.669],[25.723,608.0],[19.8,596.919],[14.615,585.475],[10.189,573.716],[6.542,561.693],[3.689,549.457],[1.643,537.061],[0.411,524.557],[0.0,512.0],[0.0,192.0],[0.411,179.443],[1.643,166.939],[3.689,154.543],[6.542,142.307],[10.189,130.284],[14.615,118.525],[19.8,107.081],[25.723,96.0],[32.358,85.331],[39.676,75.118],[47.647,65.406],[56.236,56.236],[65.406,47.647],[75.118,39.676],[85.331,32.358],[96.0,25.723],[107.081,19.8],[118.525,14.615],[130.284,10.189],[142.307,6.542],[154.543,3.689],[166.939,1.643],[179.443,0.411],[192.0,0.0],[736.0,0.0],[736.0,400.0]]],"guides":{"H":[0,148,224,400,464,556,704],"V":[0,184.0,360,552.0,736],"L":[],"axes":[],"center":null,"arcs":[[192,192,192],[544,512,192],[192,512,192],[248.0,212,64],[488.0,492,64],[248.0,492,64]]},"dots":[[552.0,400.0],[360.0,400.0],[360.0,224.0],[552.0,224.0],[552.0,148.0],[552.0,464.0],[736.0,464.0],[736.0,0.0],[736.0,400.0]]},"G2":{"W":736,"contours":[[[552.5,400.0],[552.0,400.0],[392.0,400.0],[392.0,224.0],[552.0,224.0],[552.0,148.0],[336.0,148.0],[326.059,148.325],[316.16,149.3],[306.346,150.921],[296.659,153.179],[287.141,156.067],[277.832,159.57],[268.772,163.675],[260.0,168.364],[251.553,173.617],[243.468,179.41],[235.779,185.72],[228.52,192.52],[221.72,199.779],[215.41,207.468],[209.617,215.553],[204.364,224.0],[199.675,232.772],[195.57,241.832],[192.067,251.141],[189.179,260.659],[186.921,270.346],[185.3,280.16],[184.325,290.059],[184.0,300.0],[184.0,404.0],[184.325,413.941],[185.3,423.84],[186.921,433.654],[189.179,443.341],[192.067,452.859],[195.57,462.168],[199.675,471.228],[204.364,480.0],[209.617,488.447],[215.41,496.532],[221.72,504.221],[228.52,511.48],[235.779,518.28],[243.468,524.59],[251.553,530.383],[260.0,535.636],[268.772,540.325],[277.832,544.43],[287.141,547.933],[296.659,550.821],[306.346,553.079],[316.16,554.7],[326.059,555.675],[336.0,556.0],[400.0,556.0],[409.941,555.675],[419.84,554.7],[429.654,553.079],[439.341,550.821],[448.859,547.933],[458.168,544.43],[467.228,540.325],[476.0,535.636],[484.447,530.383],[492.532,524.59],[500.221,518.28],[507.48,511.48],[514.28,504.221],[520.59,496.532],[526.383,488.447],[531.636,480.0],[536.325,471.228],[540.43,462.168],[543.933,452.859],[546.821,443.341],[549.079,433.654],[550.7,423.84],[551.0,420.79],[551.0,464.0],[717.667,464.0],[717.319,465.147],[709.206,486.705],[699.699,507.686],[688.841,528.0],[676.677,547.561],[663.26,566.284],[648.648,584.09],[632.902,600.902],[616.09,616.648],[598.284,631.26],[579.561,644.677],[560.0,656.841],[539.686,667.699],[518.705,677.206],[497.147,685.319],[475.104,692.006],[452.672,697.236],[429.945,700.989],[407.022,703.246],[384.0,704.0],[352.0,704.0],[328.978,703.246],[306.055,700.989],[283.328,697.236],[260.896,692.006],[238.853,685.319],[217.295,677.206],[196.314,667.699],[176.0,656.841],[156.439,644.677],[137.716,631.26],[119.91,616.648],[103.098,600.902],[87.352,584.09],[72.74,566.284],[59.323,547.561],[47.159,528.0],[36.301,507.686],[26.794,486.705],[18.681,465.147],[11.994,443.104],[6.764,420.672],[3.011,397.945],[0.754,375.022],[0.0,352.0],[0.754,328.978],[3.011,306.055],[6.764,283.328],[11.994,260.896],[18.681,238.853],[26.794,217.295],[36.301,196.314],[47.159,176.0],[59.323,156.439],[72.74,137.716],[87.352,119.91],[103.098,103.098],[119.91,87.352],[137.716,72.74],[156.439,59.323],[176.0,47.159],[196.314,36.301],[217.295,26.794],[238.853,18.681],[260.896,11.994],[283.328,6.764],[306.055,3.011],[328.978,0.754],[352.0,0.0],[736.0,0.0],[736.0,352.0],[735.246,375.022],[732.989,397.945],[732.649,400.0]]],"guides":{"H":[0,148,224,400,464,556,704],"V":[0,184.0,392,552.0,736],"L":[],"axes":[],"center":null,"arcs":[[352,352,352],[384,352,352],[352,352,352],[336.0,300,152],[400.0,404,152],[336.0,404,152]]},"dots":[[552.0,400.0],[392.0,400.0],[392.0,224.0],[552.0,224.0],[552.0,148.0],[736.0,0.0]]},"G3":{"W":736,"contours":[[[2.19,481.415],[0.548,464.743],[0.0,448.0],[0.0,256.0],[0.548,239.257],[2.19,222.585],[4.919,206.057],[8.723,189.742],[13.586,173.712],[19.487,158.033],[26.401,142.774],[34.297,128.0],[43.144,113.774],[52.901,100.157],[63.529,87.207],[74.981,74.981],[87.207,63.529],[100.157,52.901],[113.774,43.144],[128.0,34.297],[142.774,26.401],[158.033,19.487],[173.712,13.586],[189.742,8.723],[206.057,4.919],[222.585,2.19],[239.257,0.548],[256.0,0.0],[480.0,0.0],[496.743,0.548],[513.415,2.19],[529.943,4.919],[546.258,8.723],[562.288,13.586],[577.967,19.487],[593.226,26.401],[608.0,34.297],[622.226,43.144],[635.843,52.901],[648.793,63.529],[661.019,74.981],[672.471,87.207],[683.098,100.157],[692.856,113.774],[701.702,128.0],[709.599,142.774],[716.513,158.033],[722.414,173.712],[727.277,189.742],[731.081,206.057],[733.81,222.585],[735.452,239.257],[736.0,256.0],[736.0,426.0],[552.5,426.0],[552.0,426.0],[360.0,426.0],[360.0,278.0],[552.0,278.0],[552.0,244.0],[551.794,237.721],[551.179,231.47],[550.155,225.271],[548.729,219.153],[546.905,213.142],[544.692,207.262],[542.1,201.54],[539.138,196.0],[535.821,190.665],[532.162,185.559],[528.177,180.703],[523.882,176.118],[519.297,171.823],[514.441,167.838],[509.335,164.179],[504.0,160.862],[498.46,157.9],[492.738,155.308],[486.858,153.095],[480.847,151.271],[474.729,149.845],[468.531,148.821],[462.279,148.206],[456.0,148.0],[280.0,148.0],[273.721,148.206],[267.469,148.821],[261.271,149.845],[255.153,151.271],[249.142,153.095],[243.262,155.308],[237.54,157.9],[232.0,160.862],[226.665,164.179],[221.559,167.838],[216.703,171.823],[212.118,176.118],[207.823,180.703],[203.838,185.559],[200.179,190.665],[196.862,196.0],[193.9,201.54],[191.308,207.262],[189.095,213.142],[187.271,219.153],[185.845,225.271],[184.821,231.47],[184.206,237.721],[184.0,244.0],[184.0,460.0],[184.206,466.279],[184.821,472.531],[185.845,478.729],[187.271,484.847],[189.095,490.858],[191.308,496.738],[193.9,502.46],[196.862,508.0],[200.179,513.335],[203.838,518.441],[207.823,523.297],[212.118,527.882],[216.703,532.177],[221.559,536.162],[226.665,539.821],[232.0,543.138],[237.54,546.1],[243.262,548.692],[249.142,550.905],[255.153,552.729],[261.271,554.155],[267.469,555.179],[273.721,555.794],[280.0,556.0],[456.0,556.0],[462.279,555.794],[468.531,555.179],[474.729,554.155],[480.847,552.729],[486.858,550.905],[492.738,548.692],[498.46,546.1],[504.0,543.138],[509.335,539.821],[514.441,536.162],[519.297,532.177],[523.882,527.882],[528.177,523.297],[532.162,518.441],[535.821,513.335],[539.138,508.0],[542.1,502.46],[544.692,496.738],[546.905,490.858],[548.729,484.847],[550.155,478.729],[551.0,473.613],[551.0,556.0],[711.967,556.0],[709.599,561.226],[701.702,576.0],[692.856,590.226],[683.098,603.843],[672.471,616.793],[661.019,629.019],[648.793,640.471],[635.843,651.098],[622.226,660.856],[608.0,669.702],[593.226,677.599],[577.967,684.513],[562.288,690.414],[546.258,695.277],[529.943,699.081],[513.415,701.81],[496.743,703.452],[480.0,704.0],[256.0,704.0],[239.257,703.452],[222.585,701.81],[206.057,699.081],[189.742,695.277],[173.712,690.414],[158.033,684.513],[142.774,677.599],[128.0,669.702],[113.774,660.856],[100.157,651.098],[87.207,640.471],[74.981,629.019],[63.529,616.793],[52.901,603.843],[43.144,590.226],[34.297,576.0],[26.401,561.226],[19.487,545.967],[13.586,530.288],[8.723,514.258],[4.919,497.943]]],"guides":{"H":[0,148,278.0,426.0,556,704],"V":[0,184.0,360,552.0,736],"L":[],"axes":[["h",352.0]],"center":null,"arcs":[[256,256,256],[480,256,256],[480,448,256],[256,448,256],[280.0,244,96],[456.0,244,96],[456.0,460,96],[280.0,460,96]]},"dots":[[736.0,426.0],[552.0,426.0],[360.0,426.0],[360.0,278.0],[552.0,278.0]]},"G":{"W":744,"contours":[[[392.0,-12.0],[353.516,-11.337],[322.707,-9.348],[294.449,-6.039],[267.918,-1.417],[242.791,4.507],[218.916,11.719],[196.224,20.203],[174.685,29.941],[154.293,40.91],[135.057,53.09],[116.995,66.454],[100.131,80.979],[84.489,96.639],[70.096,113.41],[56.98,131.272],[45.167,150.207],[34.68,170.208],[25.543,191.28],[17.776,213.448],[11.397,236.781],[6.42,261.417],[2.856,287.657],[0.714,316.264],[0.0,352.0],[0.714,387.736],[2.856,416.343],[6.42,442.583],[11.397,467.219],[17.776,490.551],[25.543,512.721],[34.68,533.792],[45.167,553.793],[56.98,572.728],[70.096,590.59],[84.489,607.361],[100.131,623.021],[116.995,637.546],[135.057,650.91],[154.293,663.09],[174.685,674.059],[196.224,683.797],[218.916,692.281],[242.791,699.493],[267.918,705.417],[294.449,710.039],[322.707,713.348],[353.516,715.337],[392.0,716.0],[421.5,715.502],[447.288,714.008],[471.671,711.524],[495.016,708.058],[517.444,703.619],[538.996,698.222],[559.671,691.883],[579.447,684.621],[598.294,676.458],[616.174,667.418],[633.046,657.527],[648.869,646.813],[663.6,635.306],[677.199,623.036],[689.629,610.032],[700.853,596.325],[710.838,581.942],[719.555,566.906],[726.976,551.232],[733.079,534.92],[737.846,517.943],[741.261,500.209],[743.315,481.454],[744.0,460.0],[560,460],[559.657,468.043],[558.631,475.532],[556.924,482.775],[554.544,489.811],[551.498,496.643],[547.798,503.264],[543.458,509.659],[538.492,515.812],[532.92,521.705],[526.761,527.319],[520.036,532.636],[512.771,537.638],[504.989,542.309],[496.718,546.632],[487.985,550.591],[478.819,554.174],[469.248,557.366],[459.3,560.156],[449.001,562.534],[438.372,564.492],[427.428,566.023],[416.161,567.12],[404.512,567.78],[392.0,568.0],[373.705,567.598],[358.635,566.392],[344.677,564.386],[331.491,561.586],[318.945,557.997],[306.983,553.63],[295.578,548.494],[284.727,542.604],[274.432,535.973],[264.703,528.617],[255.553,520.553],[246.998,511.798],[239.054,502.37],[231.736,492.287],[225.061,481.565],[219.044,470.219],[213.7,458.26],[209.04,445.693],[205.077,432.509],[201.821,418.683],[199.279,404.152],[197.459,388.77],[196.365,372.162],[196.0,352.0],[196.365,331.838],[197.459,315.23],[199.279,299.848],[201.821,285.317],[205.077,271.491],[209.04,258.307],[213.7,245.739],[219.044,233.781],[225.061,222.435],[231.736,211.713],[239.054,201.63],[246.998,192.202],[255.553,183.447],[264.703,175.383],[274.432,168.027],[284.727,161.396],[295.578,155.506],[306.983,150.37],[318.945,146.003],[331.491,142.414],[344.677,139.614],[358.635,137.608],[373.705,136.402],[392.0,136.0],[404.512,136.22],[416.161,136.88],[427.428,137.977],[438.372,139.508],[449.001,141.466],[459.3,143.844],[469.248,146.634],[478.819,149.826],[487.985,153.409],[496.718,157.368],[504.989,161.691],[512.771,166.362],[520.036,171.364],[526.761,176.681],[532.92,182.295],[538.492,188.188],[543.458,194.341],[547.798,200.736],[551.498,207.357],[554.544,214.189],[556.924,221.225],[558.631,228.468],[559.657,235.957],[560.0,244.0],[392.0,244],[392.0,392],[744,392],[744,0],[624,0],[612.468,34.595],[598.294,27.542],[579.447,19.379],[559.671,12.117],[538.996,5.778],[517.444,0.381],[495.016,-4.058],[471.671,-7.524],[447.288,-10.008],[421.5,-11.502]]],"guides":{"H":[0,136,244,392,460,568,704],"V":[0,196,392,560,744],"L":[[[624,0],[600,72]]],"axes":[],"center":null,"arcs":[[392,352,392,364,2.35,180,270],[392,352,392,364,2.35,90,180],[392,460,352,256,2.2,0,90],[392,460,168,108,2.1,0,90],[392,352.0,196,216.0,2.3,90,180],[392,352.0,196,216.0,2.3,180,270],[392,244,168,108,2.1,270,360],[392,352,302.545,364,2.2,270,311.47]],"over":[-12,716]},"dots":[[392,-12],[0,352],[392,716],[744,460],[560,460],[392,568],[196,352.0],[392,136],[560,244],[392.0,244],[392.0,392],[744,392],[744,0],[624,0],[612.468,34.595]]}}, CAP=704;
/* choreography = v1 prism render (turn ease .55,0,.1,1; straight-on yaw; v1 perspective 1280px on an 800px face → dist 4.2 half-faces;
   blueprint starts while the face is still turning in), slowed so the line drawing reads. Times in seconds. */
/* MOTION = v1 (src/hang-prism.html) ported directly: 60 fps frame values, ×timeScale (1 = v1 pacing).
   beat 76f · turn 26f cubic-bezier(.55,0,.1,1) · blueprint starts 4f into the turn · dots 0–8 · guides 2–22 (+2f stagger)
   · outline 8–28 · fill 24–34 · guides retract 28–40 (+2f stagger) · dots out 36–54.
   Easing vocabulary from designbyhang.com (home intro card + Studio deck intro): lines glide on cubic-bezier(.65,0,.35,1),
   dots/letter arrive on cubic-bezier(.2,.7,.2,1). */
/* RETIMED to Hang's reference (ref-speed/ref.mov = the Studio deck grid draw-in, measured): each line takes 1.7 s on
   cubic-bezier(.65,0,.35,1), 150 ms between lines. v1's build (frames) stretched ×5.1 so a guide takes 1.7 s; v1's order and
   overlaps kept; symmetric pairs share a slot, slots 0.30 s apart (two lines × 150 ms). Seconds, ×timeScale. */
/* DOTS-LEAD CYCLE (Hang, Oct 23): every screen = blank → dots in → hairlines grow OUT OF the dots → letter fills → lines + dots
   glide away → the solid letter turns (0.55 s) onto the next BLANK screen. The turn now sits at the END of each beat; the incoming
   face is empty. Blueprint times are seconds from the dots' start (start = 0.20 s blank lead); everything after the dots is v1's
   build shifted +0.51 s so the first line leaves only once the dots have landed (0.68 s). Line speed unchanged: 1.7 s on
   (.65,0,.35,1), slots 0.30 s apart (2 × 150 ms). Beat 6.6 s (= 0.20 blank + 5.10 build + 0.75 hold + 0.55 turn), loop 26.4 s. */
/* OVERLAP CYCLE (Hang, Oct 23 — "the overlapping timeline between rotation and line animations is what makes it feel dimensional"):
   the ORIGINAL first render's timeline (src/hang-prism.html, 60 fps: beat 76f, turn 0–26f at the START of the beat on
   (.55,0,.1,1), blueprint starts 4f into the turn: dots 0–8, guides 2–22 (+2f stagger), outline 8–28, fill 24–34,
   retract 28–40 (+2f), dots out 40–58) scaled uniformly ×5.1 (1 original frame = 0.085 s) so one guide still glides 1.7 s on
   (.65,0,.35,1). So the next letter's dots + hairlines grow in WHILE the face is still turning (dots start at 3° of the turn,
   lines at 10°, outline at 66°; the last lines land as the turn settles), exactly like the original cut. The outgoing letter
   turns away solid, as in the original. Times in seconds from the beat start (turn at 0); blueprint times from start=0.34 s.
   Beat 6.40 s (original 6.46 s, hold trimmed 0.06 s to land on whole 60 fps frames), loop 25.6 s = 1536 frames.
   exitLag (option, default 0) delays guide/dot exits so they can overlap the NEXT turn-out; 0 = the original's pacing. */
/* SNAP + DOTS-FIRST EXIT (Hang, Oct 23 review): (1) the dots leave the moment the letter is formed (= fill complete, 2.89 s after the
   blueprint start) and are fully gone (0.68 s, the dots' own entry length) before the lines start to glide away 0.10 s later;
   line exits keep 1.02 s + 0.30 s per slot. (2) Snappier arrival: turn 1.70 s on cubic-bezier(.65,0,.3,1) (was 2.21 s on
   (.55,0,.1,1)): the same start (3° at 0.31 s, 10° at 0.50 s, so the next letter's dots/lines still grow in during the turn), similar
   peak speed, but it locks at 1.6 s instead of trailing a 0.75 s settle (80°→locked now 0.45 s). Beat stays 6.40 s, loop 25.6 s. */
/* SPEED (Hang, Oct 23 18:06: "animation needs to play 50% faster"): every duration, delay and stagger in V1T is divided by SPEED at
   render time (same curves, same order/overlap). 1.5 → beat 4.2667 s = 256 frames @ 60 fps, loop 17.0667 s = 1024 frames.
   Change this one number (or pass {speed:n}) to retune. V1T stays in base (speed 1) seconds; HangCube.timing reports effective seconds. */
/* EARLIER TURN (Hang, Oct 23 20:30: "rotation slightly earlier, overlapping the line exit"): beat 6.4 -> 5.4 base s, so the
   next turn starts ~0.87 s (real) after the first lines start gliding away, while the later slots are still exiting. */
const SPEED=1.6;
const V1T={fps:1,beat:5.4,turn:1.7,turnEase:[.65,0,.3,1],start:.34,dots:[0,.68],guides:[.17,1.87],gStag:.3,outline:[.68,2.38],fill:[2.04,2.89],dotsOut:[2.89,3.57],retract:[3.67,4.69]};
const DEF={g:'G',timeScale:1,speed:SPEED,pitch:0,yaw:0,flat:true,size:.74,letterCap:.88,autoplay:true,exitLag:0,dist:4.2,focal:4.2,dotShape:'round'};
const de=document.documentElement;
const FALL={light:{page:'#ededed',ink:'#171717'},dark:{page:'#111111',ink:'#f2f2f2'}};
const reduce=matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- colour ---------- */
const nc=document.createElement('canvas').getContext('2d');
function rgb(s,fb){ if(!s||!s.trim())s=fb; nc.fillStyle='#000'; nc.fillStyle=s.trim(); const v=nc.fillStyle;
  if(v[0]==='#')return [1,3,5].map(i=>parseInt(v.slice(i,i+2),16)); const m=v.match(/[\d.]+/g); return m?m.slice(0,3).map(Number):[0,0,0]; }
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t), css=c=>`rgb(${c.map(v=>Math.round(v)).join(',')})`;
function themeColours(){
  const dark=de.dataset.theme?de.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches, f=dark?FALL.dark:FALL.light, cs=getComputedStyle(de);
  return {dark,page:rgb(cs.getPropertyValue('--page'),f.page),ink:rgb(cs.getPropertyValue('--ink'),f.ink)};
}
/* palette rule (same in both themes): the cube is the ink, letters are cut in the page colour; faces fade toward the page as they turn away */
function palette(T){ const {page,ink}=T; return {page,ink,face:ink,away:mix(ink,page,.42),cap:mix(ink,page,.26),letter:page,
  guide:mix(ink,page,.62),edge:mix(ink,page,.5),dot:ink,seed:page}; }
/* opts.colors:'random' (the homepage easter egg only): the letter's ink is the most saturated in-gamut OKLCH colour of hue h, as light
   as it can be on a light page (>=3:1 contrast); on a dark page a bright L .72 (>=4.5:1) */
function vivid(h,bg){ const lin=v=>(v/=255)<=.04045?v/12.92:((v+.055)/1.055)**2.4, Y=c=>.2126*c[0]+.7152*c[1]+.0722*c[2], yb=Y(bg.map(lin)), dk=yb<.18;
  const ok=(L,C)=>{const a=C*Math.cos(h*Math.PI/180),b=C*Math.sin(h*Math.PI/180),l=(L+.3963377774*a+.2158037573*b)**3,m=(L-.1055613458*a-.0638541728*b)**3,s=(L-.0894841775*a-1.291485548*b)**3;
    return [4.0767416621*l-3.3077115913*m+.2309699292*s,-1.2684380046*l+2.6097574011*m-.3413193965*s,-.0041960863*l-.7034186147*m+1.707614701*s];};
  let c; for(let i=0;i<=40;i++){ const L=dk?.72+i*.005:.78-i*.01; for(let C=.32;C>0;C-=.01){c=ok(L,C);if(c.every(v=>v>=-1e-4&&v<=1+1e-4))break;}
    const y=Y(c); if(dk?(y+.05)/(yb+.05)>=4.5:(yb+.05)/(y+.05)>=3)break; }
  return c.map(v=>255*(v<=.0031308?12.92*v:1.055*Math.max(0,v)**(1/2.4)-.055)); }

/* ---------- maths ---------- */
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)), ss=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
function bez(x1,y1,x2,y2){return x=>{if(x<=0)return 0;if(x>=1)return 1;let t=x;for(let i=0;i<8;i++){const cx=3*x1*t*(1-t)**2+3*x2*t*t*(1-t)+t**3-x,d=3*x1*(1-t)**2+6*(x2-x1)*t*(1-t)+3*(1-x2)*t*t;if(Math.abs(cx)<1e-6)break;t-=cx/(d||1e-6);t=clamp(t);}return 3*y1*t*(1-t)**2+3*y2*t*t*(1-t)+t**3;};}
const eGlide=bez(.65,0,.35,1), eArrive=bez(.2,.7,.2,1), eOut=bez(.2,.7,.2,1), eIn=bez(.6,0,.9,.4);
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]], mul=(v,k)=>[v[0]*k,v[1]*k,v[2]*k];

/* v1 blueprint style (src/hang-prism.html): a SPARSE set of hairline construction lines that hug the letter's own stems,
   bars and edges, clipped to the letter's box + 32 units (v1: 16px inside an 800px face around a 704 cap), each growing
   out of a square seed dot at a key corner/joint. Mapped onto the custom glyphs; g = step (partners share a step).
   h/v/l = line through the glyph drawn both ways out of its dot (o); seg = one way, dot → dot; c = the G's outer bowl. */
/* Guides + dots DERIVED from the glyph geometry (no typed coordinates), so they follow any stem weight (s184 now). */
function v1Set(key,g){
  const C=g.contours, gd=g.guides, W=g.W, by=(arr,f)=>arr.filter(f);
  if(key==='H'){ const S=gd.V[1], R=gd.V[2], y0=gd.H[1], y1=gd.H[2];   // stem inner edges, bar bottom / top
    return [{k:'h',y:0,o:[0,0],g:0},{k:'h',y:CAP,o:[W,CAP],g:0},{k:'v',x:S,o:[S,CAP],g:1},{k:'v',x:R,o:[R,0],g:1},
            {k:'h',y:y1,o:[S,y1],g:2},{k:'h',y:y0,o:[R,y0],g:2}]; }
  if(key==='A'){ const O=C[0], K=C[1];   // outer: 0 BL,1 apex-L,2 apex-R,3 BR,4..7 inner legs / bar underside; K = counter
    return [{k:'l',a:O[0],b:O[1],o:O[0],g:0},{k:'l',a:O[3],b:O[2],o:O[3],g:0},
            {k:'h',y:O[0][1],o:O[0],g:1},{k:'h',y:O[3][1],o:O[3],g:1},{k:'h',y:O[1][1],o:O[1],g:1},{k:'h',y:O[2][1],o:O[2],g:1},
            {k:'h',y:O[6][1],o:O[6],g:2},{k:'h',y:O[5][1],o:O[5],g:2},{k:'h',y:K[0][1],o:K[0],g:2},{k:'h',y:K[1][1],o:K[1],g:2}]; }
  if(key==='N'){ const n=C[0];   // 0 BL,1 TL,2 diag top-L,3 join R,4..6 right stem,7 diag bottom-R,8 join L,9 left stem foot
    return [{k:'h',y:0,o:n[0],g:0},{k:'h',y:CAP,o:n[5],g:0},{k:'v',x:n[1][0],o:n[1],g:1},{k:'v',x:n[6][0],o:n[6],g:1},
            {k:'v',x:n[8][0],o:n[8],g:2},{k:'v',x:n[3][0],o:n[3],g:2},
            {k:'seg',o:n[2],b:n[3],g:3},{k:'seg',o:n[7],b:n[8],g:3}]; }   // diagonal edges: one down from top-left, its 180° twin up from bottom-right
  if(key==='G'){ const c=C[0], Lw=gd.V[1], bb=gd.H[2], bt=gd.H[3], top=gd.over[1], bar=gd.V[2], sp=gd.L[0][1];
    const at=(x,y)=>c.find(p=>Math.abs(p[0]-x)<.01&&Math.abs(p[1]-y)<.01)||[x,y];
    const crown=c.reduce((m,p)=>p[1]>m[1]?p:m,c[0]);                                                       // top of the bowl
    const term=c.reduce((m,p)=>Math.abs(p[0]-W)<.01&&p[1]>m[1]?p:m,[W,-1e9]);                               // terminal corner
    // Hang (Oct 23): two more verticals — the bowl's outer left edge (V[0]) and the right stem's inner face (V[3]), each out of its own contour point
    const L0=c.reduce((m,p)=>p[0]<m[0]?p:m,c[0]), Ri=gd.V[3], ri=by(c,p=>Math.abs(p[0]-Ri)<.01).reduce((m,p)=>p[1]>m[1]?p:m,[Ri,-1e9]);
    // Hang (Oct 23, 21:21): the two left verticals grow out of dots ON the bar-top line (not mid-wall), and the bar's top-left corner gets a dot
    const foot=c.reduce((m,p)=>p[1]<m[1]?p:m,c[0]);   // bowl's lowest point
    // Hang (Oct 23, 21:27): both horizontals just touch the bowl (top at the crown, bottom at the foot), so neither cuts through it
    const gs=[{k:'h',y:foot[1],o:foot,g:0,nostart:true},{k:'h',y:top,o:[crown[0],top],g:0},{k:'v',x:W,o:at(W,0),g:1},{k:'v',x:Lw,o:[Lw,bt],g:1},
            {k:'v',x:L0[0],o:[L0[0],bt],g:1},{k:'v',x:Ri,o:ri,g:1},
            {k:'h',y:bt,o:at(W,bt),g:2},{k:'h',y:bb,o:at(bar,bb),g:2,nodot:true},{k:'c',from:sp,to:term,o:sp,g:3}];
    // Hang (Oct 23, 21:25): no dot at the bar's bottom-left corner (its line still grows from there); a dot at the bowl's lowest point (its edge, as the crown dot at the top)
    gs.dots=[{p:at(bar,bt),g:2}]; return gs; }
  return null;
}
const EXT=32;
/* per-glyph precompute: contour lengths, guides (each grows out of its seed dot), dot + guide timing.
   Timing is ranked by distance from the glyph centre, so mirror / 180°-rotation partners always move together:
   the build is exactly as symmetric as the glyph (H, A mirror; N point-symmetric). */
function prep(g,key){
  if(g._p)return g._p; const gd=g.guides, W=g.W, cx=W/2, cy=CAP/2, dc=p=>Math.hypot(p[0]-cx,p[1]-cy);
  const cl=g.contours.map(c=>{let L=0;const acc=[0];for(let i=1;i<=c.length;i++){const a=c[i-1],b=c[i%c.length];L+=Math.hypot(b[0]-a[0],b[1]-a[1]);acc.push(L);}
    // point-symmetric glyph: trace from two rotation-partner vertices at once (vertex i ↔ i+n/2), half the length each
    let starts=[0]; const n=c.length, h=n/2;
    if(gd.center&&n%2===0&&c.every((p,i)=>{const q=c[(i+h)%n];return Math.abs(2*gd.center[0]-p[0]-q[0])<.01&&Math.abs(2*gd.center[1]-p[1]-q[1])<.01;}))starts=[0,h];
    return {c,L,acc,starts};});
  // origin of an axis-aligned guide = its seed dot nearest the centre; a tie (mirror/rotation partners) → the centre's projection on the line
  const near=(pred,def)=>{const d=g.dots.filter(pred).sort((p,q)=>dc(p)-dc(q)); return !d.length||(d.length>1&&Math.abs(dc(d[0])-dc(d[1]))<.5)?def:d[0];};
  const G=[];
  gd.H.forEach(y=>G.push({o:near(p=>Math.abs(p[1]-y)<.5,[cx,y]),d:[1,0],kind:'l'}));
  gd.V.forEach(x=>G.push({o:near(p=>Math.abs(p[0]-x)<.5,[x,cy]),d:[0,1],kind:'l'}));
  // construction edges (A legs, N diagonal edges, G spur): ONE direction, from seed dot a to seed dot b
  (gd.L||[]).forEach(([a,b])=>G.push({o:a,b,kind:'seg'}));
  (gd.arcs||[]).forEach(a=>G.push({o:[a[0],a[1]],rx:a[2],ry:a.length>3?a[3]:a[2],e:a[4]||2,r0:a.length>6?a[5]-12:-90,r1:a.length>6?a[6]+12:270,kind:'arc'}));
  (gd.over||[]).forEach(y=>G.push({o:[cx,y],d:[1,0],kind:'l'}));
  const rank=(items,key)=>{const ks=[];items.forEach(it=>{const k=key(it);if(!ks.some(v=>Math.abs(v-k)<.5))ks.push(k);});ks.sort((a,b)=>a-b);
    const nr=ks.length;items.forEach(it=>{const k=key(it);it.r=nr>1?ks.findIndex(v=>Math.abs(v-k)<.5)/(nr-1):0;});};
  rank(G,s=>dc(s.o));
  // guide GROUPS draw one after another (partners share a group); long lists (G) are bucketed into ≤5 steps
  const rs=[...new Set(G.map(s=>s.r.toFixed(6)))].length, m=Math.min(5,rs); G.forEach(s=>{s.grp=rs<=5?Math.round(s.r*(rs-1)):Math.round(s.r*(m-1));});
  const AX=[]; (gd.axes||[]).forEach(([k,v])=>AX.push(k==='v'?{o:[v,cy],d:[0,1]}:{o:[cx,v],d:[1,0]}));
  if(gd.center)AX.push({o:gd.center,d:[1,0]},{o:gd.center,d:[0,1]});
  const dots=g.dots.map(p=>({p})); rank(dots,d=>dc(d.p)); // seeds pop from the centre outward, partners together
  const v1s=v1Set(key,g), v1=v1s&&{G:v1s}; if(v1){ // v1 style replaces the generic set: no box grid, no axes, no centre marker, dots = guide origins only
    const xs=g.contours.flat().map(p=>p[0]), ys=g.contours.flat().map(p=>p[1]);
    const B=[Math.min(...xs)-EXT,Math.min(...ys)-EXT,Math.max(...xs)+EXT,Math.max(...ys)+EXT];
    const clip=(p,d)=>{let t0=-1e9,t1=1e9;for(let i=0;i<2;i++){if(Math.abs(d[i])<1e-9)continue;let a=(B[i]-p[i])/d[i],b=(B[i+2]-p[i])/d[i];if(a>b)[a,b]=[b,a];t0=Math.max(t0,a);t1=Math.min(t1,b);}
      return [[p[0]+d[0]*t0,p[1]+d[1]*t0],[p[0]+d[0]*t1,p[1]+d[1]*t1]];};
    const near=(c,q)=>{let bi=0,bd=1e9;c.forEach((p,i)=>{const d=Math.hypot(p[0]-q[0],p[1]-q[1]);if(d<bd){bd=d;bi=i;}});return bi;};
    const mm=Math.max(...v1.G.map(s=>s.g))+1;
    const GG=v1.G.map(s=>{const o=s.o; let ends=null,pts=null;
      if(s.k==='h')ends=clip(o,[1,0]); else if(s.k==='v')ends=clip(o,[0,1]);
      else if(s.k==='l'){const L=Math.hypot(s.b[0]-s.a[0],s.b[1]-s.a[1]);ends=clip(o,[(s.b[0]-s.a[0])/L,(s.b[1]-s.a[1])/L]);}
      else if(s.k==='c'){const c=g.contours[0],i0=near(c,s.from),i1=near(c,s.to);pts=[];for(let i=i0;;i=(i+1)%c.length){pts.push(c[i]);if(i===i1)break;}}
      return {kind:s.k==='seg'?'seg':s.k==='c'?'curve':'v1',o,b:s.b,ends,pts,grp:s.g,r:mm>1?s.g/(mm-1):0,nodot:!!s.nodot,nostart:!!s.nostart};});
    const seen=[],D=[]; GG.forEach(s=>{if(s.nodot)return;if(!seen.some(p=>Math.hypot(p[0]-s.o[0],p[1]-s.o[1])<.5)){seen.push(s.o);D.push({p:s.o,r:s.r,extra:s.nostart});}});
    (v1s.dots||[]).forEach(d=>{if(!seen.some(p=>Math.hypot(p[0]-d.p[0],p[1]-d.p[1])<.5)){seen.push(d.p);D.push({p:d.p,r:mm>1?d.g/(mm-1):0,extra:true});}}); // extra dots that start no guide (G bar corner, bowl foot); outline traces never start at them
    // every outline trace starts AT a seed dot: a contour start that isn't a dot moves to the dot nearest along the outline (G → spur tip)
    cl.forEach(C=>{ const isDot=i=>D.some(d=>!d.extra&&Math.hypot(d.p[0]-C.c[i][0],d.p[1]-C.c[i][1])<.5);
      if(C.starts.every(isDot))return; const n=C.c.length; let best=null;
      for(let i=0;i<n;i++){ if(!isDot(i))continue; const a=C.acc[i], d=Math.min(a,C.L-a); if(!best||d<best.d)best={i,d}; }
      if(best){ const i=best.i, c2=C.c.slice(i).concat(C.c.slice(0,i)); let L=0; const acc=[0];
        for(let j=1;j<=n;j++){const p=c2[j-1],q=c2[j%n];L+=Math.hypot(q[0]-p[0],q[1]-p[1]);acc.push(L);} C.c=c2; C.acc=acc; C.starts=[0]; } });
    return g._p={cl,G:GG,AX:[],dots:D,center:null,m:mm}; }
  return g._p={cl,G,AX,dots,center:gd.center,m};
}

/* ---------- renderer ---------- */
function mount(el,opts){
  const o=Object.assign({},DEF,opts||{}), eTurn=bez(...(o.turnEase||V1T.turnEase)); const cv=document.createElement('canvas'); cv.setAttribute('aria-hidden','true');
  cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block';
  if(getComputedStyle(el).position==='static')el.style.position='relative'; el.appendChild(cv);
  const ctx=cv.getContext('2d'); let Wc=0,Hc=0,dpr=1,raf=0,t0=performance.now(),tNow=0,fixed=null,dead=false;
  let pal=palette(themeColours()), palFrom=null, palAt=0;
  const seq=()=>['H','A','N',GL[o.g]?o.g:'G'];
  const hues=new Map(), hue=n=>{ if(!hues.has(n)){const p=hues.get(n-1); hues.set(n,p==null?Math.random()*360:(p+60+Math.random()*240)%360); hues.delete(n-3);} return hues.get(n); }; // colors:'random': a fresh hue per beat, >=60deg from the last
  function size(){const r=el.getBoundingClientRect();dpr=Math.min(3,window.devicePixelRatio||1);Wc=Math.max(1,r.width);Hc=Math.max(1,r.height);
    cv.width=Math.round(Wc*dpr);cv.height=Math.round(Hc*dpr);draw();}
  function curPal(){ if(!palFrom)return pal; const k=clamp((performance.now()-palAt)/300); if(k>=1){palFrom=null;return pal;}
    const e=ss(0,1,k),P={}; for(const n in pal)P[n]=mix(palFrom[n],pal[n],e); return P; }
  function onTheme(){ const np=palette(themeColours()); const anim=de.classList.contains('theme-anim')&&!reduce.matches;
    palFrom=anim?curPal():null; palAt=performance.now(); pal=np; draw(); if(anim&&!raf&&!running())tween(); }
  function tween(){ if(dead)return; draw(); if(palFrom)requestAnimationFrame(tween); }
  const mo=new MutationObserver(onTheme); mo.observe(de,{attributes:true,attributeFilter:['data-theme','class','style']});
  const mq=matchMedia('(prefers-color-scheme: dark)'); mq.addEventListener('change',onTheme);
  const ro=new ResizeObserver(size); ro.observe(el);
  const running=()=>o.autoplay&&!reduce.matches&&fixed===null;

  function draw(){
    const P=curPal(), S=Math.min(Wc,Hc);
    // strokes + dots scale with the box: 480 box → 1px lines, 4px dots; 1080 → ~1.75px lines, 8px dots (8pt grid halves)
    const lw=o.lw||1, dotS=o.dot||Math.max(4,Math.round(S/1080*4)*2); ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,Wc,Hc);
    const fs=o.timeScale/(V1T.fps*(o.speed||SPEED)), beat=V1T.beat*fs, loop=4*beat; let t=fixed!==null?fixed:(running()?tNow:V1T.beat*fs-.001); // reduced motion: end of the H hold (H solid)
    const first=t<beat, nb=Math.floor(t/beat); t=((t%loop)+loop)%loop; const k=Math.min(3,Math.floor(t/beat)), tb=t-k*beat;
    const rot=-90*(k-1)-90*eTurn(clamp(tb/((o.turn||V1T.turn)*fs))); // turn at the START of the beat (original): face k-1 turns away, face k turns in
    const h=1, rad=Math.PI/180, cp=Math.cos(o.pitch*rad), sp=Math.sin(o.pitch*rad), cy=Math.cos(o.yaw*rad), sy=Math.sin(o.yaw*rad);
    const view=([x,y,z])=>{const x1=x*cy+z*sy,z1=-x*sy+z*cy;return [x1,y*cp-z1*sp,y*sp+z1*cp];};
    const sc=S*o.size/2*(o.dist-1)/o.focal, ox=Wc/2, oy=Hc/2+S*.02;
    const proj=v=>{const [x,y,z]=view(v),d=o.dist-z;return [ox+sc*o.focal*x/d, oy-sc*o.focal*y/d];};
    const cam=[0,0,o.dist];
    const faces=[0,1,2,3].map(j=>{const a=(j*90+rot)*rad,n=[Math.sin(a),0,Math.cos(a)],tn=[Math.cos(a),0,-Math.sin(a)],c=mul(n,h);
      const pt=(u,v)=>add(add(c,mul(tn,u)),[0,v,0]); return {j,n,c,pt,cs:[pt(-h,-h),pt(h,-h),pt(h,h),pt(-h,h)]};});
    const top={n:[0,1,0],c:[0,h,0],cs:[0,1,2,3].map(j=>{const a=(j*90+rot-45)*rad;return [Math.SQRT2*Math.sin(a),h,Math.SQRT2*Math.cos(a)];}),top:1};
    const all=[...faces,top];
    all.forEach(f=>{const vn=view(f.n),vc=view(f.c),tc=[cam[0]-vc[0],cam[1]-vc[1],cam[2]-vc[2]],l=Math.hypot(...tc);f.cos=(vn[0]*tc[0]+vn[1]*tc[1]+vn[2]*tc[2])/l;f.lit=ss(.02,.5,f.cos);});
    const poly=pts=>{ctx.beginPath();pts.forEach((p,i)=>{const [x,y]=proj(p);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();};
    const vis=all.filter(f=>f.cos>0);
    // FLAT (v1 look, default): no cube body — faces are the page colour, no fill/top/edges/corner dots; the letters carry the rotation
    for(const f of vis){ if(o.flat){f.tone=P.page;continue;} f.tone=f.top?P.cap:mix(P.away,P.face,f.lit); poly(f.cs); ctx.fillStyle=css(f.tone); ctx.fill(); }
    // letters
    const L=seq(), kf=(o.letterCap*2*h)/CAP;
    for(const f of faces){ if(f.cos<=0)continue; const j=f.j;   // only the current letter's face carries anything; the face turning in is BLANK
      // incoming face k: blank until the blueprint starts 0.34 s into the turn; outgoing face k-1 keeps its own clock (solid, or still exiting with exitLag)
      const tau = j===k ? tb-V1T.start*fs : j===(k+3)%4&&!first ? tb+beat-V1T.start*fs : null; if(tau===null||tau<0)continue;
      const g=GL[L[j]], pr=prep(g,L[j]), gx=g.W/2;
      const T=p=>proj(f.pt((p[0]-gx)*kf,(p[1]-CAP/2)*kf));
      const ink=o.colors==='random'?vivid(hue(j===k?nb:nb-1),P.page):o.flat?P.ink:P.letter, lc=mix(f.tone,ink,f.lit), gc=mix(f.tone,ink,(o.flat?.68:.85)*f.lit), TL=o.tl; // flat: --ink on --page, shading toward the page as it turns away (v1)
      ctx.save(); poly(f.cs); ctx.clip(); ctx.lineWidth=lw; ctx.lineJoin='miter';
      const F=tau/fs, pg=(a,b2)=>clamp((F-a)/(b2-a)), V=V1T, XL=o.exitLag||0; // F = seconds since the blueprint started (÷timeScale)
      const n=pr.G.length, sg=V.gStag; // partners share a slot
      pr.G.forEach(s=>{ const off=s.grp*sg, gr=eGlide(pg(V.guides[0]+off,V.guides[1]+off)), rr=eGlide(pg(V.retract[0]+XL+off,V.retract[1]+XL+off));
        if(gr<=0.001||rr>=.999)return; ctx.strokeStyle=css(gc);
        if(s.kind==='v1'){ // two half-lines glide out of the dot; the exit glides from the dot outward, the tail running off the ends
          for(const E of s.ends){const P0=[s.o[0]+(E[0]-s.o[0])*rr,s.o[1]+(E[1]-s.o[1])*rr],P1=[s.o[0]+(E[0]-s.o[0])*gr,s.o[1]+(E[1]-s.o[1])*gr];
            if(gr>rr){ctx.beginPath();ctx.moveTo(...T(P0));ctx.lineTo(...T(P1));ctx.stroke();}} return; }
        if(s.kind==='curve'){ const m=s.pts.length-1, a0=rr*m, a1=gr*m; if(a1<=a0)return; const at=u=>{const i=Math.min(m-1,Math.floor(u)),w=u-i,p=s.pts[i],q=s.pts[i+1];return [p[0]+(q[0]-p[0])*w,p[1]+(q[1]-p[1])*w];};
          ctx.beginPath(); ctx.moveTo(...T(at(a0))); for(let i=Math.floor(a0)+1;i<a1;i++)ctx.lineTo(...T(s.pts[i])); ctx.lineTo(...T(at(a1))); ctx.stroke(); return; }
        if(s.kind==='seg'){const a=T([s.o[0]+(s.b[0]-s.o[0])*rr,s.o[1]+(s.b[1]-s.o[1])*rr]),b=T([s.o[0]+(s.b[0]-s.o[0])*gr,s.o[1]+(s.b[1]-s.o[1])*gr]);ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();return;}
        if(s.kind==='l'){const lim=2/kf,e=gr*(1-rr),a=T([s.o[0]-s.d[0]*lim*e,s.o[1]-s.d[1]*lim*e]),b=T([s.o[0]+s.d[0]*lim*e,s.o[1]+s.d[1]*lim*e]);ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();} });
      // outline trace (v1 8–28f, gliding); the letter then forms by rising into its outline from the baseline (v1 fill window 24–34f,
      // the home intro card's upward letter entrance, eased .2,.7,.2,1) — solid ink, no grey fade
      const tr=eGlide(pg(V.outline[0],V.outline[1])), fk=eArrive(pg(V.fill[0],V.fill[1]));
      const path=()=>{ctx.beginPath();for(const C of pr.cl){C.c.forEach((p,i)=>{const [x,y]=T(p);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();}};
      if(fk<1&&tr>0){ ctx.strokeStyle=css(lc); for(const C of pr.cl){ const nn=C.c.length; for(const s0 of C.starts){ let left=C.L/C.starts.length*tr; ctx.beginPath(); ctx.moveTo(...T(C.c[s0]));
        for(let j2=1;j2<=nn&&left>0;j2++){const i0=(s0+j2-1)%nn,i1=(s0+j2)%nn,a=C.c[i0],b=C.c[i1],l=C.acc[i0+1]-C.acc[i0],u=Math.min(1,left/l);ctx.lineTo(...T([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u]));left-=l;} ctx.stroke(); } } }
      if(fk>0){ ctx.save(); if(fk<1){ const yTop=-12+(716+12)*fk, q=[T([-40,-40]),T([g.W+40,-40]),T([g.W+40,yTop]),T([-40,yTop])];
          ctx.beginPath(); q.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p)); ctx.closePath(); ctx.clip(); }
        path(); ctx.fillStyle=css(lc); ctx.fill('evenodd'); ctx.restore(); }
      // seed dots: ROUND (this piece only), v1 size; grow in 0–8f, shrink out 36–54f
      const dsz=dotS*eArrive(pg(V.dots[0],V.dots[1]))*(1-eGlide(pg(V.dotsOut[0]+XL,V.dotsOut[1]+XL)));
      if(dsz>.2){ ctx.fillStyle=css(lc); pr.dots.forEach(({p})=>{const [x,y]=T(p); ctx.beginPath(); if(o.dotShape==='square')ctx.rect(x-dsz/2,y-dsz/2,dsz,dsz); else ctx.arc(x,y,dsz/2,0,Math.PI*2); ctx.fill();}); }
      ctx.restore(); }
    // hairline edges + square corner dots (cube mode only)
    if(o.flat)return;
    const key=(a,b)=>[a,b].map(p=>p.map(v=>v.toFixed(3)).join(',')).sort().join('|'), em=new Map();
    for(const f of vis)for(let i=0;i<4;i++){const a=f.cs[i],b=f.cs[(i+1)%4];em.set(key(a,b),[a,b]);}
    ctx.strokeStyle=css(P.edge); ctx.lineWidth=1; // hairline edges stay 1 css px
    for(const [a,b] of em.values()){ctx.beginPath();ctx.moveTo(...proj(a));ctx.lineTo(...proj(b));ctx.stroke();}
    const cs=[]; vis.forEach(f=>f.cs.forEach(p=>{if(!cs.some(q=>Math.hypot(q[0]-p[0],q[1]-p[1],q[2]-p[2])<1e-6))cs.push(p);}));
    ctx.fillStyle=css(P.dot); const cd=dotS; cs.forEach(p=>{const [x,y]=proj(p);ctx.fillRect(Math.round(x-cd/2),Math.round(y-cd/2),cd,cd);});
  }
  let last=performance.now();
  function tick(now){ if(dead)return; raf=0; if(running()){ if(!document.hidden)tNow+=(now-last)/1000; last=now; draw(); raf=requestAnimationFrame(tick);} else { last=now; draw(); } }
  function start(){ if(!raf&&!dead){last=performance.now();raf=requestAnimationFrame(tick);} }
  const onRM=()=>{draw();start();}; reduce.addEventListener('change',onRM);
  size(); start();
  return {
    setG(g){o.g=g;draw();}, renderAt(t){fixed=t;draw();}, play(){fixed=null;start();}, redraw:draw, el:cv,
    destroy(){dead=true;cancelAnimationFrame(raf);mo.disconnect();ro.disconnect();mq.removeEventListener('change',onTheme);reduce.removeEventListener('change',onRM);cv.remove();}
  };
}

/* ---------- easter egg overlay ---------- */
const CSS='.hc-egg{position:fixed;inset:0;z-index:50;background:var(--page,#ededed);display:grid;place-items:center;opacity:0;transition:opacity .24s cubic-bezier(.2,.7,.2,1)}'+
'.hc-egg.on{opacity:1}.hc-egg .hc-stage{position:relative;width:min(480px,calc(100vw - 32px),calc(100vh - 32px));aspect-ratio:1;background:var(--page,#ededed)}'+
'.hc-egg .hc-x{position:absolute;top:clamp(16px,3vw,32px);right:clamp(16px,3vw,32px);appearance:none;background:none;border:0;padding:8px;margin:-8px;cursor:pointer;color:var(--ink,#171717);font:var(--t-label,400 14px/1 ui-monospace,Menlo,monospace);letter-spacing:var(--t-label-ls,.04em);text-transform:uppercase}'+
'@media (prefers-reduced-motion:reduce){.hc-egg{transition:none}}';
function egg(opts){
  opts=Object.assign({trigger:'footer.bot > span'},opts||{});
  const trg=typeof opts.trigger==='string'?document.querySelector(opts.trigger):opts.trigger; if(!trg)return null;
  if(!document.getElementById('hc-css')){const s=document.createElement('style');s.id='hc-css';s.textContent=CSS;document.head.appendChild(s);}
  trg.setAttribute('role','button'); trg.tabIndex=0; trg.setAttribute('aria-haspopup','dialog'); trg.style.cursor=opts.cursor||'pointer';
  let ov=null,cube=null,ret=null;
  function open(){ if(ov)return; ret=document.activeElement;
    ov=document.createElement('div'); ov.className='hc-egg'; ov.setAttribute('role','dialog'); ov.setAttribute('aria-modal','true'); ov.setAttribute('aria-label','HANG — a small easter egg');
    ov.innerHTML='<div class="hc-stage"></div><button type="button" class="hc-x" aria-label="Close">Close</button>'; document.body.appendChild(ov);
    cube=mount(ov.querySelector('.hc-stage'),opts);
    ov.addEventListener('click',e=>{ if(!e.target.closest('.hc-stage'))close(); });
    document.addEventListener('keydown',onKey,true); requestAnimationFrame(()=>ov&&ov.classList.add('on')); ov.querySelector('.hc-x').focus({preventScroll:true}); }
  function close(){ if(!ov)return; const o2=ov,c2=cube; ov=cube=null; document.removeEventListener('keydown',onKey,true);
    o2.classList.remove('on'); const fin=()=>{c2.destroy();o2.remove();}; if(reduce.matches)fin(); else setTimeout(fin,260); if(ret&&ret.focus)ret.focus({preventScroll:true}); }
  function onKey(e){ if(e.key==='Escape'){e.preventDefault();close();} else if(e.key==='Tab'){e.preventDefault();ov.querySelector('.hc-x').focus();} }
  trg.addEventListener('click',open); trg.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
  return {open,close,get cube(){return cube;}};
}
const eff=k=>{const v=V1T[k];return typeof v==='number'?v/SPEED:Array.isArray(v)&&typeof v[0]==='number'&&k!=='turnEase'?v.map(x=>x/SPEED):v;};
const TIMING=Object.fromEntries(Object.keys(V1T).map(k=>[k,k==='fps'?1:eff(k)])); TIMING.speed=SPEED; TIMING.base=V1T;
window.HangCube={mount,egg,glyphs:GL,defaults:DEF,timing:TIMING};
})();
