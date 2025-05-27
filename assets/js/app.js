// GraphQL Profile App
const API_URL = 'https://01.gritlab.ax/api/graphql-engine/v1/graphql';
const AUTH_URL = 'https://01.gritlab.ax/api/auth/signin';

// GraphQL queries
const queries = {
  user: `{ user { id login attrs auditRatio campus } }`,
  xp: `{ transaction(where: {type: {_eq: "xp"}} order_by: {createdAt: desc} limit: 50) { amount createdAt path } }`,
  progress: `{ progress { grade createdAt path object { name type } } result { grade createdAt path object { name type } } }`
};

// GraphQL request
const gql = async (query, token) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  if (data.errors) throw new Error(data.errors[0].message);
  return data.data;
};

// Login handler
document.getElementById('loginForm').onsubmit = async e => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  try {
    const res = await fetch(AUTH_URL, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${btoa(`${username}:${password}`)}` }
    });
    
    if (!res.ok) throw new Error('Invalid credentials');
    
    const token = (await res.text()).replace(/"/g, '');
    localStorage.setItem('jwt', token);
    showProfile(token);
  } catch (err) {
    document.getElementById('error').textContent = err.message;
  }
};

// Show profile
const showProfile = async token => {
  document.getElementById('login').classList.add('hidden');
  document.getElementById('profile').classList.remove('hidden');
  
  try {
    // Load user data
    const userData = await gql(queries.user, token);
    const user = userData.user[0];
    
    document.getElementById('userInfo').innerHTML = `
      <div class="info-row"><strong>Login:</strong> ${user.login}</div>
      <div class="info-row"><strong>Campus:</strong> ${user.campus}</div>
      <div class="info-row"><strong>Audit Ratio:</strong> ${user.auditRatio.toFixed(2)}</div>
    `;
    
    // Load XP data
    const xpData = await gql(queries.xp, token);
    const xpTransactions = xpData.transaction;
    const totalXP = xpTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    document.getElementById('xpStats').innerHTML = `
      <div class="info-row"><strong>Total XP:</strong> ${Math.round(totalXP / 1000)} KB</div>
      <div class="info-row"><strong>Transactions:</strong> ${xpTransactions.length}</div>
      <div class="info-row"><strong>Level:</strong> ${Math.floor(Math.cbrt(totalXP / 1000))}</div>
    `;
    
    drawXPChart(xpTransactions);
    
    // Load projects
    const projectData = await gql(queries.progress, token);
    const allProjects = [...(projectData.progress || []), ...(projectData.result || [])];
    
    // Only count attempted projects
    const attemptedProjects = allProjects.filter(p => p.grade !== null);
    const completed = attemptedProjects.filter(p => p.grade === 1).length;
    const failed = attemptedProjects.filter(p => p.grade === 0).length;
    const inProgress = allProjects.filter(p => p.grade === null).length;
    
    document.getElementById('projectStats').innerHTML = `
      <div class="info-row"><strong>Attempted:</strong> ${attemptedProjects.length}</div>
      <div class="info-row"><strong>Completed:</strong> ${completed}</div>
      <div class="info-row"><strong>Failed:</strong> ${failed}</div>
      <div class="info-row"><strong>Success Rate:</strong> ${attemptedProjects.length > 0 ? ((completed / attemptedProjects.length) * 100).toFixed(1) : 0}%</div>
    `;
    
    drawProjectChart(completed, failed, inProgress);
  } catch (err) {
    console.error(err);
  }
};

// Draw XP chart
const drawXPChart = transactions => {
  const svg = document.getElementById('xpChart');
  const sorted = [...transactions].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  let cumulative = 0;
  const maxXP = sorted.reduce((sum, tx) => sum + tx.amount, 0);
  
  const points = sorted.map((tx, i) => {
    cumulative += tx.amount;
    return { x: (i / (sorted.length - 1)) * 100, y: 100 - (cumulative / maxXP) * 100 };
  });
  
  const path = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
  svg.innerHTML = `<path d="${path}" fill="none" stroke="#667eea" stroke-width="2" vector-effect="non-scaling-stroke"/>`;
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');
};

// Draw project chart
const drawProjectChart = (completed, failed, inProgress) => {
  const svg = document.getElementById('projectChart');
  const total = completed + failed + inProgress;
  let angle = 0;
  
  const segments = [
    { value: completed, color: '#4CAF50' },
    { value: failed, color: '#F44336' },
    { value: inProgress, color: '#FF9800' }
  ];
  
  svg.innerHTML = segments.map(seg => {
    const startAngle = angle;
    const endAngle = angle + (seg.value / total) * 360;
    angle = endAngle;
    
    const x1 = 50 + 40 * Math.cos(startAngle * Math.PI / 180);
    const y1 = 50 + 40 * Math.sin(startAngle * Math.PI / 180);
    const x2 = 50 + 40 * Math.cos(endAngle * Math.PI / 180);
    const y2 = 50 + 40 * Math.sin(endAngle * Math.PI / 180);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `<path d="M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${seg.color}"/>`;
  }).join('');
  
  svg.setAttribute('viewBox', '0 0 100 100');
};

// Logout
document.getElementById('logout').onclick = () => {
  localStorage.removeItem('jwt');
  location.reload();
};

// Check auth on load
const token = localStorage.getItem('jwt');
if (token) showProfile(token); 