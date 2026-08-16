import http from 'k6/http';
import { check, sleep } from 'k6';
import { group } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js"; 

const BASE_URL = 'https://quickpizza.grafana.com';

export const options = {
    stages: [
        { duration: '5s', target: 10 },
        { duration: '10s', target: 10 },  // Fixed: Added 's' to '10' so k6 parses the duration correctly
        { duration: '5s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
    },
};

export default function () {
    group('Login to QuickPizza', () => {

        // 1. Exact API endpoint based on official Grafana k6 docs
        const url = `${BASE_URL}/api/users/token/login`;

        // 2. Wrap credentials in a serialized JSON format
        const payload = JSON.stringify({
            username: 'default',
            password: '12345678',
        });

        // 3. Keep the content type explicitly set to JSON
        const params = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        // 4. Fire the POST request to the endpoint
        let res = http.post(url, payload, params);

        // 5. Validate the response properties
        const loginSuccessful = check(res, {
            'is status 200': (r) => r.status === 200,
            'has login token': (r) => r.body.includes('token') || r.body.includes('success') || r.body.includes('authenticated'),
        });

        if (!loginSuccessful) {
            console.log(`[LOGIN FAILED] Status: ${res.status} | Body: ${res.body}`);
        }
    });

    sleep(1);
}

export function handleSummary(data) {
    return {
        "report1.html": htmlReport(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    };
}
