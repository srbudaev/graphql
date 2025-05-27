// GraphQL Profile App
import { processAuditRatioData, processAuditorData } from './data.js';
import { drawAuditRatioChart, drawAuditorChart } from './charts.js';

const API_URL = 'https://01.gritlab.ax/api/graphql-engine/v1/graphql';
const AUTH_URL = 'https://01.gritlab.ax/api/auth/signin';

// GraphQL queries
const queries = {
  user: `{ user { id login attrs auditRatio campus } }`,
  xp: `{ transaction(where: {type: {_eq: "xp"}} order_by: {createdAt: desc} limit: 50) { amount createdAt path } }`,
  progress: `{ progress { grade createdAt path object { name type } } result { grade createdAt path object { name type } } }`,
  auditTransactions: `{ transaction(where: {type: {_in: ["up", "down"]}} order_by: {createdAt: desc}) { id type amount createdAt path userId attrs } }`,
  audits: `{ audit(order_by: {createdAt: desc}) { id grade createdAt resultId auditorId result } }`
};

// Load local data as fallback
const loadLocalData = async () => {
  try {
    const auditResponse = await fetch('./audit_queries1.txt');
    const auditText = await auditResponse.text();
    const auditData = JSON.parse(auditText);
    
    const auditorResponse = await fetch('./audit_quieries2.txt');
    const auditorText = await auditorResponse.text();
    const auditorData = JSON.parse(auditorText);
    
    return {
      transactions: auditData.data.transaction,
      audits: auditorData.data.audit
    };
  } catch (err) {
    console.error('Failed to load local data:', err);
    return { transactions: [], audits: [] };
  }
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
    
    // Load projects
    const projectData = await gql(queries.progress, token);
    const allProjects = [...(projectData.progress || []), ...(projectData.result || [])];
    const attemptedProjects = allProjects.filter(p => p.grade !== null);
    const completed = attemptedProjects.filter(p => p.grade === 1).length;
    const failed = attemptedProjects.filter(p => p.grade === 0).length;
    
    document.getElementById('projectStats').innerHTML = `
      <div class="info-row"><strong>Attempted:</strong> ${attemptedProjects.length}</div>
      <div class="info-row"><strong>Completed:</strong> ${completed}</div>
      <div class="info-row"><strong>Failed:</strong> ${failed}</div>
      <div class="info-row"><strong>Success Rate:</strong> ${attemptedProjects.length > 0 ? ((completed / attemptedProjects.length) * 100).toFixed(1) : 0}%</div>
    `;
    
    // Load audit data (try API first, fallback to local)
    let auditTransactions, audits;
    try {
      const auditTxData = await gql(queries.auditTransactions, token);
      const auditData = await gql(queries.audits, token);
      auditTransactions = auditTxData.transaction;
      audits = auditData.audit;
    } catch (err) {
      console.log('Using local data...');
      const localData = await loadLocalData();
      auditTransactions = localData.transactions;
      audits = localData.audits;
    }
    
    // Process and draw charts
    const auditRatioData = processAuditRatioData(auditTransactions);
    const auditorData = processAuditorData(audits);
    
    drawAuditRatioChart(auditRatioData, 'auditRatioChart');
    drawAuditorChart(auditorData, 'auditorChart');
    
  } catch (err) {
    console.error(err);
  }
};

// Logout
document.getElementById('logout').onclick = () => {
  localStorage.removeItem('jwt');
  location.reload();
};

// Check auth on load
const token = localStorage.getItem('jwt');
if (token) showProfile(token); 