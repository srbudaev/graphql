// Draws a horizontal bar chart for skills
export function drawSkillsBarChart(skillsData, chartTitle = "Skills", containerId = "skills-chart") {
    if (!skillsData?.length) return;

    // Sort skills by amount descending
    const sortedSkills = [...skillsData].sort((a, b) => b.amount - a.amount);

    const maxAmount = Math.max(...sortedSkills.map(d => d.amount));
    const svgNS = "http://www.w3.org/2000/svg";
    const barHeight = 25, gap = 10, width = 600;
    const height = Math.min(sortedSkills.length * (barHeight + gap), 600);

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);

    sortedSkills.forEach((item, i) => {
        const y = i * (barHeight + gap);
        const barWidth = maxAmount ? (item.amount / maxAmount) * (width - 120) : 0;

        // Bar
        const rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("x", 70);
        rect.setAttribute("y", y);
        rect.setAttribute("width", barWidth);
        rect.setAttribute("height", barHeight);
        rect.setAttribute("class", "skill-bar");
        svg.appendChild(rect);

        // Skill label
        const label = document.createElementNS(svgNS, "text");
        label.setAttribute("x", 0);
        label.setAttribute("y", y + 15);
        label.textContent = item.type.replace("skill_", "");
        label.setAttribute("class", "skill-label");
        svg.appendChild(label);

        // Value label
        const valueLabel = document.createElementNS(svgNS, "text");
        valueLabel.setAttribute("x", 70 + barWidth + 5);
        valueLabel.setAttribute("y", y + barHeight / 2 + 4);
        valueLabel.textContent = `${item.amount.toLocaleString()}%`;
        valueLabel.setAttribute("class", "skill-value");
        svg.appendChild(valueLabel);
    });

    const chartContainer = document.getElementById(containerId);
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
}

// Draws a line graph for XP progression
const XPLineColors = {
    Line: "teal",
    Dot: "teal",
    Axis: "black",
    Grid: "#ccc"
};

export function drawXPLineGraph(xpProgression, chartTitle = "XP Progression") {
    if (!xpProgression?.length) return;

    const svgNS = "http://www.w3.org/2000/svg";
    const width = 600, height = 300, padding = 60;
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);

    // Scaling
    const maxXP = Math.ceil(Math.max(...xpProgression.map(p => p.amount)) / 100000) * 100000 || 100000;
    const xScale = i => i * (width - 2 * padding) / (xpProgression.length - 1) + padding;
    const yScale = xp => height - padding - (xp / maxXP) * (height - 2 * padding);

    // Axes
    [
        [padding, padding, padding, height - padding], // Y
        [padding, height - padding, width - padding, height - padding] // X
    ].forEach(([x1, y1, x2, y2]) => {
        const axis = document.createElementNS(svgNS, "line");
        axis.setAttribute("x1", x1); axis.setAttribute("y1", y1);
        axis.setAttribute("x2", x2); axis.setAttribute("y2", y2);
        axis.setAttribute("stroke", XPLineColors.Axis);
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
        label.setAttribute("font-size", "10");
        label.textContent = value.toLocaleString();
        svg.appendChild(label);
    }

    // X labels
    const labelStep = Math.ceil(xpProgression.length / 6);
    for (let i = 0; i < xpProgression.length; i += labelStep) {
        const x = xScale(i);
        const date = new Date(xpProgression[i].createdAt);
        const label = `${date.getMonth() + 1}/${date.getYear()-100}`;
        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", x);
        text.setAttribute("y", height - padding + 15);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-size", "10");
        text.textContent = label;
        svg.appendChild(text);
    }

    // Line path
    let pathData = `M ${xScale(0)} ${yScale(xpProgression[0].amount)} `;
    for (let i = 1; i < xpProgression.length; i++) {
        pathData += `L ${xScale(i)} ${yScale(xpProgression[i].amount)} `;
    }
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", pathData);
    path.setAttribute("stroke", XPLineColors.Line);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-width", 2);
    svg.appendChild(path);

    // Dots
    for (let i = 0; i < xpProgression.length; i++) {
        const circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", xScale(i));
        circle.setAttribute("cy", yScale(xpProgression[i].amount));
        circle.setAttribute("r", 3);
        circle.setAttribute("fill", XPLineColors.Dot);
        svg.appendChild(circle);
    }

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
}
