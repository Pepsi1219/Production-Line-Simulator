let operations = [
    { id: "1", sam: 19.62, amv: 29.62, op: 0.6, isEditing: false },
    { id: "2", sam: 12.34, amv: 17.34, op: 0.3, isEditing: false },
    { id: "3", sam: 13.83, amv: 20.83, op: 0.3, isEditing: false },
    { id: "4", sam: 24.53, amv: 34.53, op: 0.6, isEditing: false },
    { id: "5", sam: 22.43, amv: 27.43, op: 0.6, isEditing: false },
    { id: "6", sam: 32.47, amv: 35.47, op: 0.9, isEditing: false },
    { id: "7", sam: 21.44, amv: 29.44, op: 0.6, isEditing: false },
    { id: "8", sam: 82.79, amv: 103.49, op: 2.7, isEditing: false },
    { id: "9", sam: 48.41, amv: 48.41, op: 1.6, isEditing: false },
    { id: "10", sam: 26.80, amv: 29.80, op: 0.9, isEditing: false },
    { id: "11", sam: 13.13, amv: 16.13, op: 0.4, isEditing: false },
    { id: "12", sam: 42.16, amv: 49.60, op: 1.5, isEditing: false },
    { id: "13", sam: 27.88, amv: 35.88, op: 0.5, isEditing: false },
    { id: "14", sam: 31.45, amv: 37.00, op: 1.0, isEditing: false },
    { id: "15", sam: 55.34, amv: 72.00, op: 1.5, isEditing: false },
    { id: "16", sam: 16.00, amv: 32.00, op: 0.5, isEditing: false },
    { id: "17", sam: 57.01, amv: 77.00, op: 1.5, isEditing: false },
    { id: "18", sam: 27.64, amv: 48.00, op: 1.0, isEditing: false },
    { id: "19", sam: 23.21, amv: 43.00, op: 0.5, isEditing: false },
    { id: "20", sam: 24.29, amv: 34.29, op: 0.5, isEditing: false },
    { id: "21", sam: 29.16, amv: 42.00, op: 0.8, isEditing: false },
    { id: "22", sam: 40.09, amv: 58.00, op: 0.7, isEditing: false }
];

    let myChart = null; // ประกาศแค่ครั้งเดียวที่ส่วนหัวของสคริปต์

    // 2. Initialize Sortable (ให้รันหลังจาก DOM โหลดเสร็จ)
    document.addEventListener('DOMContentLoaded', () => {
        const el = document.getElementById('opTableBody');
        if (el) {
            Sortable.create(el, {
                animation: 150,
                handle: '.drag-handle',
                onEnd: function (evt) {
                    const movedItem = operations.splice(evt.oldIndex, 1)[0];
                    operations.splice(evt.newIndex, 0, movedItem);
                    simulate();
                }
            });
        }
        simulate();
    });

    // 3. Management Functions
    function addOperation() {
        const no = document.getElementById('newOpNo').value;
        const sam = parseFloat(document.getElementById('newSAM').value);
        const amv = parseFloat(document.getElementById('newAMV').value);
        const op = parseFloat(document.getElementById('newOp').value);

        if(no && !isNaN(sam) && !isNaN(amv) && !isNaN(op)) {
            operations.push({ id: no, sam, amv, op, isEditing: false });
            simulate();
            ['newOpNo', 'newSAM', 'newAMV', 'newOp'].forEach(id => document.getElementById(id).value = '');
        }
    }

    function toggleEdit(index) {
        operations[index].isEditing = !operations[index].isEditing;
        simulate();
    }

    function saveEdit(index) {
        operations[index].sam = parseFloat(document.getElementById(`editSAM-${index}`).value);
        operations[index].amv = parseFloat(document.getElementById(`editAMV-${index}`).value);
        operations[index].op = parseFloat(document.getElementById(`editOp-${index}`).value);
        operations[index].isEditing = false;
        simulate();
    }

    function deleteOperation(index) { 
        if(confirm('ต้องการลบขั้นตอนนี้ใช่หรือไม่?')) { 
            operations.splice(index, 1); 
            simulate(); 
        } 
    }

    // 4. Core Logic
    function simulate() {
    // 1. ดึงค่าเริ่มต้นจาก Input ของระบบ
    const allCycleTimes = operations.map(item => item.amv / item.op);
    const maxCycleValue = Math.max(...allCycleTimes);
    const demand = parseFloat(document.getElementById('targetDemand')?.value) || 0;
    const days = parseFloat(document.getElementById('targetDays')?.value) || 1;
    const taktTime = (demand > 0) ? (7 * 3600 * days / demand) : 0;
    const reqOutHr = (demand > 0) ? (demand / (7 * days)) : 0;
    const hours = parseInt(document.getElementById('simHours')?.value) || 1;

    // Helper Function สำหรับอัปเดต UI ที่อาจจะยังเหลืออยู่ (แบบปลอดภัย)
    const setSafeText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
    };

    const tbody = document.getElementById('opTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    // 2. เตรียมตัวแปรสำหรับเก็บผลลัพธ์
    let labels = [], wipData = [], capData = [], outputData = [], layoutInfo = [];
    let totalSAM = 0, totalAMV = 0, totalOp = 0, maxCycleTime = 0;

    // คำนวณเบื้องต้นของแต่ละขั้นตอน
    let stepResults = operations.map(item => {
        const capHr = Math.floor((3600 / item.amv) * item.op);
        const cycleTime = item.amv / item.op;
        return { ...item, capHr, cycleTime };
    });

    // 3. คำนวณ WIP และ Flow การผลิต (Process Logic)
    stepResults.forEach((item, index) => {
        const isBottleneck = item.cycleTime.toFixed(2) === maxCycleValue.toFixed(2);
        
      
        const totalCap = item.capHr * hours;
        let inputFromPrev = (index === 0) ? totalCap : stepResults[index - 1].passed;
        let actualProcessed = Math.min(inputFromPrev, totalCap);
        let nextCap = (index === stepResults.length - 1) ? actualProcessed : (stepResults[index + 1].capHr * hours);
        
        let wip = actualProcessed - nextCap;
        let passed = (index > 0) ? Math.min(actualProcessed, item.capHr) : actualProcessed;

        item.passed = passed;
        
        
        
        // เก็บข้อมูลสำหรับกราฟ
        labels.push("Op " + item.id);
        wipData.push(wip);
        capData.push(item.capHr);
        outputData.push(passed);
        

        // เก็บข้อมูลสำหรับส่งให้ Production Layout
        layoutInfo.push({ 
            id: item.id, 
            isBottleneck: item.cycleTime > taktTime,
            op: item.op,
            sam: item.sam,
            amv: item.amv,
            operator: item.operator 
        });

        // สะสมค่า Summary
        totalSAM += item.sam;
        totalAMV += item.amv;
        totalOp += item.op;
        if (item.cycleTime > maxCycleTime) maxCycleTime = item.cycleTime;

        // วาดแถวในตาราง
        tbody.innerHTML += `
            <tr class="${item.isEditing ? 'bg-yellow-50' : 'hover:bg-slate-50'} border-b text-xs">
                <td class="p-2 drag-handle cursor-move text-lg text-center text-slate-400">☰</td>
                <td class="p-2 font-bold text-slate-700 text-center">${item.id}</td>
                <td class="p-2">${item.process}</td>
                <td class="p-2 text-center font-mono">${item.isEditing ? `<input type="number" id="editSAM-${index}" value="${item.sam}" class="w-12 border rounded px-1">` : item.sam.toFixed(2)}</td>
                
                <td class="p-2 text-center font-mono">${item.isEditing ? `<input type="number" id="editAMV-${index}" value="${item.amv}" class="w-12 border rounded px-1">` : item.amv.toFixed(2)}</td>
                
                <td class="p-2 text-center font-bold ${((item.sam/item.amv)*100) >= 75 ? 'text-green-600' : 'text-red-600'}">
                    ${((item.sam/item.amv)*100).toFixed(0)}%
                </td>
                
                <td class="p-2 text-center font-semibold text-indigo-600">${item.isEditing ? `<input type="number" id="editOp-${index}" value="${item.op}" class="w-12 border rounded px-1">` : item.op}</td>

                <td class="p-2 text-center font-bold ${isBottleneck ? 'text-red-600 bg-red-50' : ''}">
                ${item.cycleTime.toFixed(1)}
            </td>
                
                <td class="p-2 text-center font-bold text-slate-700">${item.capHr}</td>
                
                <td class="p-2 text-center font-black ${wip > 0 ? 'text-orange-500' : 'text-slate-300'}">${wip.toLocaleString()}</td>
                <td class="p-2 text-center font-black text-green-700 bg-green-50/50">${passed.toLocaleString()}</td>
                
                <td class="p-2 text-center text-slate-500 italic">${item.operator || '-'}</td>
                
                <td class="p-2">
                    <div class="flex gap-1 justify-center">
                        ${item.isEditing ? 
                            `<button onclick="saveEdit(${index})" class="bg-green-600 text-white px-2 py-0.5 rounded text-[10px]">Save</button>` : 
                            `<button onclick="toggleEdit(${index})" class="text-blue-600 border border-blue-200 px-2 py-0.5 rounded text-[10px]">Edit</button>`
                        }
                        <button onclick="deleteOperation(${index})" class="text-red-400 text-[10px] ml-1">DEL</button>
                    </div>
                </td>
            </tr>`;
    });

    // 4. คำนวณตัวชี้วัดประสิทธิภาพ
    const pitchTime = totalOp > 0 ? (totalSAM / totalOp) : 0;
    const balance = (maxCycleTime > 0 && totalOp > 0) 
                    ? (totalSAM / (maxCycleTime * totalOp)) * 100 
                    : 0;
    const lineOutputHr = maxCycleTime > 0 ? Math.floor(3600 / maxCycleTime) : 0;
      

    // 5. รวบรวมข้อมูลทั้งหมดส่งไปยังส่วนต่างๆ
    const currentMetrics = {
        totalSAM,
        totalAMV,
        totalOp,
        avgEff: totalAMV > 0 ? (totalSAM / totalAMV) * 100 : 0,
        balance,
        pitchTime,
        ucl: pitchTime * 1.05,
        lcl: pitchTime * 0.95,
        maxCycle: maxCycleTime,
        output: lineOutputHr,
        taktReq: taktTime,
        targetHr: reqOutHr
    };

    // อัปเดตข้อมูลสรุปแบบกระจายศูนย์
    setSafeText('sumSAM', totalSAM.toFixed(1));
    setSafeText('sumAMV', totalAMV.toFixed(1));
    setSafeText('sumOp', totalOp.toFixed(1));
    setSafeText('avgEff', currentMetrics.avgEff.toFixed(1) + "%");
    setSafeText('balance', balance.toFixed(1) + "%");
    setSafeText('pitchTime', pitchTime.toFixed(1));
    setSafeText('uclTime', currentMetrics.ucl.toFixed(1));
    setSafeText('lclTime', currentMetrics.lcl.toFixed(1));
    setSafeText('maxCycle', maxCycleTime.toFixed(1));
    setSafeText('totalOutputPcs', lineOutputHr.toFixed(0));
    setSafeText('calcTaktTime', taktTime.toFixed(0));
    setSafeText('reqOutputHr', reqOutHr.toFixed(0));

    // 6. เรียกฟังก์ชันแสดงผลกราฟและแผนผังโรงงาน
    if (typeof updateChart === 'function') {
        updateChart(labels, wipData, capData, reqOutHr);
    }
    
    if (typeof updateLayout === 'function') {
        updateLayout(layoutInfo, currentMetrics); 
    }
    if (typeof updateChart === 'function') {
    updateChart(labels, wipData, capData, reqOutHr, outputData); 
}
}

    // Visual Layout
    function updateLayout(info, metricsData = {}) {
    // --- ส่วนที่ปรับปรุง: วาด Quick Dashboard จากข้อมูลที่รับเข้ามาโดยตรง ---
    const summaryHeader = document.getElementById('layoutSummaryHeader');
    
    if (summaryHeader) {
        // ดึงค่าจาก metricsData (ถ้าไม่มีค่าให้ใช้ Default เป็น 0)
        const {
            totalSAM = 0,
            totalAMV = 0,
            totalOp = 0,
            avgEff = 0,
            balance = 0,
            pitchTime = 0,
            ucl = 0,
            lcl = 0,
            maxCycle = 0,
            output = 0,
            taktReq = 0,
            targetHr = 0
        } = metricsData;

        // กำหนดเงื่อนไขสีตาม Logic ที่คุณต้องการ
        const metrics = [
            { 
                label: 'Total SAM', 
                val: totalSAM.toFixed(1), 
                color: 'text-slate-600' 
            },
            { 
                label: 'Total AMV', 
                val: totalAMV.toFixed(1), 
                color: totalAMV <= totalSAM ? 'text-green-600' : 'text-red-600' 
            },
            { 
                label: 'Total Op', 
                val: totalOp.toFixed(1), 
                color: 'text-blue-600' 
            },
            { 
                label: 'Avg Eff', 
                val: avgEff.toFixed(1) + "%", 
                color: avgEff >= 80 ? 'text-green-600' : 'text-red-600' 
            },
            { 
                label: 'Balance', 
                val: balance.toFixed(1) + "%", 
                color: balance >= 95 ? 'text-green-600' : 'text-red-600' 
            },
            { 
                label: 'Pitch Time', 
                val: pitchTime.toFixed(1), 
                color: 'text-orange-600' 
            },
            { 
                label: 'UCL', 
                val: ucl.toFixed(1), 
                color: 'text-slate-500' 
            },
            { 
                label: 'LCL', 
                val: lcl.toFixed(1), 
                color: 'text-slate-500' 
            },
            { 
                label: 'Max Cycle', 
                val: maxCycle.toFixed(1), 
                color: maxCycle <= taktReq ? 'text-green-600' : 'text-red-600' 
            },
            { 
                label: 'Output', 
                val: Math.floor(output).toLocaleString(), 
                color: output >= targetHr ? 'text-green-600' : 'text-red-600' 
            }
        ];

        // วาด Dashboard ลงใน Header
        summaryHeader.className = "grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2 mb-6";
        summaryHeader.innerHTML = metrics.map(m => `
            <div class="bg-white border border-slate-200 p-2 rounded-xl text-center shadow-sm transition-all hover:shadow-md">
                <div class="text-[9px] uppercase text-slate-400 font-bold tracking-tighter leading-tight">${m.label}</div>
                <div class="text-sm font-black ${m.color}">${m.val}</div>
            </div>
        `).join('');
    }

    // --- ส่วนการวาดแผนผังโรงงาน (Factory Layout) ---
    const layoutDiv = document.getElementById('factoryLayout');
    if (!layoutDiv) return;
    
    layoutDiv.innerHTML = '';
    // Container หลัก พร้อมสไตล์ที่คุณกำหนด
    layoutDiv.className = "flex flex-col items-center w-full gap-y-8 p-6 bg-slate-50 rounded-3xl border border-slate-200 shadow-inner overflow-hidden";

    const workerColors = [
        '#FF1493', '#7CFC00', '#1E90FF', '#FF6347', '#32CD32', 
        '#8A2BE2', '#FF8C00', '#00CED1', '#9370DB', '#ADFF2F', 
        '#DC143C', '#40E0D0', '#228B22', '#FF69B4', '#4B0082', 
        '#FFA500', '#008000', '#FF00FF', '#0000FF', '#FFD700'
    ];

    const totalSteps = info.length;
    const mid = Math.ceil(totalSteps / 2);
    
    // คำนวณ Scale เพื่อให้หดอยู่ในหน้าจอเดียว
    let scale = mid > 12 ? (mid > 18 ? 0.6 : 0.8) : 1;

    // --- ส่วนที่ 1: Pre-calculation ลำดับพนักงาน (Worker Flow) ---
    let tempWorkerIndex = 0;
    let tempWorkerLoad = 0;
    
    const stationWorkerMap = info.map(s => {
        let workersForThisStation = [];
        let remainingOp = parseFloat(s.op);
        
        while (remainingOp > 0.001) {
            let canTake = Math.min(remainingOp, 1 - tempWorkerLoad);
            workersForThisStation.push({
                workerId: tempWorkerIndex + 1,
                color: workerColors[tempWorkerIndex % workerColors.length],
                assign: (canTake * 100).toFixed(0),
                percent: (canTake / 1) * 100
            });
            
            tempWorkerLoad += canTake;
            remainingOp -= canTake;
            if (tempWorkerLoad >= 0.99) { tempWorkerIndex++; tempWorkerLoad = 0; }
        }
        return workersForThisStation;
    });

    // --- ส่วนที่ 2: ฟังก์ชันวาดรูปคน (รองรับการเรียงกลับด้านในแถวล่าง) ---
    const getWorkerIconsHtml = (stationIdx, isBottomRow) => {
        let html = '';
        const workers = stationWorkerMap[stationIdx];
        
        // ถ้าเป็นแถวล่าง ให้พนักงานเรียงขวาไปซ้าย (flex-row-reverse)
        const rowDirection = isBottomRow ? "flex-row-reverse" : "flex-row";
        
        html += `<div class="flex ${rowDirection} gap-1">`;
        workers.forEach(w => {
            const iconSize = 18 * scale; 
            html += `
                <div class="relative group flex items-center justify-center" style="width: ${12 * scale}px; height: ${24 * scale}px; cursor: help;">
                    <i class="fas fa-user text-slate-200 absolute opacity-30" style="font-size: ${iconSize}px;"></i>
                    <i class="fas fa-user absolute" style="color: ${w.color}; clip-path: inset(${100 - w.percent}% 0 0 0); font-size: ${iconSize}px;"></i>
                    
                    <div class="absolute bottom-full mb-2 hidden group-hover:block z-[100] bg-slate-900 text-white p-2 rounded-lg shadow-2xl text-[9px] min-w-max pointer-events-none">
                        <div class="flex flex-col gap-1">
                            <div><span class="text-slate-400 italic">Operator:</span> <span class="font-bold text-blue-400">${w.workerId}</span></div>
                            <div><span class="text-slate-400 italic">Assign:</span> <span class="font-bold text-white">${w.assign}%</span></div>
                        </div>
                    </div>
                </div>`;
        });
        html += `</div>`;
        return html;
    };

    // --- ส่วนที่ 3: ฟังก์ชันวาดแต่ละสถานี (Station Box) ---
    const createStationHtml = (s, actualIndex, isBottomRow) => {
    const bgColor = s.isBottleneck ? 'bg-red-500' : 'bg-indigo-600';
    const boxSize = 50 * scale;
    
    return `
        <div class="flex flex-col items-center cursor-move drag-item-layout" data-index="${actualIndex}">
            <div class="flex justify-center gap-1 mb-2" style="min-height: ${30 * scale}px;">
                ${getWorkerIconsHtml(actualIndex, isBottomRow)}
            </div>
            
            <div class="${bgColor} rounded-xl text-white flex flex-col items-center justify-center shadow-lg border-2 border-white relative transition-all"
                 style="width: ${boxSize}px; height: ${boxSize}px;">
                
                <span style="font-size: ${10 * scale}px; font-weight: bold;">Op ${s.id}</span>

                <input type="number" 
                       step="0.1"
                       value="${s.op}" 
                       class="absolute -bottom-2 bg-white text-slate-700 w-12 text-center rounded-full shadow-md border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                       style="font-size: ${8 * scale}px; font-weight: 900; padding: 2px 0;"
                       onchange="updateOpValue(${actualIndex}, this.value)"
                       onclick="event.stopPropagation()" 
                >
                </div>
        </div>`;
};

    // --- ส่วนที่ 4: ประกอบ Layout แถวบนและล่าง ---
    // แถวบน (Flow: ซ้ายไปขวา)
    let topHtml = `<div id="layoutTopRow" class="sortable-row flex justify-center items-end w-full gap-x-4 min-h-[120px]">`;
    for (let i = 0; i < mid; i++) {
        topHtml += createStationHtml(info[i], i, false);
    }
    topHtml += `</div>`;

    // เส้น Flow ตรงกลาง
    const flowLine = `
        <div class="w-full flex items-center gap-2 px-4 opacity-50">
            <div class="h-[1px] flex-grow bg-slate-300"></div>
            <div class="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Production Flow</div>
            <div class="h-[1px] flex-grow bg-slate-300"></div>
        </div>
    `;

    // แถวล่าง (Flow: ขวาไปซ้าย)
    let botHtml = `<div id="layoutBotRow" class="sortable-row flex justify-center items-end w-full gap-x-4 min-h-[120px]">`;
    for (let i = info.length - 1; i >= mid; i--) {
        botHtml += createStationHtml(info[i], i, true);
    }
    botHtml += `</div>`;

    // ใส่ HTML ทั้งหมดลงใน Container
    layoutDiv.innerHTML = topHtml + flowLine + botHtml;

    // เปิดใช้งานระบบลากวางข้ามแถว
    if (typeof initLayoutSortable === 'function') {
        initLayoutSortable();
    }
}


