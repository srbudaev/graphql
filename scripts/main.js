import { userInfoQuery, xpQuery, skillsQuery, graphqlQuery } from './graphql.js';
import { drawSkillsBarChart, drawXPLineGraph } from './charts.js';

document.addEventListener('DOMContentLoaded', async () =>{
    // only after successful login
    const jwt = localStorage.getItem('jwt');

    if (jwt && isJwtValid(jwt)) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('profile-section').style.display = 'block';
        await fetchAndDisplayUserInfo(jwt);
    } else if (jwt && !isJwtValid(jwt)) {
        sessionExpired();
    }
});

export const isJwtValid = (token) => {
    try {
        // spliting and decoding JWT to get the expiration time
        const payload = JSON.parse(atob(token.split('.')[1]));

        const currentTime = Math.floor(Date.now()/1000);
         // check if there is an expiration time and if it is not in the past   
        return payload.exp && payload.exp > currentTime;
    } catch (e) {
        return false;
    }
};

const sessionExpired = (message = 'Your session has expired. Please log in again.') => {
    localStorage.removeItem('jwt');
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('profile-section').style.display = 'none';
    const loginError = document.getElementById('login-error');
    if (loginError) {
        loginError.textContent = message;
        loginError.style.display = 'block';
    }
};

//displaying the user info in the profile section
export async function fetchAndDisplayUserInfo(jwt) {
    try {
        const data = await graphqlQuery(userInfoQuery, jwt);
        const user = data?.user?.[0];
        if (!user) return;

        document.getElementById("username").textContent =`Username: ${user.login || ''}`;
        document.getElementById("userid").textContent = `User ID: ${user.id || ''}`;
        document.getElementById("audit-ratio").textContent = `Audit Ratio: ${user.auditRatio ? (user.auditRatio * 1).toFixed(1) : ''}`;
        document.getElementById("email").textContent = `Email: ${user.attrs?.email || ''}`;
        document.getElementById("campus").textContent = `Campus: ${user.campus || ''}`;
        document.getElementById("nationality").textContent = `Nationality: ${user.attrs?.nationality || ''}`;
        document.getElementById("fullname").textContent = `Full name: ${(user.firstName || '') + ' ' + (user.lastName || '')}`;
        await fetchAndDisplayXP(jwt);
        await fetchAndDisplaySkills(jwt);

    } catch (err) {
        console.error("Error fetching user info:", err);
        // Optionally show an error message in the UI
    }
}

async function fetchAndDisplaySkills(jwt) {
    try {
        const data = await graphqlQuery(skillsQuery, jwt);
        const skillTransactions = data?.user?.[0]?.skills || [];
        drawSkillsBarChart(skillTransactions, "Skills", "skills-chart");
    } catch (err) {
        console.error("Error fetching skills:", err);
    }
}

async function fetchAndDisplayXP(jwt) {
    try {
        const data = await graphqlQuery(xpQuery, jwt);
        const transaction = data?.transaction || [];

        // Filter and sort XP entries as needed
        const filteredXP = transaction.filter(xp =>
            (xp.path.startsWith('/gritlab/school-curriculum') && !xp.path.includes('/gritlab/school-curriculum/piscine-')) ||
            xp.path.endsWith('piscine-js')
        );

        const sortedXP = filteredXP.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        // Calculate progression
        const progression = [];
        let cumulative = 0;
        for (const xp of sortedXP) {
            cumulative += xp.amount;
            progression.push({
                amount: cumulative,
                createdAt: xp.createdAt
            });
        }
        const totalXP = cumulative;
        const totalKB = totalXP / 1000;
        document.getElementById("total-xp").textContent =
            `Total XP: ${totalKB.toLocaleString(undefined, { maximumFractionDigits: 0 })} KB`;
        // Now you can call the chart function
        drawXPLineGraph(progression, "XP Progression");
    } catch (err) {
        console.error("Error fetching XP:", err);
    }
}
