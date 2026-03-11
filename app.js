
const KECAMATAN = {
  Barat:['Benowo','Dukuh Pakis','Karang Pilang','Karangpilang','Lakarsantri','Pakal','Sambikerep','Sukomanunggal','Tandes','Wiyung'],
  Pusat:['Genteng','Gubeng','Simokerto','Tambaksari','Tegalsari'],
  Selatan:['Gayungan','Jambangan','Kepuhkiriman','Sawahan','Tambakcemandi','Wonokromo'],
  Timur:['Gunung Anyar','Mulyorejo','Rungkut','Sukolilo','Tenggilis Mejoyo'],
  Utara:['Bulak','Kenjeran','Krembangan','Semampir']
};

let worthF = '', allHouses = [];
let HOUSES = [];

/* ── NAV ── */
function go(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('on'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('pg-'+id).classList.add('on');
  event && event.currentTarget && event.currentTarget.classList.add('active');
  // manually set active
  document.querySelectorAll('.nav-btn').forEach(b=>{
    if((id==='home'&&b.textContent==='Beranda')||(b.textContent.toLowerCase().includes(id)))b.classList.add('active');
  });
  if(id==='home')renderStats();
  if(id==='find')filter();
  window.scrollTo(0,0);
}

/* ── STATS ── */
function renderStats(){
  const w=allHouses.filter(h=>h.worthIt==='Worth-It').length;
  document.getElementById('st-worth').textContent=w;
  document.getElementById('st-not').textContent=allHouses.length-w;
}

/* ── KECAMATAN ── */
function fillKec(targetId,srcId){
  const w=document.getElementById(srcId).value;
  const s=document.getElementById(targetId);
  s.innerHTML='<option value="">Pilih Kecamatan</option>';
  (KECAMATAN[w]||[]).forEach(k=>{const o=document.createElement('option');o.textContent=k;s.appendChild(o);});
}

/* ── FORMAT ── */
function fmtHarga(juta){
  if(juta>=1000) return 'Rp '+(juta/1000).toFixed(juta%1000===0?0:1)+' M';
  return 'Rp '+Math.round(juta).toLocaleString('id-ID')+' Jt';
}

/* ── CARD ── */
function cardHTML(h){
  const isW=h.worthIt==='Worth-It';
  const pct=Math.round(h.confidence*100);
  return `<div class="hcard" onclick="openModal(${h.id})">
    <div class="hcard-top">
      <div><div class="hcard-price">${fmtHarga(h.harga)}</div></div>
      <span class="badge ${isW?'w':'n'}">${isW?'✅ Worth It':'❌ Not Worth It'}</span>
    </div>
    <div class="hcard-loc"><strong>${h.kecamatan||'-'}</strong>, ${h.wilayah} Surabaya</div>
    <div class="hcard-div"></div>
    <div class="hcard-specs">
      <div><div class="sv">${h.tanah||'-'}</div><div class="sk">m² Tanah</div></div>
      <div><div class="sv">${h.kamar||'-'}</div><div class="sk">Kamar</div></div>
      <div><div class="sv">${h.lantai||'-'}</div><div class="sk">Lantai</div></div>
    </div>
    <div class="hcard-conf">
      <div class="conf-row"><span>Keyakinan Responden</span><span>${pct}%</span></div>
      <div class="conf-track"><div class="conf-bar ${isW?'w':'n'}" style="width:${pct}%"></div></div>
    </div>
    <div class="hcard-tags">
      ${h.posisi&&h.posisi!=='-'?`<span class="tag">${h.posisi}</span>`:''}
      ${h.arah&&h.arah!=='-'?`<span class="tag">↗ ${h.arah}</span>`:''}
      ${h.terjual?`<span class="tag">${h.terjual}</span>`:''}
    </div>
  </div>`;
}

/* ── FILTER ── */
function setWorth(val,el){
  worthF=val;
  document.querySelectorAll('#worth-chips .chip').forEach(c=>c.classList.remove('on'));
  el.classList.add('on');
  filter();
}
function filter(){
  const budget=parseFloat(document.getElementById('f-budget').value)||Infinity;
  const wil=document.getElementById('f-wil').value;
  const minK=parseInt(document.getElementById('f-kamar').value)||0;
  const terjual=document.getElementById('f-terjual').value;
  const res=allHouses.filter(h=>{
    if(h.harga>budget)return false;
    if(wil&&h.wilayah!==wil)return false;
    if(h.kamar<minK)return false;
    if(terjual&&h.terjual!==terjual)return false;
    if(worthF&&h.worthIt!==worthF)return false;
    return true;
  });
  document.getElementById('res-count').textContent=res.length;
  const grid=document.getElementById('house-grid');
  const empty=document.getElementById('empty');
  if(res.length===0){grid.innerHTML='';empty.style.display='block';}
  else{empty.style.display='none';grid.innerHTML=res.map(cardHTML).join('');}
}

/* ── MODAL ── */
function openModal(id){
  const h=allHouses.find(x=>x.id===id);
  if(!h)return;
  const isW=h.worthIt==='Worth-It';
  const wPct=Math.round(h.votesWorth*10);
  const nPct=Math.round(h.votesNot*10);
  document.getElementById('modal-body').innerHTML=`
    <div class="modal-badge"><span class="badge ${isW?'w':'n'}">${isW?'✅ Worth It':'❌ Not Worth It'}</span></div>
    <div class="modal-price">${fmtHarga(h.harga)}</div>
    <div class="modal-loc">📍 ${h.kecamatan}, ${h.wilayah} Surabaya</div>
    <div class="modal-sec">Spesifikasi</div>
    <div class="modal-grid">
      <div class="modal-item"><div class="mv">${h.tanah}</div><div class="mk">m² Tanah</div></div>
      <div class="modal-item"><div class="mv">${h.bangunan}</div><div class="mk">m² Bangunan</div></div>
      <div class="modal-item"><div class="mv">${h.kamar}</div><div class="mk">Kamar Tidur</div></div>
      <div class="modal-item"><div class="mv">${h.kamarMandi}</div><div class="mk">Kamar Mandi</div></div>
      <div class="modal-item"><div class="mv">${h.lantai}</div><div class="mk">Lantai</div></div>
      <div class="modal-item"><div class="mv">${h.watt||'-'}</div><div class="mk">Watt Listrik</div></div>
    </div>
    <div class="modal-sec">Detail</div>
    <div class="modal-grid">
      <div class="modal-item"><div class="mv" style="font-size:13px">${h.arah||'-'}</div><div class="mk">Arah Hadap</div></div>
      <div class="modal-item"><div class="mv" style="font-size:13px">${h.posisi||'-'}</div><div class="mk">Posisi</div></div>
      <div class="modal-item"><div class="mv">${h.row_jalan||'-'}</div><div class="mk">ROW Jalan</div></div>
    </div>
    <div class="modal-sec">Hasil Voting 10 Responden</div>
    <div class="modal-vote-row">
      <div class="modal-vote-label">Worth It</div>
      <div class="modal-vote-track"><div class="modal-vote-fill w" style="width:${wPct}%"></div></div>
      <div class="modal-vote-pct">${h.votesWorth}/10</div>
    </div>
    <div class="modal-vote-row">
      <div class="modal-vote-label">Not Worth It</div>
      <div class="modal-vote-track"><div class="modal-vote-fill n" style="width:${nPct}%"></div></div>
      <div class="modal-vote-pct">${h.votesNot}/10</div>
    </div>
    ${h.url?`<a class="modal-link" href="${h.url}" target="_blank">🔗 Lihat Listing Asli</a>`:''}
  `;
  document.getElementById('modal-bg').classList.add('on');
}
function closeModal(e){
  if(!e||e.target===document.getElementById('modal-bg'))
    document.getElementById('modal-bg').classList.remove('on');
}

/* ── ADD HOUSE ── */
async function addHouse(){
  const ids=['a-wil','a-kec','a-tanah','a-ban','a-kamar','a-km','a-lantai','a-harga','a-arah','a-posisi'];
  const vals=ids.map(i=>document.getElementById(i).value);
  if(vals.some(v=>!v)){alert('Harap isi semua field.');return;}
  const [wil,kec,tanah,ban,kamar,km,lantai,harga,arah,posisi]=vals;
  const row=document.getElementById('a-row').value||'-';
  const btn=document.getElementById('add-btn');
  btn.disabled=true;btn.textContent='⏳ AI sedang menganalisis...';
  const prompt=`Kamu adalah classifier harga rumah Surabaya. Klasifikasi apakah rumah ini "Worth It" atau "Not Worth It".\nData: Wilayah=${wil}, Kecamatan=${kec}, Tanah=${tanah}m2, Bangunan=${ban}m2, Kamar=${kamar}, KM=${km}, Lantai=${lantai}, Harga=${harga}jt, Arah=${arah}, Posisi=${posisi}, ROW=${row}m\nBalas HANYA JSON: {"prediction":"Worth It" atau "Not Worth It","confidence":0.XX}`;
  try{
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:100,messages:[{role:'user',content:prompt}]})});
    const d=await r.json();
    const p=JSON.parse(d.content[0].text.replace(/```json|```/g,'').trim());
    const h={id:Date.now(),wilayah:wil,kecamatan:kec,tanah:parseFloat(tanah),bangunan:parseFloat(ban),kamar:parseInt(kamar),kamarMandi:parseInt(km),lantai:parseFloat(lantai),harga:parseFloat(harga),hargaFormatted:'Rp'+parseFloat(harga)*1e6,terjual:'Belum',arah,posisi,row_jalan:row,watt:'-',worthIt:p.prediction==='Worth It'?'Worth-It':'Not Worth-It',votesWorth:0,votesNot:0,confidence:p.confidence,url:''};
    allHouses.unshift(h);
    const toast=document.getElementById('add-toast');
    toast.classList.add('on');setTimeout(()=>toast.classList.remove('on'),4000);
    ids.forEach(i=>document.getElementById(i).value='');
    document.getElementById('a-kec').innerHTML='<option value="">Pilih Wilayah dulu</option>';
    document.getElementById('a-row').value='';
  }catch(e){alert('Gagal menghubungi AI. Coba lagi.');}
  btn.disabled=false;btn.textContent='🏠 Tambah & Klasifikasi dengan AI';
}

