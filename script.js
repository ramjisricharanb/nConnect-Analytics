Chart.defaults.color = '#94a3b8';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.borderColor = '#334155'; // Using UI's subtle border color
Chart.defaults.plugins.tooltip.backgroundColor = '#0f172a';

const DB_INDEX_KEY = 'nc_months_index';
const DB_DATA_PREFIX = 'nc_month_data_';
let ALL_MONTHS = [];
let ACTIVE_MONTH = '';
let GLOBAL_DATA = [];
let choiceModule, choiceEnv, choiceResource, choiceStatus;

document.addEventListener('DOMContentLoaded', async () => {
    choiceModule = new Choices('#filter-module', { removeItemButton: true, searchPlaceholderValue: 'Search...' });
    choiceEnv = new Choices('#filter-env', { removeItemButton: true, searchPlaceholderValue: 'Search...' });
    choiceResource = new Choices('#filter-resource', { removeItemButton: true, searchPlaceholderValue: 'Search...' });
    choiceStatus = new Choices('#filter-status', { removeItemButton: true, searchPlaceholderValue: 'Search...' });

    // --- DOM Elements ---
    const monthSelector = document.getElementById('monthSelector');
    const btnOpenUpload = document.getElementById('btn-open-upload');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCancelUpload = document.getElementById('btn-cancel-upload');
    const btnSaveUpload = document.getElementById('btn-save-upload');
    const uploadModal = document.getElementById('uploadModal');
    const uploadMonthName = document.getElementById('uploadMonthName');
    const uploadJsonFile = document.getElementById('uploadJsonFile');
    const btnDeleteDataset = document.getElementById('btn-delete-dataset');

    // --- Data Boot Up ---
    try {
        ALL_MONTHS = JSON.parse(localStorage.getItem(DB_INDEX_KEY) || "[]");

        // Background sync: Ensure server-provided defaults are present for all visitors
        let updatedLocal = false;

        // Clean out any duplicates or old names
        if (ALL_MONTHS.some(m => m.includes("February"))) {
            ALL_MONTHS = ALL_MONTHS.filter(m => !m.includes("February"));
            // remove old cache
            localStorage.removeItem(DB_DATA_PREFIX + "February 2025 (Base)");
            localStorage.removeItem(DB_DATA_PREFIX + "February 2026 (Base)");
            updatedLocal = true;
        }
        
        // Remove any literal duplicate entries universally
        const uniqueSet = new Set(ALL_MONTHS);
        if (uniqueSet.size !== ALL_MONTHS.length) {
            ALL_MONTHS = Array.from(uniqueSet);
            updatedLocal = true;
        }

        if (!ALL_MONTHS.includes("FEB")) {
            try {
                const response = await fetch('data.json');
                const rawData = await response.json();
                ALL_MONTHS.unshift("FEB"); // placing it at the beginning
                localStorage.setItem(DB_DATA_PREFIX + "FEB", JSON.stringify(rawData));
                updatedLocal = true;
            } catch (e) { }
        }

        // Cleanup old "March 2025" buggy data from previous runs
        if (ALL_MONTHS.includes("March 2025")) {
            ALL_MONTHS = ALL_MONTHS.filter(m => m !== "March 2025");
            localStorage.removeItem(DB_DATA_PREFIX + "March 2025");
            updatedLocal = true;
        }

        try {
            // Always fetch the newest March Excel sheet to ensure live updates
            const resMarch = await fetch('March.xlsx');
            if (resMarch.ok) {
                const arrayBuffer = await resMarch.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: false, dateNF: 'mm/dd/yyyy' });
                
                if (!ALL_MONTHS.includes("March")) {
                    ALL_MONTHS.push("March");
                }
                // Always overwrite local storage with the absolutely newest spreadsheet data
                localStorage.setItem(DB_DATA_PREFIX + "March", JSON.stringify(rows));
                updatedLocal = true;
            }
        } catch(e) {
            console.log("March.xlsx not found on server.");
        }

        if (updatedLocal) {
            localStorage.setItem(DB_INDEX_KEY, JSON.stringify(ALL_MONTHS));
        }

        // Load newest/most recent active month
        ACTIVE_MONTH = ALL_MONTHS[ALL_MONTHS.length - 1];
        const rawData = JSON.parse(localStorage.getItem(DB_DATA_PREFIX + ACTIVE_MONTH) || "[]");
        GLOBAL_DATA = processData(rawData);
        updateMonthDropdown();
        renderDashboard(GLOBAL_DATA);
    } catch (e) {
        console.error("Failed to load or parse data", e);
    }

    // --- Modal & Upload UI Logic ---

    function toggleModal(show) {
        uploadModal.style.display = show ? 'flex' : 'none';
        if (!show) {
            uploadMonthName.value = '';
            uploadJsonFile.value = '';
            validateUploadForm();
        }
    }

    btnOpenUpload.addEventListener('click', () => toggleModal(true));
    btnCloseModal.addEventListener('click', () => toggleModal(false));
    btnCancelUpload.addEventListener('click', () => toggleModal(false));

    function validateUploadForm() {
        if (uploadMonthName.value.trim() && uploadJsonFile.files.length > 0) {
            btnSaveUpload.style.opacity = '1';
            btnSaveUpload.style.cursor = 'pointer';
        } else {
            btnSaveUpload.style.opacity = '0.5';
            btnSaveUpload.style.cursor = 'not-allowed';
        }
    }
    uploadMonthName.addEventListener('input', validateUploadForm);
    uploadJsonFile.addEventListener('change', validateUploadForm);

    // Swap Month Dataset
    monthSelector.addEventListener('change', (e) => {
        ACTIVE_MONTH = e.target.value;
        const rawData = JSON.parse(localStorage.getItem(DB_DATA_PREFIX + ACTIVE_MONTH) || "[]");
        GLOBAL_DATA = processData(rawData);

        choiceModule.removeActiveItems();
        choiceEnv.removeActiveItems();
        choiceResource.removeActiveItems();
        choiceStatus.removeActiveItems();

        document.getElementById('period-covered').innerHTML = `<strong style="color:white;">Month:</strong> ${ACTIVE_MONTH} &nbsp; | &nbsp; Prepared for Manager Review`;
        renderDashboard(GLOBAL_DATA); // Note: renderModuleChart handles Chart.getChart(id).destroy() automatically
    });

    // Delete Dataset
    btnDeleteDataset.addEventListener('click', () => {
        if (!ACTIVE_MONTH || ALL_MONTHS.length <= 1) {
            alert("Cannot delete the last remaining dataset.");
            return;
        }

        if (confirm(`Are you sure you want to delete the dataset for "${ACTIVE_MONTH}"?`)) {
            // Remove from local storage
            localStorage.removeItem(DB_DATA_PREFIX + ACTIVE_MONTH);

            // Remove from Index array
            ALL_MONTHS = ALL_MONTHS.filter(m => m !== ACTIVE_MONTH);
            localStorage.setItem(DB_INDEX_KEY, JSON.stringify(ALL_MONTHS));

            // Load the next available month
            ACTIVE_MONTH = ALL_MONTHS[0];
            const rawData = JSON.parse(localStorage.getItem(DB_DATA_PREFIX + ACTIVE_MONTH) || "[]");
            GLOBAL_DATA = processData(rawData);

            choiceModule.removeActiveItems();
            choiceEnv.removeActiveItems();
            choiceResource.removeActiveItems();
            choiceStatus.removeActiveItems();

            updateMonthDropdown();
            renderDashboard(GLOBAL_DATA);
        }
    });

    // Save New Dataset
    btnSaveUpload.addEventListener('click', () => {
        if (btnSaveUpload.style.cursor === 'not-allowed') return;

        const newMonthName = uploadMonthName.value.trim();
        const file = uploadJsonFile.files[0];

        const reader = new FileReader();
        const isExcel = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls') || file.name.toLowerCase().endsWith('.csv');

        reader.onload = (e) => {
            try {
                let data;
                if (isExcel) {
                    const workbook = XLSX.read(e.target.result, { type: 'array', cellDates: true });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    // Convert the Excel sheet exactly into the JSON array of objects we expect
                    // Using raw: false ensures Excel dates are formatted as readable strings instead of serial numbers
                    data = XLSX.utils.sheet_to_json(worksheet, { defval: "", raw: false, dateNF: "yyyy-mm-dd" });
                } else {
                    data = JSON.parse(e.target.result);
                }

                // Commit to browser storage
                if (!ALL_MONTHS.includes(newMonthName)) {
                    ALL_MONTHS.push(newMonthName);
                    localStorage.setItem(DB_INDEX_KEY, JSON.stringify(ALL_MONTHS));
                }
                localStorage.setItem(DB_DATA_PREFIX + newMonthName, JSON.stringify(data));

                // Switch Active Dataset
                ACTIVE_MONTH = newMonthName;
                GLOBAL_DATA = processData(data);

                updateMonthDropdown();
                toggleModal(false);

                choiceModule.removeActiveItems();
                choiceEnv.removeActiveItems();
                choiceResource.removeActiveItems();
                choiceStatus.removeActiveItems();
                renderDashboard(GLOBAL_DATA);
            } catch (err) {
                console.error(err);
                alert("Error parsing file. Please ensure it is a valid JSON, CSV, or Excel file.");
            }
        };

        if (isExcel) {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file);
        }
    });

    // Filters event listeners
    const reset = document.getElementById('btn-reset');

    const handleMultiSelectAll = (choiceInstance, event) => {
        if (event.detail.value === '') {
            // 'All' selected: remove all other active items
            const activeOptions = choiceInstance.getValue(true);
            const otherOptions = activeOptions.filter(v => v !== '');
            if (otherOptions.length > 0) {
                otherOptions.forEach(v => choiceInstance.removeActiveItemsByValue(v));
            }
        } else {
            // Something else selected: make sure 'All' is removed if present
            choiceInstance.removeActiveItemsByValue('');
        }
    };

    const filterModuleEl = document.getElementById('filter-module');
    filterModuleEl.addEventListener('addItem', (e) => handleMultiSelectAll(choiceModule, e));
    filterModuleEl.addEventListener('change', () => applyFilters());

    const filterEnvEl = document.getElementById('filter-env');
    filterEnvEl.addEventListener('addItem', (e) => handleMultiSelectAll(choiceEnv, e));
    filterEnvEl.addEventListener('change', () => applyFilters());

    const filterResourceEl = document.getElementById('filter-resource');
    filterResourceEl.addEventListener('addItem', (e) => handleMultiSelectAll(choiceResource, e));
    filterResourceEl.addEventListener('change', () => applyFilters());

    const filterStatusEl = document.getElementById('filter-status');
    // Note: status filter has standard initialization, so we manually manage it in applyFilters
    filterStatusEl.addEventListener('addItem', (e) => handleMultiSelectAll(choiceStatus, e));
    filterStatusEl.addEventListener('change', () => applyFilters());

    reset.addEventListener('click', () => {
        choiceModule.removeActiveItems();
        choiceEnv.removeActiveItems();
        choiceResource.removeActiveItems();
        choiceStatus.removeActiveItems();
        applyFilters();
    });

    function updateMonthDropdown() {
        monthSelector.innerHTML = '';
        ALL_MONTHS.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = m;
            if (m === ACTIVE_MONTH) opt.selected = true;
            monthSelector.appendChild(opt);
        });
        document.getElementById('period-covered').innerHTML = `<strong style="color:white;">Month:</strong> ${ACTIVE_MONTH} &nbsp; | &nbsp; Prepared for Manager Review`;

        // Show delete button only if there is more than 1 dataset
        btnDeleteDataset.style.display = ALL_MONTHS.length > 1 ? 'inline-block' : 'none';
    }

});

