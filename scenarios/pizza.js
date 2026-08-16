import http from 'k6/http';
import { check, sleep } from 'k6';

export function pizzaCreationAction(baseUrl, token) {
    const url = `${baseUrl}/api/pizza`;
    
    const payload = JSON.stringify({
        maxCaloriesPerSlice: 1000,
        mustBeVegetarian: false,
        excludedIngredients: [],
        excludedTools: []
    });

    const params = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15',
            'Accept': '*/*',
            'Content-Type': 'application/json',
            'Authorization': token 
        },
    };

    let res = http.post(url, payload, params); 

    check(res, {
        'pizza generated successfully': (r) => r.status === 200,
    });
    sleep(1);
}
