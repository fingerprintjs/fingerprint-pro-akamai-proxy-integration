export const generateTestId = () => `${Date.now()}.${Math.random().toString(32).slice(2, 12)}`
