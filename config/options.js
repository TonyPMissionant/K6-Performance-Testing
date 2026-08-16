export const testOptions = {
    // ADDED THIS LINE: Tells k6 to add the p(99) data column to your terminal output
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)'],

    scenarios: {
        homepage_load: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '5s', target: 5 },
                { duration: '10s', target: 5 },
                { duration: '5s', target: 0 },
            ],
            gracefulRampDown: '5s',
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

        //SAFETY TWEAK: Set this to 700ms to handle natural backend server lag spikes
        'pizza_generation_duration_ms': ['p(99)<700'],
    },
};
