import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

const pizzaFailureCounter = new Counter('pizza_generation_failures');
const pizzaLatenciesTrend = new Trend('pizza_generation_duration_ms');

const TOOLS_POOL = ['knife', 'pizza_cutter', 'scissors'];
const INGREDIENTS_POOL = ['pepperoni', 'onions', 'olives', 'mushrooms', 'jalapenos'];

function getRandomSubset(array, maxItems = 1) {
    const numItems = Math.floor(Math.random() * (maxItems + 1));
    if (numItems === 0) return [];
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numItems);
}

export function pizzaCreationAction(baseUrl, token) {
    const url = `${baseUrl}/api/pizza`;
    
    // 🌟 FIXED SCHEMA: Removed 'customPizzaName' to pass the API validation gate
    const pizzaRestrictions = {
        maxCaloriesPerSlice: Math.floor(Math.random() * (1200 - 500 + 1)) + 500, 
        minNumberOfToppings: 1,                                                 
        maxNumberOfToppings: Math.floor(Math.random() * (6 - 3 + 1)) + 3,       
        excludedIngredients: getRandomSubset(INGREDIENTS_POOL, 2),                 
        excludedTools: getRandomSubset(TOOLS_POOL, 1),                          
        mustBeVegetarian: Math.random() < 0.3                                  
    };

    const payload = JSON.stringify(pizzaRestrictions);

    const params = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15',
            'Accept': '*/*',
            'Content-Type': 'application/json',
            'Authorization': token 
        },
    };

    let res = http.post(url, payload, params); 

    pizzaLatenciesTrend.add(res.timings.duration);

    let isSuccessful = check(res, {
        'pizza generated successfully': (r) => r.status === 200 || r.status === 201,
    });

    if (!isSuccessful) {
        pizzaFailureCounter.add(1);
        console.log(`[DYNAMIC FAIL] Status: ${res.status} | Sent Payload: ${payload}`);
    }

    sleep(1);
}