function applyFilters() {
    const modV = choiceModule.getValue(true) || [];
    const envV = choiceEnv.getValue(true) || [];
    const resV = choiceResource.getValue(true) || [];
    const statV = choiceStatus.getValue(true) || [];

    const isAnyFilterActive = modV.length > 0 || envV.length > 0 || resV.length > 0 || statV.length > 0;

    const filtered = GLOBAL_DATA.filter(d => {
        // If "All" (empty string) is in the array, or the array is empty, we pass it
        const passMod = modV.length === 0 || modV.includes('') || modV.includes(d.module);
        const passEnv = envV.length === 0 || envV.includes('') || envV.includes(d.environment);
        const passRes = resV.length === 0 || resV.includes('') || d.resource.some(r => resV.includes(r));

        let passStat = true;

        // Handle explicit "All" selection or no selection behaving similarly
        if (statV.length > 0 && !statV.includes('')) {
            if (statV.includes('Deployed') && d.is_deployed) passStat = true;
            else if (statV.includes('Pending') && !d.is_deployed) passStat = true;
            else passStat = false;

            if (statV.includes('Deployed') && statV.includes('Pending')) passStat = true;
        }

        return passMod && passEnv && passRes && passStat;
    });

    renderCoreAnalytics(GLOBAL_DATA); // Keep top stats global
    renderModuleInsights(filtered);

    // Toggle the visibility of the Merge Request Details section
    const mrSection = document.getElementById('mr-details-section');
    if (mrSection) {
        if (isAnyFilterActive) {
            mrSection.style.display = 'block';
            renderTable(filtered); // Only filter the table 
        } else {
            mrSection.style.display = 'none';
        }
    }
}


