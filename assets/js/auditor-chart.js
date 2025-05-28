// Auditor Chart - Shows projects audited by the user
const svgNS = "http://www.w3.org/2000/svg";

export const drawAuditorChart = (auditData, svgId) => {
  const svg = document.getElementById(svgId);
  svg.innerHTML = '';
  svg.setAttribute('viewBox', '0 0 800 400');
  
  const margin = { top: 20, right: 30, bottom: 60, left: 150 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;
  
  // Background
  const bg = document.createElementNS(svgNS, 'rect');
  bg.setAttribute('width', '100%');
  bg.setAttribute('height', '100%');
  bg.setAttribute('fill', '#f8f9ff');
  svg.appendChild(bg);
  
  // Main group
  const g = document.createElementNS(svgNS, 'g');
  g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(g);
  
  if (!auditData || auditData.length === 0) {
    // Show "No data" message
    const text = document.createElementNS(svgNS, 'text');
    text.setAttribute('x', width / 2);
    text.setAttribute('y', height / 2);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '16');
    text.setAttribute('fill', '#666');
    text.textContent = 'No audit data available';
    g.appendChild(text);
    return;
  }
  
  const maxCount = Math.max(...auditData.map(d => d.count));
  const barHeight = Math.min(30, (height - 10) / auditData.length);
  const barSpacing = Math.max(5, barHeight * 0.2);
  
  // Create bars and labels
  auditData.forEach((d, i) => {
    const y = i * (barHeight + barSpacing);
    const barWidth = (d.count / maxCount) * width * 0.7;
    
    // Bar background
    const bgRect = document.createElementNS(svgNS, 'rect');
    bgRect.setAttribute('x', 0);
    bgRect.setAttribute('y', y);
    bgRect.setAttribute('width', width * 0.7);
    bgRect.setAttribute('height', barHeight);
    bgRect.setAttribute('fill', '#e8e9ef');
    bgRect.setAttribute('rx', '3');
    g.appendChild(bgRect);
    
    // Bar
    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', 0);
    rect.setAttribute('y', y);
    rect.setAttribute('width', barWidth);
    rect.setAttribute('height', barHeight);
    rect.setAttribute('fill', '#667eea');
    rect.setAttribute('rx', '3');
    rect.setAttribute('opacity', '0.8');
    g.appendChild(rect);
    
    // Project name (left side)
    const projectText = document.createElementNS(svgNS, 'text');
    projectText.setAttribute('x', -10);
    projectText.setAttribute('y', y + barHeight / 2 + 4);
    projectText.setAttribute('text-anchor', 'end');
    projectText.setAttribute('font-size', '12');
    projectText.setAttribute('fill', '#333');
    projectText.textContent = d.project.length > 20 ? d.project.substring(0, 20) + '...' : d.project;
    g.appendChild(projectText);
    
    // Count (right side of bar)
    const countText = document.createElementNS(svgNS, 'text');
    countText.setAttribute('x', width * 0.75);
    countText.setAttribute('y', y + barHeight / 2 + 4);
    countText.setAttribute('text-anchor', 'start');
    countText.setAttribute('font-size', '12');
    countText.setAttribute('font-weight', 'bold');
    countText.setAttribute('fill', '#667eea');
    countText.textContent = `${d.count} audit${d.count === 1 ? '' : 's'}`;
    g.appendChild(countText);
    
    // Hover effect
    rect.setAttribute('cursor', 'pointer');
    rect.addEventListener('mouseenter', () => {
      rect.setAttribute('opacity', '1');
      rect.setAttribute('fill', '#5a67d8');
    });
    rect.addEventListener('mouseleave', () => {
      rect.setAttribute('opacity', '0.8');
      rect.setAttribute('fill', '#667eea');
    });
  });
  
  // Title
  const title = document.createElementNS(svgNS, 'text');
  title.setAttribute('x', width / 2);
  title.setAttribute('y', -5);
  title.setAttribute('text-anchor', 'middle');
  title.setAttribute('font-size', '14');
  title.setAttribute('font-weight', 'bold');
  title.setAttribute('fill', '#2c3e50');
  title.textContent = 'Projects You Audited';
  g.appendChild(title);
};

export const processProjectAuditData = (transactions) => {
  const projectCounts = {};
  
  // Count "up" transactions (successful audits performed by the user)
  transactions.forEach(tx => {
    if (tx.type === 'up') {
      // Extract project name from path
      const pathParts = tx.path.split('/');
      const projectName = pathParts[pathParts.length - 1];
      const formattedName = projectName
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize words
      
      projectCounts[formattedName] = (projectCounts[formattedName] || 0) + 1;
    }
  });
  
  // Convert to array and sort by count
  return Object.entries(projectCounts)
    .map(([project, count]) => ({ project, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15); // Top 15 projects
};