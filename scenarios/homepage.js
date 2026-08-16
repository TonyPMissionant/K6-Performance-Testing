import http from 'k6/http';
import { check, sleep } from 'k6';

export function homepageAction(baseUrl) {
    const response = http.get(baseUrl);
    check(response, {
        'is status 200': (r) => r.status === 200,
    });
    sleep(1);
}
