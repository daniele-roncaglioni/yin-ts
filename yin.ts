//http://audition.ens.fr/adc/pdf/2002_JASA_YIN.pdf
function yin(signal: number[], sampleRate: number, threshold: number = 0.2) {
    // d(tau)
    let differences = new Float32Array(Math.floor(signal.length / 2)); //Window size implicitly is signal.length/2
    let differencesMinIdx = 0
    let cumulativeDifferencesSum = 0
    let tauMin = 0
    for (let tau = 0; tau < differences.length; tau++) {
        // Step 1&2: Calculate the squared differences of the signal with a shifted version of itself
        for (let j = 1; j < differences.length; j++) {
            differences[tau] += Math.pow(signal[j] - signal[j + tau], 2);
        }
        // Step 3: Normalize differences to get the cumulative mean difference function
        cumulativeDifferencesSum += differences[tau];
        if (cumulativeDifferencesSum > 0.) {
            differences[tau] *= tau / cumulativeDifferencesSum;
        } else {
            differences[tau] = 1.
        }
        // Step 4 & 5 & 6: Absolute threshold, find the best value of tau when d(tau) is smaller than the threshold for the first time, or just keep track of the current differences minimum
        // Step 5 should be performed here according to the paper: fitting a parabola on the non-normalized differences and use the computed minimum to check against the threshold.
        // We'll perform it only once at the end to correct the minimum we found without the parabolic interpolation
        // Step 6 should also be performed here. We use a similar step by adding the check for differences[tau-1] < differences[tau] which makes sure we select the best point in the local minimum
        if (tau >= 2 && differences[tau - 1] < threshold && differences[tau - 1] < differences[tau]) {
            tauMin = tau - 1
            break // found our tau, exit the loop
        }
        if (differences[tau] < differences[differencesMinIdx]) {
            differencesMinIdx = tau;
        }
    }
    // did not find value below threshold, use global minimum of difference function
    if (tauMin === 0 && differencesMinIdx > 0) {
        tauMin = differencesMinIdx
    }
    if (tauMin === 0 && differencesMinIdx === 0) {
        // could not find frequency
        return 0
    }
    // Step 5: Parabolic interpolation to find a more precise minimum tau
    let betterTau = tauMin
    if (tauMin > 1 && tauMin < differences.length - 1) {
        let x0 = tauMin - 1
        let x1 = tauMin
        let x2 = tauMin + 1
        let y0 = differences[x0]
        let y1 = differences[x1]
        let y2 = differences[x2]
        // Actually setting x1 = 0, x0=-1, x2=1 and adding back x1 at the end, simplifies the algebraic calculations to:
        betterTau = x1 + (y2 - y0) / (2 * (2 * y1 - y2 - y0))
    }
    // Final step: Compute the frequency estimate
    return sampleRate / betterTau
}

export default yin;