function parseDate(val) {
    if (!val) return null;
    if (val instanceof Date) {
        return isNaN(val.getTime()) ? null : val;
    }
    if (typeof val === 'number') {
        // Excel serial date
        if (val > 0 && val < 2958465) {
            return new Date(Math.round((val - 25569) * 86400 * 1000));
        }
    }
    if (typeof val === 'string') {
        let d = new Date(val.trim());
        return isNaN(d.getTime()) ? null : d;
    }
    return null;
}

function processData(rows) {
    let cleaned = [];
    rows.forEach((row, i) => {
        const keys = Object.keys(row);

        // Dynamic Key Finders
        const kMod = keys.find(k => k.toLowerCase().includes('module'));
        const kDesc = keys.find(k => k.toLowerCase().includes('desc'));
        let kEnv = keys.find(k => {
            let lk = k.toLowerCase();
            let clean = lk.replace(/[^a-z]/g, '');
            return clean === 'adminserverapp' || lk.includes('admin') || lk.includes('env') || lk.includes('platform') || lk.includes('app');
        });

        if (!kEnv) {
            // Fallback: search values to guess which column is the environment
            kEnv = keys.find(k => {
                let v = String(row[k] || '').toLowerCase();
                return v === 'server' || v.includes('admin panel') || v.includes('web app') || v === 'admin' || v === 'app';
            });
        }
        const kAuth = keys.find(k => {
            const lk = k.toLowerCase();
            return lk.includes('member') || lk.includes('resource') || lk.includes('author') || lk.includes('developer');
        });
        const kSent = keys.find(k => k.toLowerCase().includes('sent'));
        const kMerg = keys.find(k => k.toLowerCase().includes('merg'));
        const kDep = keys.find(k => k.toLowerCase().includes('deploy'));

        let mod = kMod ? String(row[kMod] || '').trim() : '';
        if (mod === "") mod = "Generic";

        let desc = kDesc ? String(row[kDesc] || 'No Description').trim() : 'No Description';

        let envRaw = kEnv ? String(row[kEnv] || 'Unknown').trim() : 'Unknown';
        let envLower = envRaw.toLowerCase();
        let env = 'APP';
        if (envLower.includes('admin')) env = 'Admin';
        else if (envLower.includes('server')) env = 'Server';
        else if (envLower.includes('web') || envLower.includes('wep')) env = 'Web App';

        let authorsRaw = kAuth ? String(row[kAuth] || 'Unassigned').trim() : 'Unassigned';
        let authorArray = authorsRaw.split(',').map(s => s.trim()).filter(s => s.length > 0);

        const sentDate = parseDate(kSent ? row[kSent] : null);
        const mergedDate = parseDate(kMerg ? row[kMerg] : null);
        const deployedDate = parseDate(kDep ? row[kDep] : null);

        let cycle = 0;

        if (sentDate && deployedDate) {
            cycle = Math.max(0, (deployedDate - sentDate) / (1000 * 60 * 60 * 24));
        } else if (sentDate && mergedDate) {
            cycle = Math.max(0, (mergedDate - sentDate) / (1000 * 60 * 60 * 24));
        }

        if (sentDate || mergedDate || deployedDate) {
            cleaned.push({
                idx: i + 1,
                module: mod,
                description: desc,
                environment: env,
                resource: authorArray,
                sent_to_merge_date: sentDate,
                merged_date: mergedDate,
                deployed_date: deployedDate,
                cycle_time: cycle,
                is_deployed: !!deployedDate,
                is_same_day: (deployedDate && mergedDate) ? (deployedDate.getTime() === mergedDate.getTime()) : false
            });
        }
    });

    // Sort by chronological order typically
    cleaned.sort((a, b) => {
        const dA = a.sent_to_merge_date || a.merged_date;
        const dB = b.sent_to_merge_date || b.merged_date;
        if (dA && dB) return dA - dB;
        return 0;
    });

    return cleaned;
}

