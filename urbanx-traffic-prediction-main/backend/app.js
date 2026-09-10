                            // app.js
document.addEventListener('DOMContentLoaded', () => {
  const pages = {
    home: document.getElementById('home'),
    dashboard: document.getElementById('dashboard'),
    alerts: document.getElementById('alerts')
  };

  const btnHome = document.getElementById('btn-home');
  const btnDashboard = document.getElementById('btn-dashboard');
  const btnAlerts = document.getElementById('btn-alerts');

  function show(pageName){
    Object.values(pages).forEach(p => p.classList.remove('page-visible'));
    pages[pageName].classList.add('page-visible');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if(pageName === 'home') btnHome.classList.add('active');
    if(pageName === 'dashboard') btnDashboard.classList.add('active');
    if(pageName === 'alerts') btnAlerts.classList.add('active');
  }

  btnHome.addEventListener('click', ()=> show('home'));
  btnDashboard.addEventListener('click', ()=> { show('dashboard'); fetchPrediction(); });
  btnAlerts.addEventListener('click', ()=> { show('alerts'); fetchAlerts(); });

  document.getElementById('view-dashboard').addEventListener('click', ()=> { show('dashboard'); fetchPrediction(); });
  document.getElementById('predict-now').addEventListener('click', fetchPrediction);

  document.getElementById('year').textContent = new Date().getFullYear();

  // initial
  show('home');

  // Fetch prediction data (from backend API)
  async function fetchPrediction(){
    setMeterLoading(true);
    try{
      // replace with real endpoint: /api/prediction
      const res = await fetch('/api/prediction'); 
      const json = await res.json();
      populateDashboard(json);
    }catch(err){
      console.error(err);
      // Fallback to simulated data
      const sim = simulatePrediction();
      populateDashboard(sim);
    } finally {
      setMeterLoading(false);
    }
  }

  async function fetchAlerts(){
    try{
      const res = await fetch('/api/alerts');
      const json = await res.json();
      populateAlerts(json);
    }catch(err){
      console.warn('alerts fetch failed, using local sample');
      populateAlerts(simulateAlerts());
    }
  }

  function populateDashboard(data){
    // meter
    const meterBar = document.getElementById('meter-bar');
    const meterLabel = document.getElementById('meter-label');
    meterBar.style.width = `${data.congestion_pct}%`;
    meterLabel.textContent = `${data.congestion_pct}% congestion (predicted)`;

    // stats
    document.getElementById('avg-speed').textContent = data.avg_speed.toFixed(1);
    document.getElementById('incidents').textContent = data.incidents;
    document.getElementById('weather-impact').textContent = data.weather;

    // timeline
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '';
    data.timeline.forEach(t => {
      const tick = document.createElement('div');
      tick.className = 'tick';
      tick.innerHTML = `<div>${t.time}<br><small style="display:block;color:#666">${t.level}</small></div>`;
      timeline.appendChild(tick);
    });
  }

  function populateAlerts(alerts){
    const el = document.getElementById('alerts-list');
    el.innerHTML = '';
    if(!alerts.length) {
      el.innerHTML = '<li class="muted">No active alerts</li>';
      return;
    }
    alerts.forEach(a => {
      const li = document.createElement('li');
      li.className = a.severity === 'high' ? 'alert-high' : a.severity === 'medium' ? 'alert-medium' : 'alert-low';
      li.innerHTML = `<strong>${a.title}</strong> <div style="font-size:13px;color:#444">${a.location} • ${a.time}</div>`;
      el.appendChild(li);
    });
  }

  function setMeterLoading(on){
    const meterBar = document.getElementById('meter-bar');
    if(on) meterBar.style.width = '6%';
  }

  // Simulated fallback prediction
  function simulatePrediction(){
    const t = new Date();
    const timeline = [];
    for(let i=0;i<6;i++){
      const hh = (t.getHours()+Math.floor((t.getMinutes()+10*i)/60))%24;
      timeline.push({ time: `${hh}:00`, level: ['Low','Moderate','High'][Math.floor(Math.random()*3)] });
    }
    return {
      congestion_pct: Math.floor(30 + Math.random()*60),
      avg_speed: 42 + Math.random()*18,
      incidents: Math.floor(Math.random()*4),
      weather: ['None','Light Rain','Heavy Rain','Fog'][Math.floor(Math.random()*4)],
      timeline
    };
  }

  // Simulated fallback alerts
  function simulateAlerts(){
    return [
      { title: 'Multi-vehicle accident', location: 'NH48 — Manesar', time: '10:12', severity: 'high' },
      { title: 'Road Works', location: 'MG Road — Sector 14', time: '09:00', severity: 'medium' },
      { title: 'Heavy rain', location: 'City Center', time: '08:45', severity: 'low' }
    ];
  }

  // Optionally poll in background (unobtrusive)
  setInterval(()=> {
    // auto-refresh only when dashboard visible
    if(document.getElementById('dashboard').classList.contains('page-visible')){
      fetchPrediction();
    }
  }, 120000); // every 2 minutes
});
