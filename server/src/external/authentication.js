// Dummy auth, replace with your auth solutions

export function authenticateCredentials(username, password) {
    const success = password === 'spintesting';
    const message = `Invalid credentials`;
    return { success: success, message: message };
}
