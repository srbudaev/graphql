// Chart rendering utilities
export const drawAuditRatioChart = (data, svgId) => {
  const svg = document.getElementById(svgId);
  const maxRatio = Math.max(...data.map(d => d.ratio));
  const minRatio = Math.min(...data.map(d => d.ratio));
  const range = maxRatio - minRatio || 1;
  
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 90 + 5,
    y: 90 - ((d.ratio - minRatio) / range) * 80,
    ...d
  }));
  
  const path = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
  
  svg.innerHTML = `
    <path d="${path}" fill="none" stroke="#667eea" stroke-width="2"/>
    ${points.map(p => `
      <circle cx="${p.x}" cy="${p.y}" r="4" fill="#667eea" 
              data-month="${p.month}" data-ratio="${p.ratio.toFixed(2)}" 
              data-projects="${p.projects}" class="chart-point"/>
    `).join('')}
  `;
  
  svg.setAttribute('viewBox', '0 0 100 100');
  
  // Add tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  document.body.appendChild(tooltip);
  
  svg.querySelectorAll('.chart-point').forEach(point => {
    point.addEventListener('mouseenter', e => {
      tooltip.innerHTML = `
        <strong>${e.target.dataset.month}</strong><br>
        Ratio: ${e.target.dataset.ratio}<br>
        Projects: ${e.target.dataset.projects}
      `;
      tooltip.style.display = 'block';
    });
    
    point.addEventListener('mousemove', e => {
      tooltip.style.left = e.pageX + 10 + 'px';
      tooltip.style.top = e.pageY - 10 + 'px';
    });
    
    point.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });
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
