// Draws a horizontal bar chart for skills
export function drawXPLineGraph(xpProgression, chartTitle = "XP Progression") {
    if (!xpProgression?.length) return;

    const svgNS = "http://www.w3.org/2000/svg";
    const width = 800, height = 400, padding = 80; // Увеличили размеры для лучшей читаемости
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);

    // Получаем диапазон дат
    const dates = xpProgression.map(p => new Date(p.createdAt));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) || 1;

    // Scaling - теперь основан на днях
    const maxXP = Math.ceil(Math.max(...xpProgression.map(p => p.amount)) / 100000) * 100000 || 100000;
    const xScale = (date) => {
        const daysSinceStart = Math.floor((new Date(date) - minDate) / (1000 * 60 * 60 * 24));
        return padding + (daysSinceStart / totalDays) * (width - 2 * padding);
    };
    const yScale = xp => height - padding - (xp / maxXP) * (height - 2 * padding);

    // Создаем tooltip элемент
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

    // X labels (даты) - показываем каждые ~30 дней или меньше если данных мало
    const labelStep = Math.max(1, Math.floor(totalDays / 8)); // Максимум 8 меток
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

    // Dots с информацией о проектах
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

        // Извлекаем название проекта из пути
        const projectName = point.path ? point.path.split('/').pop() || 'Unknown Project' : 'Unknown Project';
        const xpGained = i === 0 ? point.amount : point.amount - xpProgression[i-1].amount;
        const date = new Date(point.createdAt).toLocaleDateString();

        // Добавляем интерактивность
        circle.addEventListener('mouseenter', (e) => {
            tooltip.innerHTML = `
                <strong>Project:</strong> ${projectName}<br>
                <strong>XP Gained:</strong> ${xpGained.toLocaleString()}<br>
                <strong>Total XP:</strong> ${point.amount.toLocaleString()}<br>
                <strong>Date:</strong> ${date}
            `;
            tooltip.style.display = 'block';
            circle.setAttribute("r", 7); // Увеличиваем размер при hover
        });

        circle.addEventListener('mousemove', (e) => {
            tooltip.style.left = (e.pageX + 10) + 'px';
            tooltip.style.top = (e.pageY - 10) + 'px';
        });

        circle.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
            circle.setAttribute("r", 5); // Возвращаем исходный размер
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

    // Cleanup функция для удаления tooltip при удалении графика
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
