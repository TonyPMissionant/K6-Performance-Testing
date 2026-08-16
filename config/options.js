// --- LOAD PROFILE A: SMOKE TEST / REPO HEALTH (Your Current Setup) ---
const smokeTestOptions = {
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)'],
    scenarios: {
        homepage_load: {
            executor: 'ramping-vus',
            stages: [
                { duration: '5s', target: 5 },
                { duration: '10s', target: 5 },
                { duration: '5s', target: 0 },
            ],
            exec: 'runHomepageFlow',
        },
        create_pizza_load: {
            executor: 'constant-vus',
            vus: 2,                  
            duration: '20s',         
            exec: 'runPizzaFlow',    
        },
    },
    thresholds: {
        http_req_duration: ['p(95)<500'],
        'pizza_generation_failures': ['count==0'],
        'pizza_generation_duration_ms': ['p(99)<700'], 
    },
};

// --- LOAD PROFILE B: STRESS TEST (Aggressive Concurrency Spike) ---
const stressTestOptions = {
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)'],
    scenarios: {
        homepage_load: {
            executor: 'ramping-vus',
            stages: [
                { duration: '10s', target: 10 }, // Ramp up to 10 users fast
                { duration: '20s', target: 25 }, // Ramp hard up to 25 users to stress the engine
                { duration: '10s', target: 0 },  // Cool down step
            ],
            exec: 'runHomepageFlow',
        },
        create_pizza_load: {
            executor: 'constant-vus',
            vus: 8,                  // Turn the volume up to 8 dedicated looping workers
            duration: '40s',         
            exec: 'runPizzaFlow',    
        },
    },
    thresholds: {
        http_req_duration: ['p(95)<800'], // Widen gate slightly because server under stress lags
        'pizza_generation_failures': ['count==0'],
        'pizza_generation_duration_ms': ['p(95)<600'], 
    },
};

// 🌟 EXPORT SWITCHBOARD: Simply change the trailing reference keyword to instantly swap profiles!
export const testOptions = stressTestOptions; // Change to 'stressTestOptions' when you want to execute a heavy run