function initLayoutSortable() {
    const config = {
        group: 'shared-layout', // ชื่อกลุ่มต้องเหมือนกันทั้งบนและล่าง
        animation: 150,
        draggable: ".drag-item-layout",
        ghostClass: "opacity-25", // แสดงเงาขณะลาก
        onEnd: function (evt) {
            // ฟังก์ชันดึงลำดับใหม่หลังจากลากสลับ (เหมือนเดิม)
            const newOrder = [];
            
            // ดึงจากแถวบน
            document.querySelectorAll('#layoutTopRow .drag-item-layout').forEach(el => {
                newOrder.push(parseInt(el.getAttribute('data-index')));
            });
            
            // ดึงจากแถวล่าง (สำหรับแผนผังโรงงาน แถวล่างมักจะย้อนกลับ)
            const botItems = [];
            document.querySelectorAll('#layoutBotRow .drag-item-layout').forEach(el => {
                botItems.push(parseInt(el.getAttribute('data-index')));
            });
            // ถ้างผังของคุณออกแบบมาให้เดินเป็นตัว U แถวล่างต้อง .reverse() ก่อน push เข้า newOrder
            newOrder.push(...botItems.reverse());

            // อัปเดตข้อมูลกลางและรัน Simulation ใหม่
            const updatedOps = newOrder.map(idx => operations[idx]);
            operations = updatedOps;
            simulate(); 
        }
    };

    if (typeof Sortable !== 'undefined') {
        // ประกาศใช้งานทั้งสองแถวด้วย Config เดียวกัน
        new Sortable(document.getElementById('layoutTopRow'), config);
        new Sortable(document.getElementById('layoutBotRow'), config);
    }
}


