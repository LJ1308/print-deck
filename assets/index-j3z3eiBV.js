(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const c of s.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&a(c)}).observe(document,{childList:!0,subtree:!0});function i(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(n){if(n.ep)return;n.ep=!0;const s=i(n);fetch(n.href,s)}})();const j="webhooks&print_stats&extruder&heater_bed&display_status&virtual_sdcard";function z(e){const t=String(e??"unknown");return t==="standby"||t==="printing"||t==="paused"||t==="complete"||t==="error"?t:"unknown"}function k(e,t,i){var T;const a={printerId:e.id,name:e.name,url:e.url,online:!1,klippyState:"offline",printState:"unknown",filename:null,progress:0,extruderTemp:0,extruderTarget:0,bedTemp:0,bedTarget:0,error:i};if(i)return a;const n=(T=t.result)==null?void 0:T.status;if(!n)return{...a,error:"Unexpected response from Moonraker"};const s=n.webhooks??{},c=n.print_stats??{},h=n.extruder??{},w=n.heater_bed??{},b=n.display_status??{},S=n.virtual_sdcard??{},m=String(s.state??"unknown"),g=m==="ready"||m==="startup";let f=Number(b.progress??S.progress??0);return f>0&&f<=1&&(f*=100),{...a,online:g,klippyState:m,printState:z(c.state),filename:c.filename?String(c.filename):null,progress:Math.min(100,Math.max(0,f)),extruderTemp:Number(h.temperature??0),extruderTarget:Number(h.target??0),bedTemp:Number(w.temperature??0),bedTarget:Number(w.target??0),error:g?null:String(s.message??"Printer not ready")}}async function B(e){var i;const t=`${e.url}/printer/objects/query?${j}`;try{const a=await fetch(t,{method:"GET",mode:"cors"});if(!a.ok)return k(e,{},`HTTP ${a.status}`);const n=await a.json();return(i=n.error)!=null&&i.message?k(e,n,n.error.message):k(e,n,null)}catch(a){const n=a instanceof Error?a.message:"Network error";return k(e,{},n)}}async function R(e,t){var i;try{const a=await fetch(`${e}${t}`,{method:"POST",mode:"cors"});return a.ok?((i=(await a.json()).error)==null?void 0:i.message)??null:`HTTP ${a.status}`}catch(a){return a instanceof Error?a.message:"Request failed"}}function K(e){return R(e.url,"/printer/print/pause")}function Y(e){return R(e.url,"/printer/print/resume")}function J(e){return R(e.url,"/printer/print/cancel")}const G=[{id:"demo-a",name:"Benchy Bot",url:"http://demo.local:7125"},{id:"demo-b",name:"Spool Room",url:"http://demo.local:7126"}],M={};function Q(e){return M[e]===void 0&&(M[e]=Math.random()*Math.PI*2),M[e]}function V(){return G.map(e=>({...e}))}function W(e){const t=Date.now()/1e3,i=Q(e.id)+t*.15,a=(Math.sin(i)+1)/2*100,n=a>20&&a<92,s=a>=92&&a<96;let c="standby";n?c=s?"paused":"printing":a>=96&&(c="complete");const h=c==="standby"?null:"demo_calibration_cube.gcode";return{printerId:e.id,name:e.name,url:e.url,online:!0,klippyState:"ready",printState:c,filename:h,progress:c==="standby"?0:a,extruderTemp:210+Math.sin(t*.4)*2,extruderTarget:n||s?210:0,bedTemp:60+Math.cos(t*.3),bedTarget:n||s?60:0,error:null}}async function X(e,t){return await new Promise(i=>setTimeout(i,200)),null}function Z(){return/\/demo\/?$/.test(window.location.pathname)}function ee(){const e=new URL(".",window.location.href);return e.pathname=e.pathname.replace(/\/demo\/?$/,"/"),e.pathname+e.search+e.hash}function te(){const e=new URL(".",window.location.href);e.pathname=e.pathname.replace(/\/demo\/?$/,"/");const t=new URL("demo",e.href);return t.pathname+t.search+t.hash}function ne(){const e=ee();e!==window.location.pathname+window.location.search+window.location.hash&&(history.pushState({},"",e),window.dispatchEvent(new Event("print-deck:route")))}function re(){const e=te();e!==window.location.pathname+window.location.search+window.location.hash&&(history.pushState({},"",e),window.dispatchEvent(new Event("print-deck:route")))}const D="print-deck:v1",I={printers:[]};function ae(){try{const e=localStorage.getItem(D);if(!e)return{...I,printers:[]};const t=JSON.parse(e);return{printers:Array.isArray(t.printers)?t.printers:[]}}catch{return{...I}}}function ie(e){localStorage.setItem(D,JSON.stringify(e))}function H(e){let t=e.trim();if(!t)throw new Error("URL is required");/^https?:\/\//i.test(t)||(t=`http://${t}`);const i=new URL(t);return i.pathname=i.pathname.replace(/\/+$/,""),i.toString().replace(/\/+$/,"")}function oe(e,t){return{id:crypto.randomUUID(),name:e.trim()||se(t),url:H(t)}}function se(e){try{return new URL(e).hostname}catch{return"Printer"}}const de=2e3;function ce(e){var q,A;let t=ae();const i=Z();let a=new Map,n;e.innerHTML=`
    ${i?`
    <div class="demo-banner" role="status">
      <div>
        <strong>You’re on the demo dashboard</strong>
        <p>Sample printers and fake print data only — nothing here talks to your network. Connect your real Moonraker hosts when you’re ready.</p>
      </div>
      <button type="button" class="primary switch-live" id="switch-live">Use my real printers →</button>
    </div>`:""}

    <header>
      <div>
        <h1>Print Deck</h1>
        <p class="tagline">${i?"Demo · simulated printers":"Moonraker printers in one place"}</p>
      </div>
      ${i?"":'<a class="link-demo" href="#" id="try-demo">Try demo first</a>'}
    </header>

    <section class="panel" id="add-panel">
      <h2>Add printer</h2>
      <div class="row">
        <input type="text" id="printer-name" placeholder="Name (optional)" autocomplete="off" />
        <input type="url" id="printer-url" placeholder="http://192.168.0.10:7125" autocomplete="off" />
        <button type="button" class="primary" id="add-printer">Add</button>
      </div>
      <p class="hint" id="add-hint"></p>
    </section>

    <section class="panel" id="list-panel">
      <h2>Saved printers</h2>
      <ul class="printer-list" id="printer-list"></ul>
      <p class="hint empty" id="list-empty">No printers yet. Add a Moonraker URL above.</p>
    </section>

    <section>
      <h2 style="margin:0 0 0.75rem;font-size:0.95rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.06em;">Dashboard</h2>
      <div class="grid" id="dashboard"></div>
      <p class="hint empty" id="dash-empty" hidden>No printers to show.</p>
    </section>
  `;const s=e.querySelector("#printer-name"),c=e.querySelector("#printer-url"),h=e.querySelector("#add-printer"),w=e.querySelector("#add-hint"),b=e.querySelector("#printer-list"),S=e.querySelector("#list-empty"),m=e.querySelector("#dashboard"),g=e.querySelector("#dash-empty"),f=e.querySelector("#add-panel"),T=e.querySelector("#list-panel");(q=e.querySelector("#switch-live"))==null||q.addEventListener("click",()=>{ne()}),(A=e.querySelector("#try-demo"))==null||A.addEventListener("click",o=>{o.preventDefault(),re()});function E(){return i?V():t.printers}function U(){ie(t)}function x(){if(i){f.hidden=!0,T.hidden=!0;return}if(f.hidden=!1,T.hidden=!1,t.printers.length===0){b.innerHTML="",S.textContent="No printers yet. Add a Moonraker URL above.",S.hidden=!1;return}S.hidden=!0,b.innerHTML=t.printers.map(o=>`
      <li data-id="${o.id}">
        <div class="meta">
          <strong>${p(o.name)}</strong>
          <span>${p(o.url)}</span>
        </div>
        <button type="button" data-action="remove">Remove</button>
      </li>`).join("")}function $(){const o=E();if(o.length===0){m.innerHTML="",g.hidden=!1,g.textContent=i?"Demo printers should appear here.":"No printers yet. Add a Moonraker URL above.";return}g.hidden=!0,m.innerHTML=o.map(d=>{const r=a.get(d.id);return _(d,r)}).join(""),m.querySelectorAll("[data-action]").forEach(d=>{d.addEventListener("click",C)})}function _(o,d){const r=d??O(o),l=!r.online&&!i?"offline":r.printState==="printing"?"printing":r.printState==="paused"?"paused":r.printState==="error"?"error":"",u=r.printState==="printing",y=r.printState==="paused",v=r.printState==="printing"||r.printState==="paused"||r.printState==="complete";return`
    <article class="card ${r.online||i?"":"offline"}" data-id="${o.id}">
      <div class="card-head">
        <h3>${p(r.name)}</h3>
        <span class="badge ${l}">${p(le(r))}</span>
      </div>
      <div class="progress" aria-label="Progress"><span style="width:${r.progress.toFixed(1)}%"></span></div>
      <p class="hint">${r.filename?p(r.filename):"No file"} · ${r.progress.toFixed(0)}%</p>
      <div class="stats">
        <div>Nozzle <strong>${r.extruderTemp.toFixed(1)}°</strong> / ${r.extruderTarget.toFixed(0)}°</div>
        <div>Bed <strong>${r.bedTemp.toFixed(1)}°</strong> / ${r.bedTarget.toFixed(0)}°</div>
        <div>Klipper <strong>${p(r.klippyState)}</strong></div>
        <div>Host <strong>${p(ue(r.url))}</strong></div>
      </div>
      ${r.error?`<p class="hint" style="color:var(--bad)">${p(r.error)}</p>`:""}
      <div class="card-actions">
        <button type="button" data-action="pause" data-id="${o.id}" ${u?"":"disabled"}>Pause</button>
        <button type="button" data-action="resume" data-id="${o.id}" ${y?"":"disabled"}>Resume</button>
        <button type="button" class="danger" data-action="cancel" data-id="${o.id}" ${v?"":"disabled"}>Cancel</button>
      </div>
    </article>`}function O(o){return{printerId:o.id,name:o.name,url:o.url,online:!1,klippyState:"…",printState:"unknown",filename:null,progress:0,extruderTemp:0,extruderTarget:0,bedTemp:0,bedTarget:0,error:null}}async function L(){const o=E();await Promise.all(o.map(async d=>{const r=i?W(d):await B(d);a.set(d.id,r)})),$()}function F(){n!==void 0&&window.clearInterval(n),L(),n=window.setInterval(()=>void L(),de)}h.addEventListener("click",()=>{w.textContent="";try{const o=H(c.value),d=oe(s.value,o);t.printers.push(d),U(),s.value="",c.value="",x(),$(),L()}catch(o){w.textContent=o instanceof Error?o.message:"Invalid URL"}}),b.addEventListener("click",o=>{const d=o.target;if(d.dataset.action!=="remove")return;const r=d.closest("li"),l=r==null?void 0:r.getAttribute("data-id");l&&(t.printers=t.printers.filter(u=>u.id!==l),a.delete(l),U(),x(),$())});async function C(o){const d=o.currentTarget,r=d.dataset.action,l=d.dataset.id;if(!l||!r)return;const u=E().find(v=>v.id===l);if(!u)return;d.disabled=!0;let y;if(i?y=await X():y=r==="pause"?await K(u):r==="resume"?await Y(u):await J(u),y){const v=a.get(l);v&&a.set(l,{...v,error:y}),$()}else await L()}return x(),$(),F(),()=>{n!==void 0&&window.clearInterval(n)}}function le(e){return!e.online&&e.klippyState==="offline"?"offline":e.printState}function ue(e){try{return new URL(e).host}catch{return e}}function p(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function pe(){const e=document.querySelector("#app");if(!(e instanceof HTMLElement))throw new Error("#app not found");return e}let P;function N(){P==null||P(),P=ce(pe())}N();window.addEventListener("print-deck:route",N);window.addEventListener("popstate",N);