function renderDashboard(data) {
    renderCoreAnalytics(data);
    updateFiltersDropdowns(data);
    renderModuleInsights(data);
    renderTable(data);
}

function renderCoreAnalytics(data) {
    if (!data || data.length === 0) return;

    // --- Core Aggregations ---
    const totalProcessed = data.length;
    let totalDeployed = 0;
    let sameDayDeploys = 0;
    let modMap = {};
    let envMap = { 'Server': 0, 'Admin': 0, 'APP': 0, 'Web App': 0 };

    let sumCycle = 0;
    let maxCycle = 0;
    let delayed5dCount = 0;

    // Date Range calculation
    let minDate = Date.now(), maxDate = 0;

    data.forEach(d => {
        if (d.is_deployed) totalDeployed++;
        if (d.is_same_day) sameDayDeploys++;

        sumCycle += d.cycle_time;
        if (d.cycle_time > maxCycle) maxCycle = d.cycle_time;
        if (d.cycle_time > 5 && d.is_deployed) delayed5dCount++;

        if (!modMap[d.module]) modMap[d.module] = 0;
        modMap[d.module]++;

        if (envMap[d.environment] === undefined) envMap[d.environment] = 0;
        envMap[d.environment]++;

        const compDate = d.sent_to_merge_date || d.merged_date;
        if (compDate) {
            if (compDate.getTime() < minDate) minDate = compDate.getTime();
            if (compDate.getTime() > maxDate) maxDate = compDate.getTime();
        }
    });

    const avgCycle = data.length > 0 ? sumCycle / data.length : 0;
    const deployRate = data.length > 0 ? (totalDeployed / data.length) * 100 : 0;
    const sameDayRate = totalDeployed > 0 ? (sameDayDeploys / totalDeployed) * 100 : 0;
    const activeMods = Object.keys(modMap).length;

    // Calculate > 2x Avg Cycle Outliers
    let outliers2x = 0;
    data.forEach(d => {
        if (d.is_deployed && avgCycle > 0 && d.cycle_time > (avgCycle * 2)) outliers2x++;
    });

    // Date formatting for subtitle
    let dateRangeText = "Date Range Unknown";
    if (maxDate > 0) {
        const dMin = new Date(minDate);
        const dMax = new Date(maxDate);
        const fmt = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        dateRangeText = `${dMin.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })} (${fmt(dMin)} - ${fmt(dMax)})`;
    }

    // Find top module
    let topModName = "-", topModVal = 0;
    Object.entries(modMap).forEach(([k, v]) => {
        if (v > topModVal) { topModVal = v; topModName = k; }
    });

    // --- HTML INJECTIONS ---
    document.getElementById('kpi-total').innerText = totalProcessed;
    document.getElementById('kpi-deploy-rate').innerText = deployRate.toFixed(1) + '%';
    document.getElementById('kpi-modules').innerText = activeMods;
    document.getElementById('kpi-avg-cycle').innerText = avgCycle.toFixed(1);
    document.getElementById('kpi-same-day').innerText = sameDayRate.toFixed(0) + '%';

    // Env Boxes
    const eGrid = document.getElementById('env-boxes');
    eGrid.innerHTML = '';
    Object.entries(envMap).sort((a, b) => b[1] - a[1]).forEach(env => {
        if (env[1] > 0) {
            eGrid.innerHTML += `
                <div class="env-box">
                    <h4>${env[1]}</h4>
                    <span>${env[0]}</span>
                </div>
            `;
        }
    });

    // Risks
    document.getElementById('risk-delayed').innerText = delayed5dCount;
    document.getElementById('risk-outliers').innerText = outliers2x;
    document.getElementById('risk-max').innerText = maxCycle.toFixed(1);

    // KPI Long Grid
    document.getElementById('kpi-long-total').innerText = totalProcessed;
    document.getElementById('kpi-long-dep-rate').innerText = deployRate.toFixed(1) + '%';
    document.getElementById('kpi-long-high-mod').innerText = `${topModName} (${topModVal} MRs)`;
    document.getElementById('kpi-long-avg-cycle').innerText = avgCycle.toFixed(1) + ' days';

    // --- Horizontal Bar Chart (Module Activity) ---
    renderModuleChart(modMap);
}

