import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js"; 
import { group } from 'k6';
import { testOptions } from './config/options.js';
import { fetchSessionToken } from './helpers/auth.js';
import { homepageAction } from './scenarios/homepage.js';
import { pizzaCreationAction } from './scenarios/pizza.js';

const BASE_URL = __ENV.BASE_URL || 'https://quickpizza.grafana.com';

export const options = testOptions;

export function setup() {
    const freshToken = fetchSessionToken(BASE_URL);
    return { token: freshToken };
}

export function runHomepageFlow() {
    group('Open pizza home page', () => {
        homepageAction(BASE_URL);
    });
}

export function runPizzaFlow(data) {
    group('Click Pizza Please Button', () => {
        pizzaCreationAction(BASE_URL, data.token);
    });
}

export function handleSummary(data) {
    return {
        "report1.html": htmlReport(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    };
}