/* ── CHECK ── */
async function doCheck(){
  const ids=['c-wil','c-kec','c-tanah','c-ban','c-kamar','c-km','c-lantai','c-harga','c-arah','c-posisi'];
  const vals=ids.map(i=>document.getElementById(i).value);
  if(vals.some(v=>!v)){alert('Harap isi semua field.');return;}
  const [wil,kec,tanah,ban,kamar,km,lantai,harga,arah,posisi]=vals;
  const row=document.getElementById('c-row').value||'-';
  const btn=document.getElementById('chk-btn');
  btn.disabled=true;btn.textContent='⏳ Menganalisis...';
  document.getElementById('res-idle').style.display='none';
  document.getElementById('res-verdict').style.display='none';
  document.getElementById('res-loading').style.display='block';
  const prompt=`Kamu adalah classifier harga rumah Surabaya. Analisis apakah rumah ini "Worth It" atau "Not Worth It".\nData: Wilayah=${wil}, Kecamatan=${kec}, Tanah=${tanah}m2, Bangunan=${ban}m2, Kamar=${kamar}, KM=${km}, Lantai=${lantai}, Harga=${harga}jt, Arah=${arah}, Posisi=${posisi}, ROW=${row}m\nBalas HANYA JSON: {"prediction":"Worth It" atau "Not Worth It","confidence":0.XX,"worth_prob":0.XX,"not_worth_prob":0.XX}\nPastikan worth_prob+not_worth_prob=1.0`;
  try{
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:150,messages:[{role:'user',content:prompt}]})});
    const d=await r.json();
    const p=JSON.parse(d.content[0].text.replace(/```json|```/g,'').trim());
    const isW=p.prediction==='Worth It';
    document.getElementById('v-icon').textContent=isW?'✅':'❌';
    document.getElementById('v-txt').textContent=p.prediction;
    document.getElementById('v-txt').className='verdict-txt '+(isW?'w':'n');
    document.getElementById('v-conf').textContent='Confidence: '+Math.round(p.confidence*100)+'%';
    document.getElementById('pb-w').style.width=Math.round(p.worth_prob*100)+'%';
    document.getElementById('pp-w').textContent=Math.round(p.worth_prob*100)+'%';
    document.getElementById('pb-n').style.width=Math.round(p.not_worth_prob*100)+'%';
    document.getElementById('pp-n').textContent=Math.round(p.not_worth_prob*100)+'%';
    document.getElementById('res-loading').style.display='none';
    document.getElementById('res-verdict').style.display='block';
  }catch(e){
    alert('Gagal menghubungi AI. Coba lagi.');
    document.getElementById('res-loading').style.display='none';
    document.getElementById('res-idle').style.display='block';
  }
  btn.disabled=false;btn.textContent='⚡ Analisis dengan AI Sekarang';
}

