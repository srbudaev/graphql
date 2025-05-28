// Chart rendering utilities
const svgNS = "http://www.w3.org/2000/svg";

export const drawAuditRatioChart = (transactions, svgId) => {
  const svg = document.getElementById(svgId);
  svg.innerHTML = '';
  svg.setAttribute('viewBox', '0 0 800 300');
  
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const width = 800 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;
  
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
  
  // Process data: group by month and calculate audit ratio per month
  const monthlyData = {};
  
  transactions.forEach(t => {
    const date = new Date(t.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { up: 0, down: 0, date: new Date(date.getFullYear(), date.getMonth(), 1) };
    }
    
    if (t.type === 'up') {
      monthlyData[monthKey].up += t.amount;
    } else {
      monthlyData[monthKey].down += t.amount;
    }
  });
  
  // Calculate audit ratio for each month
  const dataPoints = Object.keys(monthlyData)
    .map(month => {
      const data = monthlyData[month];
      const ratio = data.down > 0 ? data.up / data.down : (data.up > 0 ? 5 : 0); // Cap at 5 if no down votes
      return {
        date: data.date,
        ratio: Math.min(ratio, 5), // Cap maximum at 5
        up: data.up,
        down: data.down,
        month
      };
    })
    .sort((a, b) => a.date - b.date);
  
  if (!dataPoints.length) return;
  
  const dates = dataPoints.map(d => d.date);
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const maxRatio = 5; // Fixed Y-axis from 0 to 5
  
  
  // Scales
  const xScale = date => ((date - minDate) / (maxDate - minDate)) * width;
  const yScale = ratio => height - (ratio / maxRatio) * height;
  
  // Grid lines (0 to 5)
  for (let i = 0; i <= 5; i += 0.5) {
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', 0);
    line.setAttribute('x2', width);
    line.setAttribute('y1', yScale(i));
    line.setAttribute('y2', yScale(i));
    line.setAttribute('stroke', i === 1 ? '#ff4444' : '#e0e0e0');
    line.setAttribute('stroke-width', i === 1 ? '2' : '1');
    g.appendChild(line);
    
    // Y-axis labels
    const text = document.createElementNS(svgNS, 'text');
    text.setAttribute('x', -5);
    text.setAttribute('y', yScale(i) + 3);
    text.setAttribute('text-anchor', 'end');
    text.setAttribute('font-size', '12');
    text.setAttribute('fill', '#666');
    text.textContent = i.toFixed(1);
    g.appendChild(text);
  }
  
  // X-axis (months)
  dataPoints.forEach((d, i) => {
    if (i % 2 === 0 || dataPoints.length < 10) { // Show every other month or all if few points
      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', xScale(d.date));
      text.setAttribute('y', height + 20);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '10');
      text.setAttribute('fill', '#666');
      text.textContent = d.month;
      g.appendChild(text);
    }
  });
  
  // Line path
  const path = document.createElementNS(svgNS, 'path');
  const pathData = dataPoints.map((d, i) => 
    `${i === 0 ? 'M' : 'L'} ${xScale(d.date)},${yScale(d.ratio)}`
  ).join(' ');
  path.setAttribute('d', pathData);
  path.setAttribute('stroke', '#4285f4');
  path.setAttribute('stroke-width', '3');
  path.setAttribute('fill', 'none');
  g.appendChild(path);
  
  // Title
  const title = document.createElementNS(svgNS, 'text');
  title.setAttribute('x', width / 2);
  title.setAttribute('y', -5);
  title.setAttribute('text-anchor', 'middle');
  title.setAttribute('font-size', '14');
  title.setAttribute('font-weight', 'bold');
  title.setAttribute('fill', '#333');
  title.textContent = 'Audit Ratio by Month';
  g.appendChild(title);
  
  // Tooltip group
  const tooltip = document.createElementNS(svgNS, 'g');
  tooltip.setAttribute('visibility', 'hidden');
  const tooltipBg = document.createElementNS(svgNS, 'rect');
  tooltipBg.setAttribute('fill', 'rgba(0,0,0,0.8)');
  tooltipBg.setAttribute('rx', '4');
  const tooltipText = document.createElementNS(svgNS, 'text');
  tooltipText.setAttribute('fill', 'white');
  tooltipText.setAttribute('font-size', '12');
  tooltip.appendChild(tooltipBg);
  tooltip.appendChild(tooltipText);
  g.appendChild(tooltip);
  
  
  // Data points with circles for each month
  dataPoints.forEach(d => {
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', xScale(d.date));
    circle.setAttribute('cy', yScale(d.ratio));
    circle.setAttribute('r', '4');
    circle.setAttribute('fill', d.ratio > 1 ? '#22c55e' : '#ef4444');
    circle.setAttribute('stroke', 'white');
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('cursor', 'pointer');
    
    circle.addEventListener('mouseenter', () => {
      tooltipText.textContent = `${d.month}: ${d.ratio.toFixed(2)} (↑${Math.round(d.up/1000)}KB / ↓${Math.round(d.down/1000)}KB)`;
      const bbox = tooltipText.getBBox();
      const x = Math.min(xScale(d.date), width - bbox.width - 10);
      const y = yScale(d.ratio) - 20;
      tooltipText.setAttribute('x', x + 5);
      tooltipText.setAttribute('y', y + 12);
      tooltipBg.setAttribute('x', x);
      tooltipBg.setAttribute('y', y);
      tooltipBg.setAttribute('width', bbox.width + 10);
      tooltipBg.setAttribute('height', bbox.height + 6);
      tooltip.setAttribute('visibility', 'visible');
    });
    
    circle.addEventListener('mouseleave', () => {
      tooltip.setAttribute('visibility', 'hidden');
    });
    
    g.appendChild(circle);
  });
};

export const drawAuditorChart = (data, svgId) => {
  const svg = document.getElementById(svgId);
  const maxCount = Math.max(...data.map(d => d.count));
  
  svg.innerHTML = data.map((d, i) => `
    <rect x="5" y="${i * 9}" width="${(d.count / maxCount) * 85}" height="7" 
          fill="#667eea" opacity="0.8"/>
    <text x="92" y="${i * 9 + 5}" font-size="3" fill="#333" text-anchor="end">
      ${d.auditor}: ${d.count}
    </text>
  `).join('');
  
  svg.setAttribute('viewBox', `0 0 100 ${data.length * 9}`);
};
