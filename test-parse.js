const fs = require('fs');
const data = JSON.parse(fs.readFileSync('/Users/ramji/Downloads/MRs_List.json'));

let cleaned = [];
data.forEach((row, i) => {
    const keys = Object.keys(row);
    
    // Dynamic Key Finders
    const kMod = keys.find(k => k.toLowerCase().includes('module'));
    const kDesc = keys.find(k => k.toLowerCase().includes('desc'));
    const kEnv = keys.find(k => k.toLowerCase().replace(/[^a-z]/g, '') === 'adminserverapp' || k.toLowerCase().includes('admin'));
    const kAuth = keys.find(k => {
        const lk = k.toLowerCase();
        return lk.includes('member') || lk.includes('resource') || lk.includes('author') || lk.includes('developer');
    });
    const kSent = keys.find(k => k.toLowerCase().includes('sent'));
    const kMerg = keys.find(k => k.toLowerCase().includes('merg'));
    const kDep = keys.find(k => k.toLowerCase().includes('deploy'));

    let env = kEnv ? String(row[kEnv] || 'Unknown').trim() : 'Unknown';
    if (!['Admin', 'Server', 'APP', 'Web'].includes(env)) { env = 'APP'; }
    
    cleaned.push(env);
});

const counts = cleaned.reduce((acc, e) => {
    acc[e] = (acc[e] || 0) + 1;
    return acc;
}, {});

console.log(counts);
