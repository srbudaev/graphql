// Data processing utilities
export const processAuditRatioData = (transactions) => {
  const monthlyData = {};
  
  transactions.forEach(tx => {
    if (tx.type === 'up' || tx.type === 'down') {
      const date = new Date(tx.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { up: 0, down: 0, projects: new Set() };
      }
      
      monthlyData[monthKey][tx.type] += tx.amount;
      
      // Extract project name from path
      const projectName = tx.path.split('/').pop().replace(/-/g, ' ');
      monthlyData[monthKey].projects.add(projectName);
    }
  });
  
  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      ratio: data.up / (data.down || 1),
      projects: Array.from(data.projects).join(', ')
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

export const processAuditorData = (transactions) => {
  const auditedCounts = {};
  
  // Process "up" transactions which represent successful audits you performed
  transactions.forEach(tx => {
    if (tx.type === 'up') {
      const projectName = tx.path.split('/').pop().replace(/-/g, ' ');
      auditedCounts[projectName] = (auditedCounts[projectName] || 0) + 1;
    }
  });
  
  return Object.entries(auditedCounts)
    .map(([project, count]) => ({ auditor: project, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10
};
