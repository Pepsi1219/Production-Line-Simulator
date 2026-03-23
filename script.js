let operations = [
    { id: "1", sam: 18.37, amv: 21.31, op: 0.5, isEditing: false },
    { id: "2", sam: 38.43, amv: 43.43, op: 0.5, isEditing: false },
    { id: "3", sam: 34.84, amv: 39.84, op: 0.5, isEditing: false },
    { id: "4", sam: 25.47, amv: 27.23, op: 0.5, isEditing: false },
    { id: "5", sam: 7.64, amv: 14.14, op: 0.5, isEditing: false },
    { id: "6", sam: 13.69, amv: 27.69, op: 0.5, isEditing: false },
    { id: "7", sam: 16.77, amv: 21.33, op: 0.5, isEditing: false },
    { id: "8", sam: 33.50, amv: 37.22, op: 0.5, isEditing: false },
    { id: "9", sam: 23.83, amv: 34.34, op: 0.5, isEditing: false },
    { id: "10", sam: 22.60, amv: 23.00, op: 0.5, isEditing: false },
    { id: "11", sam: 31.48, amv: 40.48, op: 0.5, isEditing: false },
    { id: "12", sam: 22.06, amv: 25.00, op: 0.5, isEditing: false },
    { id: "13", sam: 17.12, amv: 19.12, op: 0.5, isEditing: false },
    { id: "14", sam: 13.87, amv: 18.00, op: 0.5, isEditing: false },
    { id: "15", sam: 83.41, amv: 98.00, op: 0.5, isEditing: false },
    { id: "16", sam: 47.35, amv: 55.00, op: 0.5, isEditing: false },
    { id: "17", sam: 33.14, amv: 45.00, op: 0.5, isEditing: false },
    { id: "18", sam: 13.69, amv: 19.00, op: 0.5, isEditing: false },
    { id: "19", sam: 23.33, amv: 27.33, op: 0.5, isEditing: false },
    { id: "20", sam: 40.28, amv: 48.28, op: 0.5, isEditing: false },
    { id: "21", sam: 41.75, amv: 46.75, op: 0.5, isEditing: false },
    { id: "22", sam: 35.29, amv: 39.29, op: 0.5, isEditing: false },
    { id: "23", sam: 39.38, amv: 51.38, op: 0.5, isEditing: false },
    { id: "24", sam: 39.76, amv: 49.76, op: 0.5, isEditing: false }
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
    // กลุ่มค่าจาก Input (ดึงจาก DOM)
    const demand = parseFloat(document.getElementById('targetDemand')?.value) || 0; // ความต้องการของลูกค้า (ชิ้น)
    const days = parseFloat(document.getElementById('targetDays')?.value) || 1; // จำนวนวันที่ใช้ในการผลิต
    const packsize = parseFloat(document.getElementById('packSize')?.value) || 1; // จำนวนบรรจุ
    const hours = parseInt(document.getElementById('simHours')?.value) || 1; // จำนวนชั่วโมงที่ต้องการจำลอง

    // กลุ่มค่าคำนวณจาก Operations
    const allCycleTimes = operations.map(item => item.amv / item.op); // ค่า Cycle Time ของทุกสถานี
    const maxCycleValue = Math.max(...allCycleTimes); // ค่า Cycle Time สูงสุด

    // กลุ่มค่าคำนวณจาก Input
    const taktTime = (demand > 0) ? (7 * 3600 * days / demand) : 0; // จังหวะการผลิต (วินาที/ชิ้น)
    const reqOutHr = (demand > 0) ? (demand / (7 * days)) : 0; // ผลผลิตที่ต้องการต่อชั่วโมง
     

    // กลุ่ม Helper & DOM
    const setSafeText = (id, value) => {const el = document.getElementById(id); // อัปเดตข้อความใน DOM แบบปลอดภัย
    if (el) el.innerText = value;
    };
    const tbody = document.getElementById('opTableBody'); // DOM element ของตาราง
    if (!tbody) return;
    tbody.innerHTML = '';

    // เตรียมตัวแปรสำหรับเก็บผลลัพธ์
    let labels = [], wipData = [], capData = [], outputData = [], layoutInfo = [];
    let totalSAM = 0, totalAMV = 0, totalOp = 0, maxCycleTime = 0;

    // คำนวณเบื้องต้นของแต่ละขั้นตอน
    let stepResults = operations.map(item => {const capHr = Math.floor((3600 / item.amv) * item.op); // ข้อมูลสถานี + capHr, cycleTime
    const cycleTime = item.amv / item.op;
    return { ...item, capHr, cycleTime };
    });

    // ตัวแปรใน loop forEach (แต่ละสถานี)
    stepResults.forEach((item, index) => {
        const isBottleneck = item.cycleTime.toFixed(2) === maxCycleValue.toFixed(2); // เป็นคอขวดหรือไม่
        const totalCap = item.capHr * hours; // กำลังการผลิตทั้งหมด
        let inputFromPrev = (index === 0) ? totalCap : stepResults[index - 1].passed; // งานที่รับจากสถานีก่อนหน้า
        let actualProcessed = Math.min(inputFromPrev, totalCap); // งานที่ผลิตได้จริง
        let nextCap = (index === stepResults.length - 1) ? actualProcessed : (stepResults[index + 1].capHr * hours); // กำลังผลิตของสถานีถัดไป
        let wip = actualProcessed - nextCap; // งานค้าง (WIP)
        let passed = (index > 0) ? Math.min(actualProcessed, item.capHr) : actualProcessed; // งานที่ส่งไปให้สถานีถัดไป

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

    // กลุ่มตัวชี้วัดประสิทธิภาพ
    const pitchTime = packsize > 0 ? (taktTime * packsize) : 0; // เวลาที่ฝ่ายผลิตส่งมอบงานในปริมาณที่กำหนด
    const balance = (maxCycleTime > 0 && totalOp > 0) ? (totalAMV / (maxCycleTime * totalOp)) * 100 : 0; // สมดุลของสายการผลิต
    const uclValue = taktTime * 1.05; // UCL
    const lclValue = taktTime * 0.95; // LCL
    const lineOutputHr = maxCycleTime > 0 ? Math.floor(3600 / maxCycleTime) : 0; // Outputจริง ต่อชั่วโมง
    const totalOutput = lineOutputHr * 7 * days; // Outputจริง ทั้งหมด
    const totalAvailableMinutes = totalOp * (7 * 60 * days); // เวลาทำงานจริง ทั้งหมด
    const avgEffValue = totalSAM > 0 ? ((totalSAM * lineOutputHr) / (totalOp * 3600)) * 100 : 0; // ประสิทธิภาพ

// 5. รวบรวมข้อมูลทั้งหมดส่งไปยังส่วนต่างๆ
    const currentMetrics = {
    totalSAM,
    totalAMV,
    totalOp,
    avgEff: avgEffValue,
    balance: balance,
    pitchTime,
    ucl: uclValue,
    lcl: lclValue,
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
    setSafeText('pitchTime', pitchTime.toFixed(0));
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
    const summaryHeader = document.getElementById('layoutSummaryHeader');   
    if (summaryHeader) {
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

        // กำหนดเงื่อนไขและสูตรการคำนวณสำหรับ Tooltip
        const metrics = [
            { 
                label: 'Total SAM', 
                val: totalSAM.toFixed(1), 
                color: 'text-slate-600',
                formula: 'เวลารวมของ SAM ทุกขั้นตอน'
            },
            { 
                label: 'Total AMV', 
                val: totalAMV.toFixed(1), 
                color: totalAMV <= totalSAM ? 'text-green-600' : 'text-red-600',
                formula: 'เวลารวมของขั้นตอนทำงานจริงทุกขั้นตอน'
            },
            { 
                label: 'Total Op', 
                val: totalOp.toFixed(1), 
                color: 'text-blue-600',
                formula: 'จำนวนพนักงานทั้งหมดในสายผลิต'
            },
            { 
                label: 'Avg Eff', 
                val: avgEff.toFixed(1) + "%", 
                color: avgEff >= 80 ? 'text-green-600' : 'text-red-600',
                formula: '(Output × SAM) / (Manpower × Working Time)'
            },
            { 
                label: 'Balance', 
                val: balance.toFixed(1) + "%", 
                color: balance >= 95 ? 'text-green-600' : 'text-red-600',
                formula: 'AMV / Manpower x Cycle Time'
            },
            { 
                label: 'Pitch Time', 
                val: pitchTime.toFixed(0), 
                color: 'text-orange-600',
                formula: 'Takt Time x Pack Size'
            },
            { 
                label: 'UCL', 
                val: ucl.toFixed(1), 
                color: 'text-slate-500',
                formula: 'Takt Time x 1.05'
            },
            { 
                label: 'LCL', 
                val: lcl.toFixed(1), 
                color: 'text-slate-500', 
                formula: 'Takt Time x 0.95'
            },
            { 
                label: 'Max Cycle', 
                val: maxCycle.toFixed(0), 
                color: maxCycle <= taktReq ? 'text-green-600' : 'text-red-600',
                formula: 'ขั้นตอนที่ที่ใช้เวลามากที่สุด(คอขวด)'
            },
            { 
                label: 'Output', 
                val: Math.floor(output).toLocaleString(), 
                color: output >= targetHr ? 'text-green-600' : 'text-red-600',
                formula: '3600 / Max Cycle'
            }
        ];

        // วาด Dashboard ลงใน Header พร้อม Tooltip
        summaryHeader.className = "grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2 mb-6";
        summaryHeader.innerHTML = metrics.map(m => `
            <div class="bg-white border border-slate-200 p-2 rounded-xl text-center shadow-sm transition-all hover:shadow-md cursor-help" 
                 title="${m.formula}">
                <div class="text-[9px] uppercase text-slate-400 font-bold tracking-tighter leading-tight">
                    ${m.label} <span class="text-[8px]">ⓘ</span>
                </div>
                <div class="text-sm font-black ${m.color}">${m.val}</div>
            </div>
        `).join('');
    }

    // --- ส่วนการวาดแผนผัง (Layout) ---
    const layoutDiv = document.getElementById('factoryLayout');
    if (!layoutDiv) return;
    
    layoutDiv.innerHTML = '';
    // Container
    layoutDiv.className = "flex flex-col items-center w-full gap-y-4 p-16 bg-slate-50 rounded-3xl border border-slate-200 shadow-inner overflow-auto";

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
    const bgColor = s.isBottleneck ? 'bg-red-300' : 'bg-indigo-600';
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
    let topHtml = `<div id="layoutTopRow" class="sortable-row flex justify-center items-end w-full gap-x-4 min-h-[10px]">`;
    for (let i = 0; i < mid; i++) {
        topHtml += createStationHtml(info[i], i, false);
    }
    topHtml += `</div>`;

    // เส้น Flow ตรงกลาง
    const flowLine = `
        <div class="w-full flex items-center gap-2 px-4 opacity-20">
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
        animation: 550,
        draggable: ".drag-item-layout",
        ghostClass: "opacity-25", // เงาขณะลาก
        onEnd: function (evt) {
            // ฟังก์ชันดึงลำดับใหม่หลังจากลากสลับ
            const newOrder = [];
            
            // ดึงจากแถวบน
            document.querySelectorAll('#layoutTopRow .drag-item-layout').forEach(el => {
                newOrder.push(parseInt(el.getAttribute('data-index')));
            });
            
            // ดึงจากแถวล่าง
            const botItems = [];
            document.querySelectorAll('#layoutBotRow .drag-item-layout').forEach(el => {
                botItems.push(parseInt(el.getAttribute('data-index')));
            });
            // แถวล่างต้อง .reverse() ก่อน push เข้า newOrder
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
        btn.classList.add('bg-indigo-600', 'text-black');
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
