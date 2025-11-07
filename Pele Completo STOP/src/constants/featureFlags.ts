export const isProd = import.meta.env.PROD;
export const isDev = !import.meta.env.PROD;

export const enableDemoAuth = (import.meta.env.VITE_ENABLE_DEMO_AUTH ?? (isDev ? 'true' : 'false')) === 'true';
export const enableMockData = (import.meta.env.VITE_ENABLE_MOCK_DATA ?? (isDev ? 'true' : 'false')) === 'true';
export const enableWhatsApp = (import.meta.env.VITE_ENABLE_WHATSAPP ?? 'false') === 'true';

export const patientDocsBucket = import.meta.env.VITE_PATIENT_DOCS_BUCKET || 'patient-documents';
export const evolutionApiUrl = import.meta.env.VITE_EVOLUTION_API_URL || 'http://localhost:8080';
export const evolutionInstance = import.meta.env.VITE_EVOLUTION_INSTANCE || 'wound-care-instance';
export const evolutionApiKey = import.meta.env.VITE_EVOLUTION_API_KEY || '';
