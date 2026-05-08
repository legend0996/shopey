function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((acc, cookiePart) => {
    const [rawKey, ...rest] = cookiePart.trim().split('=');
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
}

function getTokenFromRequest(req, cookieNames = []) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  const cookies = parseCookies(req.headers.cookie);
  for (const name of cookieNames) {
    if (cookies[name]) {
      return cookies[name];
    }
  }

  return null;
}

function setAuthCookie(res, name, token) {
  const isProduction = process.env.NODE_ENV === 'production';
  const secure =
    String(process.env.COOKIE_SECURE || '').toLowerCase() === 'true' ||
    (String(process.env.COOKIE_SECURE || '').toLowerCase() !== 'false' && isProduction);
  const sameSite = process.env.COOKIE_SAMESITE || (secure ? 'none' : 'lax');
  const domain = process.env.COOKIE_DOMAIN || undefined;

  res.cookie(name, token, {
    httpOnly: true,
    secure,
    sameSite,
    domain,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

module.exports = {
  getTokenFromRequest,
  setAuthCookie,
};
