(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const c of s.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&i(c)}).observe(document,{childList:!0,subtree:!0});function a(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(r){if(r.ep)return;r.ep=!0;const s=a(r);fetch(r.href,s)}})();const j="webhooks&print_stats&extruder&heater_bed&display_status&virtual_sdcard";function z(e){const t=String(e??"unknown");return t==="standby"||t==="printing"||t==="paused"||t==="complete"||t==="error"?t:"unknown"}function P(e,t,a){var T;const i={printerId:e.id,name:e.name,url:e.url,online:!1,klippyState:"offline",printState:"unknown",filename:null,progress:0,extruderTemp:0,extruderTarget:0,bedTemp:0,bedTarget:0,error:a};if(a)return i;const r=(T=t.result)==null?void 0:T.status;if(!r)return{...i,error:"Unexpected response from Moonraker"};const s=r.webhooks??{},c=r.print_stats??{},h=r.extruder??{},w=r.heater_bed??{},b=r.display_status??{},S=r.virtual_sdcard??{},m=String(s.state??"unknown"),g=m==="ready"||m==="startup";let f=Number(b.progress??S.progress??0);return f>0&&f<=1&&(f*=100),{...i,online:g,klippyState:m,printState:z(c.state),filename:c.filename?String(c.filename):null,progress:Math.min(100,Math.max(0,f)),extruderTemp:Number(h.temperature??0),extruderTarget:Number(h.target??0),bedTemp:Number(w.temperature??0),bedTarget:Number(w.target??0),error:g?null:String(s.message??"Printer not ready")}}async function K(e){var a;const t=`${e.url}/printer/objects/query?${j}`;try{const i=await fetch(t,{method:"GET",mode:"cors"});if(!i.ok)return P(e,{},`HTTP ${i.status}`);const r=await i.json();return(a=r.error)!=null&&a.message?P(e,r,r.error.message):P(e,r,null)}catch(i){const r=i instanceof Error?i.message:"Network error";return P(e,{},r)}}async function N(e,t){var a;try{const i=await fetch(`${e}${t}`,{method:"POST",mode:"cors"});return i.ok?((a=(await i.json()).error)==null?void 0:a.message)??null:`HTTP ${i.status}`}catch(i){return i instanceof Error?i.message:"Request failed"}}function Y(e){return N(e.url,"/printer/print/pause")}function B(e){return N(e.url,"/printer/print/resume")}function J(e){return N(e.url,"/printer/print/cancel")}const G=[{id:"demo-a",name:"Printer 1",url:"http://demo.local:7125"},{id:"demo-b",name:"Printer 2",url:"http://demo.local:7126"}],M={};function Q(e){return M[e]===void 0&&(M[e]=Math.random()*Math.PI*2),M[e]}function V(){return G.map(e=>({...e}))}function W(e){const t=Date.now()/1e3,a=Q(e.id)+t*.15,i=(Math.sin(a)+1)/2*100,r=i>20&&i<92,s=i>=92&&i<96;let c="standby";r?c=s?"paused":"printing":i>=96&&(c="complete");const h=c==="standby"?null:"demo_calibration_cube.gcode";return{printerId:e.id,name:e.name,url:e.url,online:!0,klippyState:"ready",printState:c,filename:h,progress:c==="standby"?0:i,extruderTemp:210+Math.sin(t*.4)*2,extruderTarget:r||s?210:0,bedTemp:60+Math.cos(t*.3),bedTarget:r||s?60:0,error:null}}async function X(e,t){return await new Promise(a=>setTimeout(a,200)),null}function Z(){return/\/demo\/?$/.test(window.location.pathname)}function ee(){const e=new URL(".",window.location.href);return e.pathname=e.pathname.replace(/\/demo\/?$/,"/"),e.pathname+e.search+e.hash}function te(){const e=new URL(".",window.location.href);e.pathname=e.pathname.replace(/\/demo\/?$/,"/");const t=new URL("demo",e.href);return t.pathname+t.search+t.hash}function re(){const e=ee();e!==window.location.pathname+window.location.search+window.location.hash&&(history.pushState({},"",e),window.dispatchEvent(new Event("print-deck:route")))}function ne(){const e=te();e!==window.location.pathname+window.location.search+window.location.hash&&(history.pushState({},"",e),window.dispatchEvent(new Event("print-deck:route")))}const D="print-deck:v1",I={printers:[]};function ie(){try{const e=localStorage.getItem(D);if(!e)return{...I,printers:[]};const t=JSON.parse(e);return{printers:Array.isArray(t.printers)?t.printers:[]}}catch{return{...I}}}function ae(e){localStorage.setItem(D,JSON.stringify(e))}function H(e){let t=e.trim();if(!t)throw new Error("URL is required");/^https?:\/\//i.test(t)||(t=`http://${t}`);const a=new URL(t);return a.pathname=a.pathname.replace(/\/+$/,""),a.toString().replace(/\/+$/,"")}function oe(e,t){return{id:crypto.randomUUID(),name:e.trim()||se(t),url:H(t)}}function se(e){try{return new URL(e).hostname}catch{return"Printer"}}const de=2e3;function ce(e){var q,A;let t=ie();const a=Z();let i=new Map,r;e.innerHTML=`
    ${a?`
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
        <p class="tagline">${a?"Demo · simulated printers":"Moonraker printers in one place"}</p>
      </div>
      ${a?"":'<a class="link-demo" href="#" id="try-demo">Try demo first</a>'}
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
  `;const s=e.querySelector("#printer-name"),c=e.querySelector("#printer-url"),h=e.querySelector("#add-printer"),w=e.querySelector("#add-hint"),b=e.querySelector("#printer-list"),S=e.querySelector("#list-empty"),m=e.querySelector("#dashboard"),g=e.querySelector("#dash-empty"),f=e.querySelector("#add-panel"),T=e.querySelector("#list-panel");(q=e.querySelector("#switch-live"))==null||q.addEventListener("click",()=>{re()}),(A=e.querySelector("#try-demo"))==null||A.addEventListener("click",o=>{o.preventDefault(),ne()});function E(){return a?V():t.printers}function U(){ae(t)}function x(){if(a){f.hidden=!0,T.hidden=!0;return}if(f.hidden=!1,T.hidden=!1,t.printers.length===0){b.innerHTML="",S.textContent="No printers yet. Add a Moonraker URL above.",S.hidden=!1;return}S.hidden=!0,b.innerHTML=t.printers.map(o=>`
      <li data-id="${o.id}">
        <div class="meta">
          <strong>${p(o.name)}</strong>
          <span>${p(o.url)}</span>
        </div>
        <button type="button" data-action="remove">Remove</button>
      </li>`).join("")}function $(){const o=E();if(o.length===0){m.innerHTML="",g.hidden=!1,g.textContent=a?"Demo printers should appear here.":"No printers yet. Add a Moonraker URL above.";return}g.hidden=!0,m.innerHTML=o.map(d=>{const n=i.get(d.id);return _(d,n)}).join(""),m.querySelectorAll("[data-action]").forEach(d=>{d.addEventListener("click",C)})}function _(o,d){const n=d??O(o),l=!n.online&&!a?"offline":n.printState==="printing"?"printing":n.printState==="paused"?"paused":n.printState==="error"?"error":"",u=n.printState==="printing",y=n.printState==="paused",v=n.printState==="printing"||n.printState==="paused"||n.printState==="complete";return`
    <article class="card ${n.online||a?"":"offline"}" data-id="${o.id}">
      <div class="card-head">
        <h3>${p(n.name)}</h3>
        <span class="badge ${l}">${p(le(n))}</span>
      </div>
      <div class="progress" aria-label="Progress"><span style="width:${n.progress.toFixed(1)}%"></span></div>
      <p class="hint">${n.filename?p(n.filename):"No file"} · ${n.progress.toFixed(0)}%</p>
      <div class="stats">
        <div>Nozzle <strong>${n.extruderTemp.toFixed(1)}°</strong> / ${n.extruderTarget.toFixed(0)}°</div>
        <div>Bed <strong>${n.bedTemp.toFixed(1)}°</strong> / ${n.bedTarget.toFixed(0)}°</div>
        <div>Klipper <strong>${p(n.klippyState)}</strong></div>
        <div>Host <strong>${p(ue(n.url))}</strong></div>
      </div>
      ${n.error?`<p class="hint" style="color:var(--bad)">${p(n.error)}</p>`:""}
      <div class="card-actions">
        <button type="button" data-action="pause" data-id="${o.id}" ${u?"":"disabled"}>Pause</button>
        <button type="button" data-action="resume" data-id="${o.id}" ${y?"":"disabled"}>Resume</button>
        <button type="button" class="danger" data-action="cancel" data-id="${o.id}" ${v?"":"disabled"}>Cancel</button>
      </div>
    </article>`}function O(o){return{printerId:o.id,name:o.name,url:o.url,online:!1,klippyState:"…",printState:"unknown",filename:null,progress:0,extruderTemp:0,extruderTarget:0,bedTemp:0,bedTarget:0,error:null}}async function L(){const o=E();await Promise.all(o.map(async d=>{const n=a?W(d):await K(d);i.set(d.id,n)})),$()}function F(){r!==void 0&&window.clearInterval(r),L(),r=window.setInterval(()=>void L(),de)}h.addEventListener("click",()=>{w.textContent="";try{const o=H(c.value),d=oe(s.value,o);t.printers.push(d),U(),s.value="",c.value="",x(),$(),L()}catch(o){w.textContent=o instanceof Error?o.message:"Invalid URL"}}),b.addEventListener("click",o=>{const d=o.target;if(d.dataset.action!=="remove")return;const n=d.closest("li"),l=n==null?void 0:n.getAttribute("data-id");l&&(t.printers=t.printers.filter(u=>u.id!==l),i.delete(l),U(),x(),$())});async function C(o){const d=o.currentTarget,n=d.dataset.action,l=d.dataset.id;if(!l||!n)return;const u=E().find(v=>v.id===l);if(!u)return;d.disabled=!0;let y;if(a?y=await X():y=n==="pause"?await Y(u):n==="resume"?await B(u):await J(u),y){const v=i.get(l);v&&i.set(l,{...v,error:y}),$()}else await L()}return x(),$(),F(),()=>{r!==void 0&&window.clearInterval(r)}}function le(e){return!e.online&&e.klippyState==="offline"?"offline":e.printState}function ue(e){try{return new URL(e).host}catch{return e}}function p(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function pe(){const e=document.querySelector("#app");if(!(e instanceof HTMLElement))throw new Error("#app not found");return e}let k;function R(){k==null||k(),k=ce(pe())}R();window.addEventListener("print-deck:route",R);window.addEventListener("popstate",R);