// INIT
function initData() {
  try {
    const results = window.SURVEY_DATA || [];
    const data = results.filter(row => row['URL'] && row['URL'].trim() !== '');
      HOUSES = data.map((row, index) => {
        let rawHarga = row['Harga Jual'] || '0';
        rawHarga = rawHarga.replace(/Rp|\s|,|\./g, '');
        let hargaJuta = parseInt(rawHarga, 10) / 1000000;
        
        let votesW = parseInt(row['Votes_WorthIt'] || '0', 10);
        let votesN = parseInt(row['Votes_NotWorthIt'] || '0', 10);
        let conf = votesW + votesN > 0 ? votesW / (votesW + votesN) : 0;
        
        return {
          id: index + 1,
          url: row['URL'],
          wilayah: row['Wilayah'],
          kecamatan: row['Kecamatan'],
          tanah: parseFloat(row['Luas Tanah (m2)'] || 0),
          bangunan: parseFloat(row['Luas Bangunan (m2)'] || 0),
          kamar: parseInt(row['Jumlah Kamar'] || 0, 10),
          kamarMandi: parseInt(row['Jumlah Kamar Mandi'] || 0, 10),
          lantai: parseFloat(row['Tingkat/Lantai'] || 1),
          harga: hargaJuta,
          hargaFormatted: row['Harga Jual'],
          terjual: row['Terjual/Belum'],
          arah: row['Arah Hadap Rumah'],
          posisi: row['Posisi Rumah'],
          row_jalan: row['Lebar Jalan Depan Rumah (ROW)'],
          watt: row['Watt Listrik'],
          worthIt: row['Worth-it'] === 'Worth-It' ? 'Worth-It' : 'Not Worth-It',
          votesWorth: votesW,
          votesNot: votesN,
          confidence: conf
        };
      });
      allHouses = [...HOUSES];
      renderStats();
      filter();
  } catch (err) {
    console.error("Failed to load JSON:", err);
  }
}

initData();
