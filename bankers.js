// bankers.js
// This module encapsulates the backend logic for demonstrating the Banker's Algorithm.
// It is cleanly separated from the frontend view layer.

class BankersAlgorithm {
  constructor(totalProcesses, totalResources, allocation, max, available) {
    this.n = totalProcesses;
    this.m = totalResources;
    this.allocation = allocation;
    this.max = max;
    this.available = available;
    this.need = [];
    this.calculateNeed();
  }

  // Need[i,j] = Max[i,j] - Allocation[i,j]
  calculateNeed() {
    for (let i = 0; i < this.n; i++) {
        let processNeed = [];
        for (let j = 0; j < this.m; j++) {
            processNeed.push(this.max[i][j] - this.allocation[i][j]);
        }
        this.need.push(processNeed);
    }
  }

  // Evaluates whether the current state is safe
  // Computes the safe sequence and returns the step-by-step state logs
  calculateSafeSequence() {
    let processFinished = new Array(this.n).fill(false);
    let work = [...this.available];
    let safeSequence = [];
    let executionSteps = [];
    
    let count = 0;
    while (count < this.n) {
        let found = false;
        let checkedBefore = []; // Stores the reasoning for prior processes skipped in this attempt
        
        for (let p = 0; p < this.n; p++) {
            if (!processFinished[p]) {
                // Check if current process needs can be satisfied by 'work'
                let canAllocate = true;
                let failReason = null;
                for (let j = 0; j < this.m; j++) {
                    if (this.need[p][j] > work[j]) {
                        canAllocate = false;
                        failReason = `R${j} Need (${this.need[p][j]}) > Available (${work[j]})`;
                        break;
                    }
                }
                
                if (canAllocate) {
                    let prevWork = [...work];
                    // If satisfied, add its allocated resources back to work
                    for (let j = 0; j < this.m; j++) {
                        work[j] += this.allocation[p][j];
                    }
                    safeSequence.push(p);
                    processFinished[p] = true;
                    found = true;
                    count++;
                    
                    // Log the execution step for the frontend visualizer
                    executionSteps.push({
                        process: p,
                        prevAvailable: prevWork,
                        allocated: [...this.allocation[p]],
                        need: [...this.need[p]],
                        newAvailable: [...work],
                        checkedBefore: [...checkedBefore]
                    });
                    
                    // Break out of for-loop so the next iteration starts fresh from P0
                    // This creates clear, distinct iteration steps for visualization
                    break;
                } else {
                    checkedBefore.push({ process: p, reason: failReason });
                }
            } else {
                checkedBefore.push({ process: p, reason: "Already completed" });
            }
        }
        
        if (!found) {
            // System is not in safe state
            return {
                isSafe: false,
                safeSequence: safeSequence, // Contains processes that successfully completed before deadlock
                executionSteps: executionSteps,
                finalUnsafeChecks: checkedBefore, // Log the final checks that all failed
                error: "System is in an unsafe state (Deadlock may occur if requests are granted)."
            };
        }
    }
    
    return {
        isSafe: true,
        safeSequence: safeSequence,
        executionSteps: executionSteps
    };
  }
}
