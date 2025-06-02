// Draws a horizontal bar chart for skills
export function drawXPLineGraph(xpProgression, chartTitle = "XP Progression") {
    if (!xpProgression?.length) return;

    const svgNS = "http://www.w3.org/2000/svg";
    const width = 800, height = 400, padding = 80; // Increased size for better readability
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);

    // Get date range
    const dates = xpProgression.map(p => new Date(p.createdAt));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) || 1;

    // Scaling - now based on days
    const maxXP = Math.ceil(Math.max(...xpProgression.map(p => p.amount)) / 100000) * 100000 || 100000;
    const xScale = (date) => {
        const daysSinceStart = Math.floor((new Date(date) - minDate) / (1000 * 60 * 60 * 24));
        return padding + (daysSinceStart / totalDays) * (width - 2 * padding);
    };
    const yScale = xp => height - padding - (xp / maxXP) * (height - 2 * padding);

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.style.position = 'absolute';
    tooltip.style.background = 'rgba(0,0,0,0.8)';
    tooltip.style.color = 'white';
    tooltip.style.padding = '8px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontSize = '12px';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.display = 'none';
    tooltip.style.zIndex = '1000';
    tooltip.style.maxWidth = '200px';
    document.body.appendChild(tooltip);

    // Axes
    [
        [padding, padding, padding, height - padding], // Y
        [padding, height - padding, width - padding, height - padding] // X
    ].forEach(([x1, y1, x2, y2]) => {
        const axis = document.createElementNS(svgNS, "line");
        axis.setAttribute("x1", x1); axis.setAttribute("y1", y1);
        axis.setAttribute("x2", x2); axis.setAttribute("y2", y2);
        axis.setAttribute("stroke", XPLineColors.Axis);
        axis.setAttribute("stroke-width", 2);
        svg.appendChild(axis);
    });

    // Grid lines and Y labels
    const tickStep = 100000, maxTicks = Math.ceil(maxXP / tickStep);
    for (let i = 0; i <= maxTicks; i++) {
        const value = i * tickStep, y = yScale(value);
        const grid = document.createElementNS(svgNS, "line");
        grid.setAttribute("x1", padding);
        grid.setAttribute("y1", y);
        grid.setAttribute("x2", width - padding);
        grid.setAttribute("y2", y);
        grid.setAttribute("stroke", XPLineColors.Grid);
        grid.setAttribute("stroke-dasharray", "2,2");
        svg.appendChild(grid);
        
        const label = document.createElementNS(svgNS, "text");
        label.setAttribute("x", padding - 10);
        label.setAttribute("y", y + 4);
        label.setAttribute("text-anchor", "end");
        label.setAttribute("font-size", "12");
        label.textContent = `${(value / 1000).toLocaleString()}KB`;
        svg.appendChild(label);
    }

    // X labels (dates) - show every ~30 days or less if there's little data
    const labelStep = Math.max(1, Math.floor(totalDays / 8)); // Maximum 8 labels
    const sampleDates = [];
    for (let dayOffset = 0; dayOffset <= totalDays; dayOffset += labelStep) {
        const date = new Date(minDate);
        date.setDate(date.getDate() + dayOffset);
        sampleDates.push(date);
    }

    sampleDates.forEach(date => {
        const x = xScale(date);
        const label = `${date.getDate()}/${date.getMonth() + 1}`;
        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", x);
        text.setAttribute("y", height - padding + 20);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-size", "11");
        text.textContent = label;
        svg.appendChild(text);
    });

    // Line path
    let pathData = `M ${xScale(xpProgression[0].createdAt)} ${yScale(xpProgression[0].amount)} `;
    for (let i = 1; i < xpProgression.length; i++) {
        pathData += `L ${xScale(xpProgression[i].createdAt)} ${yScale(xpProgression[i].amount)} `;
    }
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", pathData);
    path.setAttribute("stroke", XPLineColors.Line);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-width", 3);
    svg.appendChild(path);

    // Dots with project information
    xpProgression.forEach((point, i) => {
        const circle = document.createElementNS(svgNS, "circle");
        const cx = xScale(point.createdAt);
        const cy = yScale(point.amount);
        
        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", 5);
        circle.setAttribute("fill", XPLineColors.Dot);
        circle.setAttribute("stroke", "white");
        circle.setAttribute("stroke-width", 2);
        circle.style.cursor = "pointer";

        // Extract project name from path
        const projectName = point.path ? point.path.split('/').pop() || 'Unknown Project' : 'Unknown Project';
        const xpGained = i === 0 ? point.amount : point.amount - xpProgression[i-1].amount;
        const date = new Date(point.createdAt).toLocaleDateString();

        // Add interactivity
        circle.addEventListener('mouseenter', (e) => {
            tooltip.innerHTML = `
                <strong>Project:</strong> ${projectName}<br>
                <strong>XP Gained:</strong> ${xpGained.toLocaleString()}<br>
                <strong>Total XP:</strong> ${point.amount.toLocaleString()}<br>
                <strong>Date:</strong> ${date}
            `;
            tooltip.style.display = 'block';
            circle.setAttribute("r", 7); // Increase size on hover
        });

        circle.addEventListener('mousemove', (e) => {
            tooltip.style.left = (e.pageX + 10) + 'px';
            tooltip.style.top = (e.pageY - 10) + 'px';
        });

        circle.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
            circle.setAttribute("r", 5); // Return to original size
        });

        svg.appendChild(circle);
    });

    // Insert SVG into the container with a title
    const chartContainer = document.getElementById("xp-graph");
    if (!chartContainer) return;
    chartContainer.innerHTML = "";
    
    const scrollWrapper = document.createElement("div");
    scrollWrapper.className = "chart-scroll-wrapper";
    
    const titleElement = document.createElement("h3");
    titleElement.textContent = chartTitle;
    titleElement.className = "chart-title";
    scrollWrapper.appendChild(titleElement);
    scrollWrapper.appendChild(svg);
    chartContainer.appendChild(scrollWrapper);

    // Cleanup function to remove tooltip when removing the chart
    return () => {
        if (tooltip && tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
        }
    };
}

