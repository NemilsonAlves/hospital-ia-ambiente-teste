export async function api(path: string, options: RequestInit = {}) {
  const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};
  const base = env.VITE_ADMIN_API_URL || 'http://localhost:3001/api';
  const token = localStorage.getItem('admin_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${base}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({ success: false, erro: 'Erro desconhecido' }));
  if (!res.ok) {
    const message = (data && (data.error || data.erro || data.message)) || 'Erro na requisição';
    throw { message, status: res.status, path };
  }
  return data;
}
