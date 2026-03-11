let operations = [
    { id: "1", sam: 19.62, amv: 19.62, op: 0.61, isEditing: false },
    { id: "2", sam: 12.34, amv: 12.34, op: 0.39, isEditing: false },
    { id: "3", sam: 13.83, amv: 13.83, op: 0.39, isEditing: false },
    { id: "4", sam: 24.53, amv: 24.53, op: 0.66, isEditing: false },
    { id: "5", sam: 22.43, amv: 22.43, op: 0.61, isEditing: false },
    { id: "6", sam: 32.47, amv: 32.47, op: 0.90, isEditing: false },
    { id: "7", sam: 21.44, amv: 21.44, op: 0.61, isEditing: false },
    { id: "8", sam: 82.79, amv: 103.49, op: 2.74, isEditing: false },
    { id: "9", sam: 48.41, amv: 48.41, op: 1.64, isEditing: false },
    { id: "10", sam: 26.80, amv: 26.80, op: 0.91, isEditing: false },
    { id: "11", sam: 13.13, amv: 13.13, op: 0.45, isEditing: false },
    { id: "12", sam: 42.16, amv: 49.60, op: 1.39, isEditing: false },
    { id: "13", sam: 27.88, amv: 27.88, op: 0.77, isEditing: false },
    { id: "14", sam: 31.45, amv: 37.00, op: 1.00, isEditing: false },
    { id: "15", sam: 55.34, amv: 55.34, op: 1.55, isEditing: false },
    { id: "16", sam: 16.00, amv: 16.00, op: 0.45, isEditing: false },
    { id: "17", sam: 57.01, amv: 57.01, op: 1.61, isEditing: false },
    { id: "18", sam: 7.64, amv: 7.64, op: 1.00, isEditing: false },
    { id: "19", sam: 23.21, amv: 23.21, op: 0.64, isEditing: false },
    { id: "20", sam: 24.29, amv: 24.29, op: 0.68, isEditing: false },
    { id: "21", sam: 29.16, amv: 29.16, op: 0.83, isEditing: false },
    { id: "22", sam: 40.09, amv: 40.09, op: 1.17, isEditing: false }
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
    const demand = parseFloat(document.getElementById('targetDemand').value) || 0;
    const days = parseFloat(document.getElementById('targetDays').value) || 1;
    const taktTime = (demand > 0) ? (7 * 3600 * days / demand) : 0;
    const reqOutHr = (demand > 0) ? (demand / (7 * days)) : 0;

    document.getElementById('calcTaktTime').innerText = taktTime.toFixed(0);
    document.getElementById('reqOutputHr').innerText = reqOutHr.toFixed(0);

    const hours = parseInt(document.getElementById('simHours').value) || 1;
    const tbody = document.getElementById('opTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    // --- แก้ไขจุดที่ 1: ประกาศตัวแปรไว้ที่เดียว ---
    let labels = [], wipData = [], capData = [], layoutInfo = [];
    let totalSAM = 0, totalAMV = 0, totalOp = 0, maxCycleTime = 0;

    let stepResults = operations.map(item => {
        const capHr = Math.floor((3600 / item.amv) * item.op);
        const cycleTime = item.amv / item.op;
        return { ...item, capHr, cycleTime };
    });

    stepResults.forEach((item, index) => {
        const totalCap = item.capHr * hours;
        let inputFromPrev = (index === 0) ? totalCap : stepResults[index-1].passed;
        let actualProcessed = Math.min(inputFromPrev, totalCap);
        let nextCap = (index === stepResults.length - 1) ? actualProcessed : (stepResults[index+1].capHr * hours);
        
        let wip = actualProcessed - nextCap;
        let passed = (index === 0) ? (item.capHr - wip) : actualProcessed;

        item.passed = passed;
        
        // เก็บข้อมูลสำหรับกราฟ
        labels.push("Op " + item.id);
        wipData.push(wip);
        capData.push(item.capHr);

        // --- แก้ไขจุดที่ 2: เพิ่ม op เข้าไปใน layoutInfo ---
        layoutInfo.push({ 
            id: item.id, 
            isBottleneck: item.cycleTime > taktTime,
            op: item.op // เพิ่มค่าจำนวนคนตรงนี้
        });

        // คำนวณค่า Summary
        totalSAM += item.sam;
        totalAMV += item.amv;
        totalOp += item.op;
        if (item.cycleTime > maxCycleTime) maxCycleTime = item.cycleTime;

        tbody.innerHTML += `
            <tr class="${item.isEditing ? 'bg-yellow-50' : 'hover:bg-slate-50'} border-b">
                <td class="p-4 drag-handle cursor-move text-lg">☰</td>
                <td class="p-4 font-bold text-slate-700">${item.id}</td>
                
                <td class="p-4 text-center">${item.process}</td>

                
                <td class="p-4 text-center">${item.isEditing ? `<input type="number" id="editSAM-${index}" value="${item.sam}" class="w-16 border rounded px-1">` : item.sam}</td>

                
                <td class="p-4 text-center">${item.isEditing ? `<input type="number" id="editAMV-${index}" value="${item.amv}" class="w-16 border rounded px-1">` : item.amv}</td>
                
                <td class="p-4 text-center font-bold ${((item.sam/item.amv)*100) >= 75 ? 'text-green-600' : 'text-red-600'}">
    ${((item.sam/item.amv)*100).toFixed(0)}%
</td>
                
                <td class="p-4 text-center">${item.isEditing ? `<input type="number" id="editOp-${index}" value="${item.op}" class="w-16 border rounded px-1">` : item.op}</td>
                
                <td class="p-4 text-center font-bold text-blue-900">${item.capHr}</td>
                <td class="p-4 text-center font-black ${wip > 0 ? 'text-green-600' : 'text-red-600'}">${wip.toLocaleString()}</td>
                <td class="p-4 text-center font-black text-green-700 bg-green-50">${passed.toLocaleString()}</td>

                <td class="p-4 text-center">${item.process}</td>
                
                <td class="p-4">
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

    // --- ส่วนคำนวณทางสถิติ (Line Balancing) ---
    const pitchTime = totalOp > 0 ? (totalSAM / totalOp) : 0;
    const balance = (maxCycleTime > 0 && totalOp > 0) 
                    ? (totalSAM / (maxCycleTime * totalOp)) * 100 
                    : 0;
    const lineOutputHr = maxCycleTime > 0 ? Math.floor(3600 / maxCycleTime) : 0;

    // --- อัปเดตผลลัพธ์ลง UI ---
    document.getElementById('sumSAM').innerText = totalSAM.toFixed(2);
    document.getElementById('sumAMV').innerText = totalAMV.toFixed(2);
    document.getElementById('sumOp').innerText = totalOp.toFixed(2);
    document.getElementById('avgEff').innerText = totalAMV > 0 ? ((totalSAM / totalAMV) * 100).toFixed(1) + "%" : "0%";
    document.getElementById('balance').innerText = balance.toFixed(1) + "%";
    document.getElementById('pitchTime').innerText = pitchTime.toFixed(2);
    document.getElementById('uclTime').innerText = (pitchTime * 1.05).toFixed(2);
    document.getElementById('lclTime').innerText = (pitchTime * 0.95).toFixed(2);
    document.getElementById('maxCycle').innerText = maxCycleTime.toFixed(2);
    
    if(document.getElementById('totalOutputPcs')) {
        document.getElementById('totalOutputPcs').innerText = lineOutputHr.toLocaleString() + " Pcs./Hr.";
    }

    // เรียกฟังก์ชันวาดกราฟและ Layout
    updateChart(labels, wipData, capData, reqOutHr);
    updateLayout(layoutInfo); // ตอนนี้ layoutInfo จะมีข้อมูล op ครบแล้ว
}

    // Visual Layout
    function updateLayout(info) {
    const layoutDiv = document.getElementById('factoryLayout');
    if (!layoutDiv) return;
    
    layoutDiv.innerHTML = '';
    layoutDiv.className = "flex flex-col items-center w-full gap-y-8 p-6 bg-slate-50 rounded-3xl border border-slate-200 shadow-inner overflow-hidden"; 

    const workerColors = [
    '#FF1493', // ชมพูเข้ม
    '#7CFC00', // เขียวหญ้า (ตัดกับชมพู)
    '#1E90FF', // ฟ้า
    '#FF6347', // แดงส้ม (ตัดกับฟ้า)
    '#32CD32', // เขียวอ่อน
    '#8A2BE2', // ม่วงน้ำเงิน (ตัดกับเขียว)
    '#FF8C00', // ส้มเข้ม
    '#00CED1', // ฟ้าเทอร์ควอยซ์ (ตัดกับส้ม)
    '#9370DB', // ม่วงอ่อน
    '#ADFF2F', // เขียวเหลือง (ตัดกับม่วง)
    '#DC143C', // แดง
    '#40E0D0', // ฟ้า (ตัดกับแดง)
    '#228B22', // เขียวป่า
    '#FF69B4', // ชมพู (ตัดกับเขียว)
    '#4B0082', // คราม
    '#FFA500', // ส้ม (ตัดกับคราม)
    '#008000', // เขียวแก่
    '#FF00FF', // ชมพู (ตัดกับเขียวแก่)
    '#0000FF', // น้ำเงิน
    '#FFD700'  // ทอง (ตัดกับน้ำเงิน)
];

    const mid = Math.ceil(info.length / 2);
    let scale = mid > 12 ? (mid > 18 ? 0.6 : 0.8) : 1;

    let currentWorkerIndex = 0;
    let currentWorkerLoad = 0;

    const getWorkerIconsHtml = (opValue) => {
        let html = '';
        let remainingOp = parseFloat(opValue);
        if (!remainingOp || remainingOp <= 0) return '';
        while (remainingOp > 0.001) {
            let canTake = Math.min(remainingOp, 1 - currentWorkerLoad);
            let percent = (canTake / 1) * 100; 
            const color = workerColors[currentWorkerIndex % workerColors.length];
            const iconSize = 18 * scale; 
            html += `
                <div class="relative group flex items-center justify-center" style="width: ${22 * scale}px; height: ${28 * scale}px;">
                    <i class="fas fa-user text-slate-200 absolute opacity-40" style="font-size: ${iconSize}px;"></i>
                    <i class="fas fa-user absolute" style="color: ${color}; clip-path: inset(${100 - percent}% 0 0 0); font-size: ${iconSize}px;"></i>
                </div>`;
            currentWorkerLoad += canTake;
            remainingOp -= canTake;
            if (currentWorkerLoad >= 0.99) { currentWorkerIndex++; currentWorkerLoad = 0; }
        }
        return html;
    };

    const createStationHtml = (s, originalIndex) => {
        const bgColor = s.isBottleneck ? 'bg-red-500' : 'bg-indigo-600';
        return `
            <div class="flex flex-col items-center cursor-move drag-item-layout" data-index="${originalIndex}">
                <div class="flex justify-center gap-1 mb-2" style="min-height: ${30 * scale}px;">
                    ${getWorkerIconsHtml(s.op)}
                </div>
                <div class="${bgColor} rounded-xl text-white flex flex-col items-center justify-center shadow-lg border-2 border-white relative transition-all"
                     style="width: ${64 * scale}px; height: ${64 * scale}px;">
                    <span style="font-size: ${10 * scale}px; font-weight: bold;">Op ${s.id}</span>
                    <div class="absolute -bottom-2 bg-white text-slate-700 px-1.5 py-0.5 rounded-full shadow-sm border border-slate-200"
                         style="font-size: ${8 * scale}px; font-weight: 900;">
                        ${s.op}
                    </div>
                </div>
            </div>`;
    };

    const topRow = info.slice(0, mid);
    const bottomRow = info.slice(mid).reverse();

    // สร้าง ID ให้แต่ละแถวเพื่อให้ Sortable มาเกาะได้
    let topHtml = `<div id="layoutTopRow" class="flex justify-center items-end w-full gap-x-4">`;
    topRow.forEach((s, i) => topHtml += createStationHtml(s, i));
    topHtml += `</div>`;

    const flowLine = `<div class="w-full flex items-center gap-2 px-4 opacity-50"><div class="h-[1px] flex-grow bg-slate-300"></div><div class="text-[9px] font-bold text-slate-400">FLOW</div><div class="h-[1px] flex-grow bg-slate-300"></div></div>`;

    let botHtml = `<div id="layoutBotRow" class="flex justify-center items-end w-full gap-x-4">`;
    bottomRow.forEach((s, i) => botHtml += createStationHtml(s, mid + (bottomRow.length - 1 - i)));
    botHtml += `</div>`;

    layoutDiv.innerHTML = topHtml + flowLine + botHtml;

    // เรียกฟังก์ชันเปิดการลากวาง
    initLayoutSortable();
}


function initLayoutSortable() {
    const config = {
        animation: 150,
        draggable: ".drag-item-layout",
        onEnd: function (evt) {
            // ดึงลำดับใหม่จาก DOM
            const newOrder = [];
            // ดึงจากแถวบน
            document.querySelectorAll('#layoutTopRow .drag-item-layout').forEach(el => {
                newOrder.push(parseInt(el.getAttribute('data-index')));
            });
            // ดึงจากแถวล่าง (ต้อง reverse กลับเพราะตอนวาดเรา reverse แถวล่าง)
            const botItems = [];
            document.querySelectorAll('#layoutBotRow .drag-item-layout').forEach(el => {
                botItems.push(parseInt(el.getAttribute('data-index')));
            });
            newOrder.push(...botItems.reverse());

            // อัปเดต Array operations ตามลำดับใหม่
            const updatedOps = newOrder.map(idx => operations[idx]);
            operations = updatedOps;

            // รันการจำลองใหม่เพื่ออัปเดตค่า WIP และกราฟ
            simulate();
        }
    };

    if (typeof Sortable !== 'undefined') {
        new Sortable(document.getElementById('layoutTopRow'), config);
        new Sortable(document.getElementById('layoutBotRow'), config);
    }
}



    function updateChart(labels, wipData, capData, target) {
        const canvas = document.getElementById('lineChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        if (myChart) { myChart.destroy(); }

        const maxWip = Math.max(...wipData);
        const bottleneckIndex = wipData.indexOf(maxWip);

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
                        label: 'Capacity',
                        data: capData,
                        backgroundColor: capData.map((_, i) => (maxWip > 0 && i === bottleneckIndex) ? '#065f46' : '#15803d'),
                        borderRadius: 4,
                        order: 2
                    },
                    {
                        label: 'Takt time',
                        data: labels.map(() => target),
                        type: 'line',
                        borderColor: '#1e40af',
                        borderWidth: 1,
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
                                if (wipData[i] > capData[i]) return "⚠ สถานะ: Over Capacity";
                                if (i === bottleneckIndex && wipData[i] > 0) return "🚨 สถานะ: Bottleneck";
                                return "✔ สถานะ: Normal Flow";
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

    function changeHour(val) {
        let input = document.getElementById('simHours');
        let newVal = parseInt(input.value) + val;
        if (newVal >= 1) { input.value = newVal; simulate(); }
    }
