document.addEventListener('DOMContentLoaded', () => {
    // State
    let n = 0; // processes
    let m = 0; // resources
    let maxResources = []; // used for scaling the resource meters

    // Screens
    const screenSetup = document.getElementById('screen-setup');
    const screenMatrix = document.getElementById('screen-matrix');
    const screenVisualizer = document.getElementById('screen-visualizer');

    // Buttons
    const btnNext = document.getElementById('btn-next-matrix');
    const btnBack = document.getElementById('btn-back-setup');
    const btnSimulation = document.getElementById('btn-run-simulation');
    const btnFillSafe = document.getElementById('btn-fill-dummy-safe');
    const btnFillUnsafe = document.getElementById('btn-fill-dummy-unsafe');
    const btnRestart = document.getElementById('btn-restart');
    const btnNextStep = document.getElementById('btn-next-step');
    const btnViewFlowchart = document.getElementById('btn-view-flowchart');

    // Display Areas
    const allocationInputs = document.getElementById('allocation-inputs');
    const maxInputs = document.getElementById('max-inputs');
    const availableInputs = document.getElementById('available-inputs');
    const logsContainer = document.getElementById('system-logs');
    const currentAvailableDisplay = document.getElementById('current-available-display');
    const processListDisplay = document.getElementById('process-list');
    const statusIndicator = document.getElementById('status-indicator');
    
    // New Features
    const safeSequenceDashboard = document.getElementById('safe-sequence-dashboard');
    const safeSequenceChain = document.getElementById('safe-sequence-chain');
    const detailedExplanationBox = document.getElementById('detailed-explanation-box');
    const explanationContent = document.getElementById('explanation-content');
    
    // Flowchart Modal
    const flowchartModal = document.getElementById('flowchart-modal');
    const flowchartContainer = document.getElementById('flowchart-container');
    const btnCloseFlowchart = document.getElementById('btn-close-flowchart');
    const btnFlowchartBottomClose = document.getElementById('btn-flowchart-bottom-close');
    
    let currentSimulationResult = null;

    // Manual Mode Waiter
    let nextStepResolver = null;
    btnNextStep.addEventListener('click', () => {
        if (nextStepResolver) {
            nextStepResolver();
            nextStepResolver = null;
        }
    });

    function waitForNextStep() {
        return new Promise(resolve => {
            nextStepResolver = resolve;
        });
    }

    // Error Modal
    const errorModal = document.getElementById('error-modal');
    const errorMessage = document.getElementById('error-message');
    const btnCloseError = document.getElementById('btn-close-error');

    // Success Modal
    const successModal = document.getElementById('success-modal');
    const finalChart = document.getElementById('final-sequence-chart');
    const btnCloseSuccess = document.getElementById('btn-close-success');

    // Deadlock Modal
    const deadlockModal = document.getElementById('deadlock-modal');
    const btnCloseDeadlock = document.getElementById('btn-close-deadlock');

    function showError(msg) {
        errorMessage.innerText = msg;
        errorModal.classList.add('active');
    }

    btnCloseError.addEventListener('click', () => {
        errorModal.classList.remove('active');
    });

    btnCloseSuccess.addEventListener('click', () => {
        successModal.classList.remove('active');
    });

    btnCloseDeadlock.addEventListener('click', () => {
        deadlockModal.classList.remove('active');
    });

    btnCloseFlowchart.addEventListener('click', () => { flowchartModal.classList.remove('active'); });
    btnFlowchartBottomClose.addEventListener('click', () => { flowchartModal.classList.remove('active'); });

    btnViewFlowchart.addEventListener('click', () => {
        if (!currentSimulationResult) return;
        renderDetailedFlowchart(currentSimulationResult);
        flowchartModal.classList.add('active');
    });

    // Setup -> Matrix
    btnNext.addEventListener('click', () => {
        n = parseInt(document.getElementById('numProcesses').value);
        m = parseInt(document.getElementById('numResources').value);

        if (isNaN(n) || isNaN(m) || n <= 0 || m <= 0) {
            showError('CRITICAL: Please enter valid system parameter numbers > 0');
            return;
        }

        generateMatrixInputs(n, m);
        
        screenSetup.classList.remove('active');
        screenMatrix.classList.add('active');
    });

    // Matrix -> Setup
    btnBack.addEventListener('click', () => {
        screenMatrix.classList.remove('active');
        screenSetup.classList.add('active');
    });

    // Safe Data
    btnFillSafe.addEventListener('click', () => {
        let dummyAllocation = [];
        let dummyMax = [];
        let dummyAvailable = [];

        // Generate safe Available
        for (let j = 0; j < m; j++) {
            dummyAvailable.push(Math.floor(Math.random() * 3) + 2); // 2 to 4
        }
        
        let currentAvail = [...dummyAvailable];
        
        // Generate sequentially safe Needs
        for (let i = 0; i < n; i++) {
            let rAlloc = [];
            let rMax = [];
            for (let j = 0; j < m; j++) {
                let a = Math.floor(Math.random() * 4); // 0 to 3
                rAlloc.push(a);
                // Ensure Need <= currentAvail so it can finish
                let need = Math.floor(Math.random() * (currentAvail[j] + 1));
                rMax.push(a + need);
                currentAvail[j] += a; // Accumulate for the next process
            }
            dummyAllocation.push(rAlloc);
            dummyMax.push(rMax);
        }
        
        // Shuffle rows so the safe path isn't strictly P0 -> P1 -> P2...
        let indices = Array.from({length: n}, (_, i) => i);
        indices.sort(() => Math.random() - 0.5);
        
        let mixedAlloc = [];
        let mixedMax = [];
        for(let i = 0; i < n; i++) {
            mixedAlloc.push(dummyAllocation[indices[i]]);
            mixedMax.push(dummyMax[indices[i]]);
        }

        fillMatrixInputs('alloc', mixedAlloc);
        fillMatrixInputs('max', mixedMax);
        fillArrayInputs('avail', dummyAvailable);
    });

    // Unsafe Data (Deadlock)
    btnFillUnsafe.addEventListener('click', () => {
        let deadlockAllocation = [];
        let deadlockMax = [];
        let deadlockAvailable = [];

        for (let j = 0; j < m; j++) {
            deadlockAvailable.push(0); 
        }

        for (let i = 0; i < n; i++) {
            let rAlloc = [];
            let rMax = [];
            for (let j = 0; j < m; j++) {
                let a = Math.floor(Math.random() * 3) + 1; // 1 to 3
                rAlloc.push(a);
                let need = Math.floor(Math.random() * 3) + 1; // 1 to 3
                rMax.push(a + need);
            }
            deadlockAllocation.push(rAlloc);
            deadlockMax.push(rMax);
        }
        
        // Allow P0 to pass smoothly, then deadlock happens on P1 onwards
        if (n > 1) {
            for (let j=0; j<m; j++) {
                let need = deadlockMax[0][j] - deadlockAllocation[0][j];
                deadlockAvailable[j] = need; 
            }
            for (let i=1; i<n; i++) {
                for (let j=0; j<m; j++) {
                    let requiredToDeadlock = deadlockAvailable[j] + deadlockAllocation[0][j] + 1;
                    deadlockMax[i][j] = deadlockAllocation[i][j] + requiredToDeadlock;
                }
            }
        }

        fillMatrixInputs('alloc', deadlockAllocation);
        fillMatrixInputs('max', deadlockMax);
        fillArrayInputs('avail', deadlockAvailable);
    });

    // Restart
    btnRestart.addEventListener('click', () => {
        screenVisualizer.classList.remove('active');
        screenSetup.classList.add('active');
        logsContainer.innerHTML = '';
    });

    // Run Simulation
    btnSimulation.addEventListener('click', () => {
        const allocation = parseMatrixInputs('alloc', n, m);
        const max = parseMatrixInputs('max', n, m);
        const available = parseArrayInputs('avail', m);

        // Validation
        if (!allocation || !max || !available) {
            showError("DATA CORRUPTION: Please fill all matrix fields with valid numerical data.");
            return;
        }

        // Compute total max resources possible for meter scaling
        // (Assume roughly Available + sum of Allocations)
        maxResources = Array(m).fill(0);
        for(let j=0; j<m; j++) {
            maxResources[j] = available[j];
            for(let i=0; i<n; i++) {
                maxResources[j] += allocation[i][j];
            }
        }

        const engine = new BankersAlgorithm(n, m, allocation, max, available);
        const result = engine.calculateSafeSequence();
        currentSimulationResult = result;

        const mode = document.querySelector('input[name="sim-mode"]:checked').value;
        const isManual = mode === 'manual';

        btnNextStep.style.display = isManual ? 'block' : 'none';
        btnViewFlowchart.style.display = 'none';
        detailedExplanationBox.style.display = isManual ? 'block' : 'none';

        screenMatrix.classList.remove('active');
        screenVisualizer.classList.add('active');

        startSimulation(result, engine, isManual);
    });

    // --- Helpers ---

    function generateMatrixInputs(rows, cols) {
        allocationInputs.innerHTML = '';
        maxInputs.innerHTML = '';
        availableInputs.innerHTML = '';

        for (let i = 0; i < rows; i++) {
            allocationInputs.appendChild(createRow('alloc', i, cols));
            maxInputs.appendChild(createRow('max', i, cols));
        }

        for (let j = 0; j < cols; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.id = `avail-${j}`;
            input.placeholder = `R${j}`;
            availableInputs.appendChild(input);
        }
    }

    function createRow(prefix, rowIndex, cols) {
        const div = document.createElement('div');
        div.className = 'matrix-row';
        const label = document.createElement('span');
        label.className = 'row-label';
        label.innerText = `P${rowIndex}`;
        div.appendChild(label);

        for (let j = 0; j < cols; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.id = `${prefix}-${rowIndex}-${j}`;
            div.appendChild(input);
        }
        return div;
    }

    function fillMatrixInputs(prefix, matrix) {
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                document.getElementById(`${prefix}-${i}-${j}`).value = matrix[i][j];
            }
        }
    }

    function fillArrayInputs(prefix, arr) {
        for (let j = 0; j < arr.length; j++) {
            document.getElementById(`${prefix}-${j}`).value = arr[j];
        }
    }

    function parseMatrixInputs(prefix, rows, cols) {
        let matrix = [];
        for (let i = 0; i < rows; i++) {
            let row = [];
            for (let j = 0; j < cols; j++) {
                const val = parseInt(document.getElementById(`${prefix}-${i}-${j}`).value);
                if (isNaN(val)) return null;
                row.push(val);
            }
            matrix.push(row);
        }
        return matrix;
    }

    function parseArrayInputs(prefix, cols) {
        let arr = [];
        for (let j = 0; j < cols; j++) {
            const val = parseInt(document.getElementById(`${prefix}-${j}`).value);
            if (isNaN(val)) return null;
            arr.push(val);
        }
        return arr;
    }

    // --- Simulation Graphics ---

    async function startSimulation(result, engine, isManual) {
        // Initialize UI
        logsContainer.innerHTML = '';
        log('cyan', 'System Nexus initialized. Analyzing safe states...');
        statusIndicator.className = 'status-box status-safe';
        statusIndicator.innerText = result.isSafe ? 'Status: SAFE SEQUENCE FOUND' : 'Status: DEADLOCK DETECTED! UNSAFE STATE';
        if(!result.isSafe) statusIndicator.className = 'status-box status-danger';

        safeSequenceDashboard.style.display = 'block';
        safeSequenceChain.innerHTML = '<span class="wait-text">Awaiting execution...</span>';

        // Render Process List with Allocation Charts
        processListDisplay.innerHTML = '';
        for (let i = 0; i < engine.n; i++) {
            const div = document.createElement('div');
            div.className = 'process-item';
            div.id = `proc-card-${i}`;
            
            const headerRow = document.createElement('div');
            headerRow.className = 'proc-header';
            
            const title = document.createElement('strong');
            title.innerText = `Process P${i}`;
            
            const statusSpan = document.createElement('span');
            statusSpan.className = 'proc-status';
            statusSpan.innerText = 'WAITING';
            
            headerRow.appendChild(title);
            headerRow.appendChild(statusSpan);
            
            const details = document.createElement('div');
            details.className = 'process-details';

            let chartHtml = `<div class="proc-chart-container">`;
            for(let j=0; j<m; j++) {
                let maxPossible = maxResources[j] || 1; 
                let allocPct = (engine.allocation[i][j] / maxPossible) * 100;
                let needPct = (engine.need[i][j] / maxPossible) * 100;
                
                chartHtml += `
                    <div class="mini-chart-row">
                        <span class="mini-label">R${j}</span>
                        <div class="mini-bar-bg">
                            <div class="mini-bar-alloc" id="alloc-bar-${i}-${j}" style="width: ${allocPct}%;"></div>
                            <div class="mini-bar-need" id="need-bar-${i}-${j}" style="width: ${needPct}%;"></div>
                        </div>
                    </div>
                `;
            }
            chartHtml += `</div>`;
            details.innerHTML = chartHtml;
            
            div.appendChild(headerRow);
            div.appendChild(details);
            processListDisplay.appendChild(div);
        }


        // Render Available Meters
        currentAvailableDisplay.innerHTML = '';
        for(let j=0; j<m; j++) {
            const div = document.createElement('div');
            div.className = 'resource-meter';
            div.innerHTML = `
                <div class="meter-label">R${j}</div>
                <div class="meter-track"><div class="meter-fill" id="meter-fill-${j}"></div></div>
                <div class="meter-value" id="meter-val-${j}">0</div>
            `;
            currentAvailableDisplay.appendChild(div);
        }
        
        // Initial Available Setup
        updateMeters(engine.available);
        log('info', `Initial Available resources: [${engine.available.join(', ')}]`);
        
        if (isManual) {
            explanationContent.innerHTML = `System initialized. Click <strong>Next Step &#10142;</strong> to begin process evaluation.`;
            await waitForNextStep();
        } else {
            await sleep(1500);
        }

        // Execute Steps
        for (let step of result.executionSteps) {
            const pId = step.process;
            const card = document.getElementById(`proc-card-${pId}`);
            
            if (isManual) {
                let expHtml = "Evaluating process queue:<br>";
                for (let skip of step.checkedBefore) {
                    if (skip.reason.includes("Already")) {
                        expHtml += `&nbsp;&#8226; <span class="highlight-proc">P${skip.process}</span> skipped: <span style="color:#64748b">Already completed</span>.<br>`;
                    } else {
                        expHtml += `&nbsp;&#8226; <span class="highlight-proc">P${skip.process}</span> skipped: <span class="highlight-fail">${skip.reason}</span>.<br>`;
                    }
                }
                expHtml += `&nbsp;&#8226; <span class="highlight-proc">P${pId}</span> <span class="highlight-success">Condition Met!</span> Need [${step.need.join(', ')}] &le; Available [${step.prevAvailable.join(', ')}].<br>`;
                expHtml += `Executing <span class="highlight-proc">P${pId}</span>...`;
                explanationContent.innerHTML = expHtml;
            }

            // Highlight Process
            card.classList.add('executing');
            card.querySelector('.proc-status').innerText = "EXECUTING...";
            card.querySelector('.proc-status').style.color = "var(--cyan)";
            
            log('cyan', `>>> Executing Process P${pId}`);
            log('info', `P${pId} Needs [${step.need.join(', ')}] <= Available [${step.prevAvailable.join(', ')}]. Condition met.`);
            
            await sleep(1500);

            // Finish Process & Release Resources
            updateMeters(step.newAvailable);
            
            // Animate chart bars depleting (Simulating memory released back to system)
            for(let j=0; j<m; j++) {
                let ab = document.getElementById(`alloc-bar-${pId}-${j}`);
                let nb = document.getElementById(`need-bar-${pId}-${j}`);
                if (ab) ab.style.width = '0%';
                if (nb) nb.style.width = '0%';
            }

            // --- Append to Sequence Chain UI ---
            if (safeSequenceChain.querySelector('.wait-text')) {
                safeSequenceChain.innerHTML = '';
            } else {
                const arrow = document.createElement('div');
                arrow.className = 'seq-arrow';
                arrow.innerHTML = '&#10132;'; // Right Arrow
                safeSequenceChain.appendChild(arrow);
            }
            
            const node = document.createElement('div');
            node.className = 'seq-node';
            node.innerText = `P${pId}`;
            safeSequenceChain.appendChild(node);
            // ------------------------------------

            log('success', `P${pId} Finished. Released its resources [${step.allocated.join(', ')}].`);
            log('info', `New Available: [${step.newAvailable.join(', ')}].`);
            
            card.classList.remove('executing');
            card.classList.add('finished');
            card.querySelector('.proc-status').innerText = "COMPLETED";
            card.querySelector('.proc-status').style.color = "var(--success)";
            
            if (isManual) {
                explanationContent.innerHTML = `<span class="highlight-success">P${pId} Completed.</span> Resources [${step.allocated.join(', ')}] released back to system.<br>New Available: [${step.newAvailable.join(', ')}].<br>Click <strong>Next Step &#10142;</strong> to continue.`;
                // Don't wait if it's the last step and it's successful
                if (result.isSafe && step === result.executionSteps[result.executionSteps.length - 1]) {
                    btnNextStep.style.display = 'none';
                    btnViewFlowchart.style.display = 'inline-block';
                } else {
                    await waitForNextStep();
                }
            } else {
                await sleep(1000);
            }
        }

        // Final Conclusion
        if (result.isSafe) {
            log('success', `=============================`);
            log('success', `SYSTEM IS IN A SAFE STATE!`);
            log('success', `Safe Sequence: < ${result.safeSequence.map(p => `P${p}`).join(', ')} >`);
            log('success', `=============================`);
            
            // Build the grand finale sequence chart in the modal
            finalChart.innerHTML = '';
            result.safeSequence.forEach((p, index) => {
                const node = document.createElement('div');
                node.className = 'final-node';
                node.style.animationDelay = `${index * 0.3}s`; // Stagger animation
                node.innerText = `P${p}`;
                finalChart.appendChild(node);
                
                if (index < result.safeSequence.length - 1) {
                    const arrow = document.createElement('div');
                    arrow.className = 'final-arrow';
                    arrow.style.animationDelay = `${index * 0.3 + 0.15}s`;
                    arrow.innerHTML = '&#10142;'; // Bold right arrow
                    finalChart.appendChild(arrow);
                }
            });
            
            // Show the modal after a short dramatic pause
            setTimeout(() => {
                successModal.classList.add('active');
            }, 800);

        } else {
            log('error', `=============================`);
            log('error', `CRITICAL: SYSTEM IS NOT SAFE!`);
            log('error', `Cannot fulfill needs of remaining processes with available resources.`);
            if (result.safeSequence.length > 0) {
                log('error', `Sequence halted after: < ${result.safeSequence.map(p => `P${p}`).join(', ')} >`);
            }
            log('error', `=============================`);
            
            // Highlight remaining processes as error
            for(let i=0; i<n; i++) {
                const card = document.getElementById(`proc-card-${i}`);
                if (!card.classList.contains('finished')) {
                    card.style.borderLeftColor = 'var(--danger)';
                    card.style.opacity = '0.5';
                }
            }

            if (isManual) {
                let expHtml = "Evaluating process queue:<br>";
                for (let skip of result.finalUnsafeChecks) {
                     if (skip.reason.includes("Already")) {
                        expHtml += `&nbsp;&#8226; <span class="highlight-proc">P${skip.process}</span> skipped: <span style="color:#64748b">Completed</span>.<br>`;
                    } else {
                        expHtml += `&nbsp;&#8226; <span class="highlight-proc">P${skip.process}</span> failed condition: <span class="highlight-fail">${skip.reason}</span>.<br>`;
                    }
                }
                expHtml += `<br><span class="highlight-fail">FATAL: Cannot fulfill needs of remaining processes. System Deadlocked.</span>`;
                explanationContent.innerHTML = expHtml;
                btnNextStep.style.display = 'none';
                btnViewFlowchart.style.display = 'inline-block';
            }

            // Dramatic pause before showing deadlock
            setTimeout(() => {
                deadlockModal.classList.add('active');
            }, 800);
        }
    }

    function updateMeters(currentAvailableArr) {
        for (let j = 0; j < m; j++) {
            const trackW = Math.min((currentAvailableArr[j] / maxResources[j]) * 100, 100) || 0;
            document.getElementById(`meter-fill-${j}`).style.width = `${trackW}%`;
            document.getElementById(`meter-val-${j}`).innerText = currentAvailableArr[j];
        }
    }

    function log(type, message) {
        const line = document.createElement('div');
        line.className = `log-line log-${type}`;
        line.innerText = message;
        logsContainer.appendChild(line);
        logsContainer.scrollTop = logsContainer.scrollHeight;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function renderDetailedFlowchart(res) {
        flowchartContainer.innerHTML = '';
        let html = '';
        
        let iteration = 1;
        for (let step of res.executionSteps) {
            html += `
            <div class="fc-step">
                <div class="fc-step-header">
                    <h4>Iteration ${iteration}: Selecting Process P${step.process}</h4>
                </div>
                <div class="fc-step-content">
                    <p><strong>Available Resources Initially:</strong> [${step.prevAvailable.join(', ')}]</p>
                    <div class="fc-checks">
                        <h5>Queue Evaluation:</h5>
                        <ul>`;
            for (let skip of step.checkedBefore) {
                if (skip.reason.includes("Already")) {
                    html += `<li>P${skip.process} skipped: <em>Already Completed</em></li>`;
                } else {
                    html += `<li>P${skip.process} skipped <span class="highlight-fail">Condition Failed</span>: ${skip.reason}</li>`;
                }
            }
            html += `       <li>P${step.process} <span class="highlight-success">Selected</span>: Need ([${step.need.join(', ')}]) &le; Available ([${step.prevAvailable.join(', ')}])</li>
                        </ul>
                    </div>
                    <div class="fc-action">
                        <p><strong>Action:</strong> Executed P${step.process}. Allocated resources [${step.allocated.join(', ')}] returned to the system.</p>
                        <p><strong>New Available Resources:</strong> [${step.newAvailable.join(', ')}]</p>
                    </div>
                </div>
            </div>`;
            iteration++;
        }

        if (res.isSafe) {
            html += `
            <div class="fc-step fc-success">
                <div class="fc-step-header">
                    <h4>Simulation Concluded</h4>
                </div>
                <div class="fc-step-content">
                    <p class="highlight-success" style="font-size: 1.2rem; font-weight: bold;">System is in a Safe State.</p>
                    <p>All processes were successfully executed.<br>Safe Sequence: &lt; ${res.safeSequence.map(p => `P${p}`).join(', ')} &gt;</p>
                </div>
            </div>`;
        } else {
             html += `
            <div class="fc-step fc-danger">
                <div class="fc-step-header">
                    <h4>Iteration ${iteration}: Deadlock Detected</h4>
                </div>
                <div class="fc-step-content">
                    <div class="fc-checks">
                        <h5>Final Queue Evaluation:</h5>
                        <ul>`;
            for (let skip of res.finalUnsafeChecks) {
                if (skip.reason.includes("Already")) {
                    html += `<li>P${skip.process} skipped: <em>Completed</em></li>`;
                } else {
                    html += `<li>P${skip.process} <span class="highlight-fail">Condition Failed</span>: ${skip.reason}</li>`;
                }
            }
            html += `       </ul>
                    </div>
                    <p class="highlight-fail" style="font-size: 1.2rem; font-weight: bold; margin-top: 1rem;">System Deadlocked.</p>
                    <p>None of the remaining processes can be satisfied by the currently available resources. The safe sequence algorithm terminates.</p>
                </div>
            </div>`;
        }

        flowchartContainer.innerHTML = html;
    }
});