// Draws a line graph for XP progression
const XPLineColors = {
    Line: "teal",
    Dot: "teal",
    Axis: "black",
    Grid: "#ccc"
};

export function drawSkillsBarChart(skills, chartTitle = "Skills Distribution") {
    if (!skills?.length) return;

    const svgNS = "http://www.w3.org/2000/svg";
    const width = 600;
    const barHeight = 30;
    const padding = 150; // Увеличили для длинных названий навыков
    const height = skills.length * (barHeight + 10) + padding;
    
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);

    // Colors for skills bars
    const skillColors = [
        "#3498db", "#e74c3c", "#2ecc71", "#f39c12", "#9b59b6",
        "#1abc9c", "#34495e", "#e67e22", "#95a5a6", "#c0392b"
    ];

    // Find max skill level for scaling
    const maxLevel = Math.max(...skills.map(s => s.amount));
    const barMaxWidth = width - padding - 50; // Leave space for labels

    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.style.position = 'absolute';
    tooltip.style.background = 'rgba(0,0,0,0.8)';
    tooltip.style.color = 'white';
    tooltip.style.padding = '8px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontSize = '12px';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.display = 'none';
    tooltip.style.zIndex = '1000';
    document.body.appendChild(tooltip);

    // Draw title
    const titleElement = document.createElementNS(svgNS, "text");
    titleElement.setAttribute("x", width / 2);
    titleElement.setAttribute("y", 30);
    titleElement.setAttribute("text-anchor", "middle");
    titleElement.setAttribute("font-size", "18");
    titleElement.setAttribute("font-weight", "bold");
    titleElement.textContent = chartTitle;
    svg.appendChild(titleElement);

    // Draw bars and labels
    skills.forEach((skill, index) => {
        const y = 60 + index * (barHeight + 10);
        const barWidth = (skill.amount / maxLevel) * barMaxWidth;
        
        // Clean skill name (remove 'skill_' prefix if present)
        const skillName = skill.type.replace(/^skill_/, '').replace(/_/g, ' ');
        
        // Skill label (left side)
        const label = document.createElementNS(svgNS, "text");
        label.setAttribute("x", padding - 10);
        label.setAttribute("y", y + barHeight / 2 + 5);
        label.setAttribute("text-anchor", "end");
        label.setAttribute("font-size", "12");
        label.setAttribute("font-weight", "500");
        label.textContent = skillName;
        svg.appendChild(label);

        // Skill bar
        const bar = document.createElementNS(svgNS, "rect");
        bar.setAttribute("x", padding);
        bar.setAttribute("y", y);
        bar.setAttribute("width", barWidth);
        bar.setAttribute("height", barHeight);
        bar.setAttribute("fill", skillColors[index % skillColors.length]);
        bar.setAttribute("rx", 5); // Rounded corners
        bar.style.cursor = "pointer";

        // Value label (right side of bar)
        const valueLabel = document.createElementNS(svgNS, "text");
        valueLabel.setAttribute("x", padding + barWidth + 10);
        valueLabel.setAttribute("y", y + barHeight / 2 + 5);
        valueLabel.setAttribute("font-size", "12");
        valueLabel.setAttribute("font-weight", "bold");
        valueLabel.textContent = skill.amount.toFixed(0);
        svg.appendChild(valueLabel);

        // Add interactivity
        bar.addEventListener('mouseenter', (e) => {
            tooltip.innerHTML = `
                <strong>Skill:</strong> ${skillName}<br>
                <strong>Level:</strong> ${skill.amount.toFixed(2)}<br>
                <strong>Progress:</strong> ${((skill.amount / maxLevel) * 100).toFixed(1)}% of max
            `;
            tooltip.style.display = 'block';
            bar.setAttribute("opacity", "0.8");
        });

        bar.addEventListener('mousemove', (e) => {
            tooltip.style.left = (e.pageX + 10) + 'px';
            tooltip.style.top = (e.pageY - 10) + 'px';
        });

        bar.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
            bar.setAttribute("opacity", "1");
        });

        svg.appendChild(bar);
    });

    // Insert into container
    const chartContainer = document.getElementById("skills-chart");
    if (!chartContainer) return;
    chartContainer.innerHTML = "";
    
    const scrollWrapper = document.createElement("div");
    scrollWrapper.className = "chart-scroll-wrapper";
    scrollWrapper.appendChild(svg);
    chartContainer.appendChild(scrollWrapper);

    // Cleanup function
    return () => {
        if (tooltip && tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
        }
    };
}