function renderModuleChart(modMap) {
    const chartId = 'moduleActivityChart';
    const oldChart = Chart.getChart(chartId);
    if (oldChart) oldChart.destroy();

    const sortedMods = Object.entries(modMap).sort((a, b) => b[1] - a[1]).slice(0, 5); // top 5
    const labels = sortedMods.map(m => m[0].length > 20 ? m[0].substring(0, 20) + '...' : m[0]);
    const values = sortedMods.map(m => m[1]);

    // Create soft gradient colors
    const colors = ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

    new Chart(document.getElementById(chartId), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderRadius: 4,
                barThickness: 16
            }]
        },
        options: {
            indexAxis: 'y', // Horizontal
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: '#334155' }
                },
                y: {
                    grid: { display: false }
                }
            }
        }
    });
}

function updateFiltersDropdowns(data) {
    const mods = Array.from(new Set(data.map(d => d.module))).sort();
    const envs = Array.from(new Set(data.map(d => d.environment))).sort();

    const resourceSet = new Set();
    data.forEach(d => {
        if (Array.isArray(d.resource)) {
            d.resource.forEach(r => resourceSet.add(r));
        }
    });
    const resources = Array.from(resourceSet).sort();

    // Populate choices dynamically with an "All" option at the top
    const allOpt = { value: '', label: 'All' };

    choiceModule.setChoices([allOpt, ...mods.map(m => ({ value: m, label: m }))], 'value', 'label', true);
    choiceEnv.setChoices([allOpt, ...envs.map(e => ({ value: e, label: e }))], 'value', 'label', true);
    choiceResource.setChoices([allOpt, ...resources.map(r => ({ value: r, label: r }))], 'value', 'label', true);
}

