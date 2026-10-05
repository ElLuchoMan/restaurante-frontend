export function jwtDecode(token: string): any {
  try {
    const payload = token.split('.')[1];
    if (!payload) return {};
    return JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
  } catch {
    throw new Error('Invalid token');
  }
}