let showOutputInsteadOfCap = false;
    function updateChart(labels, wipData, capData, target, outputData = []) {
    const canvas = document.getElementById('lineChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (myChart) { myChart.destroy(); }

    const maxWip = Math.max(...wipData);
    const bottleneckIndex = wipData.indexOf(maxWip);

    // เลือกว่าจะแสดงข้อมูลชุดไหนระหว่าง Capacity หรือ Output
    const secondaryData = showOutputInsteadOfCap ? outputData : capData;
    const secondaryLabel = showOutputInsteadOfCap ? 'Actual Output' : 'Capacity';
    const secondaryColor = showOutputInsteadOfCap ? '#0ea5e9' : '#15803d'; // สีฟ้าสำหรับ Output, เขียวสำหรับ Cap

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'WIP',
                    data: wipData,
                    backgroundColor: wipData.map((wip, i) => (wip > capData[i]) ? '#dc2626' : '#f97316'),
                    borderRadius: 4,
                    order: 2
                },
                {
                    label: secondaryLabel, // เปลี่ยนชื่อตามปุ่มที่กด
                    data: secondaryData,   // เปลี่ยนข้อมูลตามปุ่มที่กด
                    backgroundColor: secondaryColor,
                    borderRadius: 4,
                    order: 2
                },
                {
                    label: 'Target Output',
                    data: labels.map(() => target),
                    type: 'line',
                    borderColor: '#1e40af',
                    borderWidth: 1.5,
                    borderDash: [8, 5],
                    pointRadius: 0,
                    fill: false,
                    order: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        afterBody: function(context) {
                            const i = context[0].dataIndex;
                            let status = "";
                            if (wipData[i] > capData[i]) status += "⚠ Over Capacity\n";
                            if (i === bottleneckIndex && wipData[i] > 0) status += "🚨 Bottleneck\n";
                            if (outputData[i] < target) status += "📉 Below Target";
                            return status || "✔ Normal Flow";
                        }
                    }
                }
            },
            scales: {
                y: { beginAtZero: true },
                x: { grid: { display: false } }
            }
        }
    });
}

    function toggleChartMode() {
    showOutputInsteadOfCap = !showOutputInsteadOfCap; // สลับค่า true/false
    
    const btn = document.getElementById('chartToggleButton');
    if (showOutputInsteadOfCap) {
        btn.innerText = "Show Capacity";
        btn.classList.add('bg-indigo-600', 'text-white');
    } else {
        btn.innerText = "Show Actual Output";
        btn.classList.remove('bg-indigo-600', 'text-white');
    }
    
    // เรียก simulate ใหม่เพื่ออัปเดตกราฟด้วยข้อมูลล่าสุด
    simulate(); 
}



    function changeHour(val) {
        let input = document.getElementById('simHours');
        let newVal = parseInt(input.value) + val;
        if (newVal >= 1) { input.value = newVal; simulate(); }
    }
function updateOpValue(index, newValue) {
    const val = parseFloat(newValue);
    
    // ตรวจสอบความถูกต้องของข้อมูล
    if (isNaN(val) || val < 0) {
        alert("กรุณากรอกตัวเลขที่ถูกต้อง");
        simulate(); // วาดใหม่เพื่อคืนค่าเดิม
        return;
    }

    // 1. อัปเดตค่าใน Array หลัก (ชื่อตัวแปร operations ของคุณ)
    if (typeof operations !== 'undefined' && operations[index]) {
        operations[index].op = val;
        
        // 2. ถ้าในตารางมีสถานะการ Edit อยู่ ให้ยกเลิกก่อนเพื่อให้ข้อมูล Sync กัน
        operations[index].isEditing = false;
        
        // 3. รันการคำนวณใหม่ (WIP, Capacity) และวาดกราฟ/ผังใหม่ทั้งหมด
        if (typeof simulate === 'function') {
            console.log(`Updated Op ${operations[index].id} to ${val}`);
            simulate(); 
        }
    }
}
