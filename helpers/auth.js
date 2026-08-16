import http from 'k6/http';

export function fetchSessionToken(baseUrl) {
    console.log('[AUTH HELPER] Dynamically extracting fresh server token...');
    
    // 1. Fetch the main home page content
    const res = http.get(`${baseUrl}/`);
    
    // 2. 🌟 NEW FLEXIBLE REGEX: Accounts for any spaces, tabs, or quotes around the token key
    const tokenRegex = /token\s*:\s*["']([A-Za-z0-9]+)["']|"token"\s*:\s*["']([A-Za-z0-9]+)["']/;
    const match = res.body.match(tokenRegex);
    
    let extractedToken = '';

    if (match) {
        // Capture group 1 or group 2 depending on which pattern matched
        extractedToken = match[1] || match[2];
        console.log(`[AUTH HELPER] Success! Live Token Extracted: ${extractedToken}`);
    } else {
        console.log('[AUTH HELPER] Warning: Could not scrape token from HTML root. Trying backup registration...');
        
        // 3. Robust Backup API Call
        let fallbackRes = http.post(`${baseUrl}/api/users/token/login`, JSON.stringify({
            username: 'default',
            password: '12345678'
        }), { headers: { 'Content-Type': 'application/json' } });

        if (fallbackRes.status === 200) {
            let body = JSON.parse(fallbackRes.body);
            extractedToken = body.token;
        }
    }

    // 4. Final safety backup: If everything fails, use your verified Safari token token as an absolute fallback
    if (!extractedToken) {
        extractedToken = 'Nqcbhuw4d5ev4e3S'; 
    }

    return `Token ${extractedToken}`;
}
