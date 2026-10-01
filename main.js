const url = 'https://pchvpdwcmsgyhrzvvfob.supabase.co';
const key = 'sb_publishable_vA1ZWi_Qf7MqPBJPGol5cQ_VD0oBtR0';
let sb = null;
const app=document.querySelector('#app');

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>n==null?'Contact for price':`₦${Number(n).toLocaleString('en-NG')}`;
let products=[], projects=[], settings={business_name:'HM',phone:'08039929548',phone_2:'08036196720',email:'ademichaelus@gmail.com',address:'54, Shasha Road, Akowonjo, Lagos'};

async function load(){
  // Always render the public website first. Supabase is optional and loads in the background.
  render();
  try {
    const mod = await import('https://esm.sh/@supabase/supabase-js@2');
    sb = mod.createClient(url, key);
    const [p,x,s] = await Promise.all([
      sb.from('products').select('*').eq('status','active').order('created_at',{ascending:false}),
      sb.from('projects').select('*').order('created_at',{ascending:false}),
      sb.from('business_settings').select('*').limit(1).maybeSingle()
    ]);
    if(p.data) products=p.data;
    if(x.data) projects=x.data;
    if(s.data) settings={...settings,...s.data};
    render();
  } catch(err) {
    console.warn('Supabase is unavailable; public HM site remains active.', err);
  }
}

function render(){
 app.innerHTML=`<header><div class="brand"><b>HM</b><span>Construction • Furniture • Cars • Imports</span></div>
 <button class="outline" id="adminBtn">Owner Portal</button></header>
 <main><section class="hero"><div><p class="eyebrow">BUILD • FURNISH • SOURCE</p><h1>Professional work. One trusted business.</h1>
 <p>Building projects, custom furniture, imported vehicles, imported goods and contract services.</p><p class="status" id="dataStatus">HM website is ready.</p>
 <a class="btn" href="#quote">Request a Quote</a></div><div class="heroCard"><b>Talk to HM</b><strong>${esc(settings.phone)}</strong><strong>${esc(settings.phone_2||'')}</strong><a href="https://wa.me/2348036196720" target="_blank">WhatsApp</a></div></section>
 <section><h2>What we do</h2><div class="grid services">
 ${['Building & Construction','Furniture Design & Production','Imported Cars','Imported Goods & Sourcing','Property & Contract Projects','Custom Projects'].map(x=>`<article><h3>${x}</h3><p>Professional sourcing, planning and delivery tailored to the client’s project.</p></article>`).join('')}</div></section>
 <section><h2>Catalogue</h2><div class="grid cards">${products.length?products.map(card).join(''):'<p>No catalogue items yet. The owner can add them from the portal.</p>'}</div></section>
 <section><h2>Projects</h2><div class="grid cards">${projects.length?projects.map(x=>`<article><small>${esc(x.stage||'Project')}</small><h3>${esc(x.project_name)}</h3><p>Client: ${esc(x.client_name||'Private client')}</p><p>${esc(x.budget||'Budget on request')}</p></article>`).join(''):'<p>Projects will appear here as the owner adds them.</p>'}</div></section>
 <section id="quote" class="quote"><h2>Request a Quote</h2><form id="quoteForm"><input name="customer_name" placeholder="Your name" required><input name="phone" placeholder="Phone / WhatsApp" required><input name="email" type="email" placeholder="Email"><select name="service" required><option value="">Choose service</option><option>Building & Construction</option><option>Furniture</option><option>Imported Cars</option><option>Imported Goods</option><option>Property / Contract Project</option><option>Custom Project</option></select><input name="location" placeholder="Project / delivery location"><input name="budget" placeholder="Estimated budget"><textarea name="description" placeholder="Tell us what you need" required></textarea><button class="btn">Send Request</button></form><p id="quoteMsg"></p></section></main>
 <footer><b>${esc(settings.business_name)}</b><span>${esc(settings.address)}</span><span>${esc(settings.email)}</span><span>${esc(settings.phone)}</span><span>${esc(settings.phone_2||'')}</span></footer>`;
 document.querySelector('#adminBtn').onclick=adminLogin;
 document.querySelector('#quoteForm').onsubmit=submitQuote;
}
function card(x){return `<article class="product">${x.image_url?`<img src="${esc(x.image_url)}" alt="">`:''}<small>${esc(x.category)}</small><h3>${esc(x.name)}</h3><p>${esc(x.description||'')}</p><strong>${x.price_label||money(x.price)}</strong></article>`}

async function submitQuote(e){
 e.preventDefault(); const f=new FormData(e.target), row=Object.fromEntries(f);
 if(sb){const {error}=await sb.from('quote_requests').insert(row); if(error){document.querySelector('#quoteMsg').textContent=error.message;return}}
 else localStorage.setItem('demo_quote',JSON.stringify(row));
 e.target.reset();document.querySelector('#quoteMsg').textContent='Request received. HM will contact you.';
}
async function adminLogin(){
 if(!sb){alert('Connect Supabase first. The demo portal can be added later.');return}
 const email=prompt('Owner email'); if(!email)return;
 const password=prompt('Owner password'); if(!password)return;
 const {error}=await sb.auth.signInWithPassword({email,password});
 if(error){alert(error.message);return}
 admin();
}
async function admin(){
 const {data:{user}}=await sb.auth.getUser();
 const {data:profile}=await sb.from('profiles').select('role').eq('id',user.id).single();
 if(profile?.role!=='admin'){await sb.auth.signOut();alert('This account is not an admin.');return}
 const q=await sb.from('quote_requests').select('*').order('created_at',{ascending:false});
 app.innerHTML=`<header><div class="brand"><b>HM — OWNER</b><span>Secure dashboard</span></div><button class="outline" id="logout">Sign out</button></header>
 <main><section><h1>Owner Portal</h1><div class="stats"><div><b>${products.length}</b><span>Catalogue items</span></div><div><b>${projects.length}</b><span>Projects</span></div><div><b>${q.data?.length||0}</b><span>Quote requests</span></div></div></section>
 <section><h2>Add Catalogue Item</h2><form id="addProduct"><input name="name" placeholder="Product/service name" required><input name="category" placeholder="Category" required><input name="price" type="number" placeholder="Price"><input name="price_label" placeholder="Price label (optional)"><input name="image_url" placeholder="Image URL (optional)"><textarea name="description" placeholder="Description"></textarea><button class="btn">Add item</button></form></section>
 <section><h2>Recent Quote Requests</h2>${(q.data||[]).map(x=>`<article class="adminRow"><b>${esc(x.customer_name)}</b><span>${esc(x.phone)}</span><span>${esc(x.service)}</span><p>${esc(x.description)}</p></article>`).join('')||'<p>No requests yet.</p>'}</section>
 <section><button class="outline" id="back">Back to website</button></section></main>`;
 document.querySelector('#logout').onclick=async()=>{await sb.auth.signOut();render()};
 document.querySelector('#back').onclick=render;
 document.querySelector('#addProduct').onsubmit=async e=>{e.preventDefault();let r=Object.fromEntries(new FormData(e.target));r.price=r.price?Number(r.price):null;const {error}=await sb.from('products').insert(r);if(error)alert(error.message);else admin()};
}
function renderDemo(){
 products=[{name:'Custom Wardrobe',category:'Furniture',description:'Built to specification.',price_label:'Price on request'},
 {name:'Building Project',category:'Construction',description:'Residential and commercial construction.',price_label:'Quote required'}];render();
}
load();