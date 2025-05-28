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
  
  // Process data: calculate cumulative audit ratio
  let totalUp = 0, totalDown = 0;
  const dataPoints = transactions.map(t => {
    if (t.type === 'up') totalUp += t.amount;
    else totalDown += t.amount;
    const ratio = totalDown ? totalUp / totalDown : 0;
    return {
      date: new Date(t.createdAt),
      ratio,
      type: t.type,
      path: t.path
    };
  }).sort((a, b) => a.date - b.date);
  
  if (!dataPoints.length) return;
  
  const dates = dataPoints.map(d => d.date);
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const maxRatio = Math.max(...dataPoints.map(d => d.ratio), 1.5);
  
  // Scales
  const xScale = date => ((date - minDate) / (maxDate - minDate)) * width;
  const yScale = ratio => height - (ratio / maxRatio) * height;
  
  // Grid lines
  for (let i = 0; i <= Math.ceil(maxRatio * 2) / 2; i += 0.5) {
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
    text.textContent = i.toFixed(1);
    g.appendChild(text);
  }
  
  // Line path
  const path = document.createElementNS(svgNS, 'path');
  const pathData = dataPoints.map((d, i) => 
    `${i === 0 ? 'M' : 'L'} ${xScale(d.date)},${yScale(d.ratio)}`
  ).join(' ');
  path.setAttribute('d', pathData);
  path.setAttribute('stroke', '#4285f4');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('fill', 'none');
  g.appendChild(path);
  
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
  
  // Data points with triangles
  dataPoints.forEach(d => {
    const triangle = document.createElementNS(svgNS, 'polygon');
    const isUp = d.type === 'up';
    triangle.setAttribute('points', isUp ? '0,8 4,0 8,8' : '0,0 4,8 8,0');
    triangle.setAttribute('transform', `translate(${xScale(d.date)-4}, ${yScale(d.ratio)-(isUp?8:0)})`);
    triangle.setAttribute('fill', isUp ? '#22c55e' : '#ef4444');
    triangle.setAttribute('cursor', 'pointer');
    
    triangle.addEventListener('mouseenter', () => {
      const project = d.path.split('/').pop().replace(/-/g, ' ');
      tooltipText.textContent = `${project} ${d.ratio.toFixed(2)} ${isUp ? '↑' : '↓'}`;
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
    
    triangle.addEventListener('mouseleave', () => {
      tooltip.setAttribute('visibility', 'hidden');
    });
    
    g.appendChild(triangle);
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