function renderTable(data) {
    const tbody = document.querySelector('#detailsTable tbody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:#94a3b8;">No records match filters.</td></tr>`;
        return;
    }

    const fmt = (d) => d ? d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' }) : '-';

    data.forEach(d => {
        const badgeClass = d.is_deployed ? 'status-deployed' : 'status-pending';
        const badgeText = d.is_deployed ? 'deployed' : 'pending';
        const descStr = d.description.length > 40 ? d.description.substring(0, 40) + '...' : d.description;

        tbody.innerHTML += `
            <tr>
                <td style="color:#94a3b8;">${d.idx}</td>
                <td><strong>${d.module}</strong></td>
                <td title="${d.description}">${descStr}</td>
                <td>${d.environment}</td>
                <td>${fmt(d.sent_to_merge_date)}</td>
                <td>${fmt(d.merged_date)}</td>
                <td>${fmt(d.deployed_date)}</td>
                <td style="color:white;font-weight:600;">${d.cycle_time.toFixed(0)}d</td>
                <td><span class="status-badge ${badgeClass}">${badgeText}</span></td>
            </tr>
        `;
    });
}

function renderModuleInsights(data) {
    const grid = document.getElementById('module-insights-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (!data || data.length === 0) {
        grid.innerHTML = '<div style="color:var(--text-muted); grid-column: 1 / -1; text-align: center; padding: 20px;">No insights available for current filter.</div>';
        return;
    }

    // Group data by module
    const modulesMap = {};
    data.forEach(d => {
        if (!modulesMap[d.module]) {
            modulesMap[d.module] = [];
        }
        modulesMap[d.module].push(d);
    });

    // Sort modules by activity (most MRs first)
    const sortedModules = Object.entries(modulesMap).sort((a, b) => b[1].length - a[1].length);

    sortedModules.forEach(([moduleName, tasks], index) => {
        // Create card container
        const card = document.createElement('div');
        card.className = 'module-card animate-slide-up';
        card.style.animationDelay = `${0.1 + (Math.min(index, 10) * 0.05)}s`;

        // Header
        const header = document.createElement('div');
        header.className = 'module-card-header';
        header.onclick = () => {
            const content = card.querySelector('.module-card-content');
            const isCurrentlyExpanded = content.classList.contains('expanded');

            // Collapse all other expanded cards first
            const allCards = grid.querySelectorAll('.module-card');
            allCards.forEach(c => {
                c.style.zIndex = '1';
                const cContent = c.querySelector('.module-card-content');
                if (cContent) cContent.classList.remove('expanded');
            });

            // If the clicked card wasn't already expanded, expand it
            if (!isCurrentlyExpanded) {
                card.style.zIndex = '100'; // Bring to front
                content.classList.add('expanded');
            }
        };

        header.innerHTML = `
            <h4 class="module-card-title">${moduleName}</h4>
            <span class="module-card-count">${tasks.length} Task${tasks.length !== 1 ? 's' : ''}</span>
        `;

        // Content
        const content = document.createElement('div');
        content.className = 'module-card-content';

        tasks.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = 'task-item';

            // Resources formatting
            const resourcesHtml = task.resource && task.resource.length > 0
                ? task.resource.map(r => `<span class="resource-tag">👤 ${r}</span>`).join('')
                : `<span class="resource-tag" style="color:var(--text-muted); border-color:var(--border); background:transparent;">Unassigned</span>`;

            taskEl.innerHTML = `
                <div class="task-desc">${task.description || 'No description provided.'}</div>
                <div class="resource-tags">${resourcesHtml}</div>
            `;
            content.appendChild(taskEl);
        });

        card.appendChild(header);
        card.appendChild(content);
        grid.appendChild(card);
    });
}

// Global click listener to close module insights when clicking outside
document.addEventListener('click', (event) => {
    const isClickInsideModuleCard = event.target.closest('.module-card');

    // If the click is not inside any module card, collapse all expanded cards
    if (!isClickInsideModuleCard) {
        const grid = document.getElementById('module-insights-grid');
        if (!grid) return;

        const allCards = grid.querySelectorAll('.module-card');
        allCards.forEach(c => {
            c.style.zIndex = '1';
            const content = c.querySelector('.module-card-content');
            if (content) content.classList.remove('expanded');
        });
    } else {
        // If they click INSIDE a module card, but it's not the expanded one, 
        // collapse other cards. (Handled by the header click listener already)
        // However, if they click inside the opened card *content* area, we shouldn't close it.
        // If they click on another card's area handled naturally by the loop in header onClick
    }
});

