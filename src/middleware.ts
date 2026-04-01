import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// TODO: Update redirects from redirects.json (middleware can't use fs, so hardcode here)
const redirects: { from: string; to: string }[] = [];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check redirects
  const redirect = redirects.find(r => r.from === pathname);
  if (redirect) {
    return NextResponse.redirect(new URL(redirect.to, request.url), 301);
  }

  // Admin auth check
  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApi = pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/auth');

  if (isAdminPage || isAdminApi) {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      if (isAdminApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      const decoded = JSON.parse(atob(token));
      const secret = process.env.ADMIN_SECRET || 'default-secret';

      if (decoded.secret !== secret || Date.now() > decoded.exp) {
        if (isAdminApi) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    } catch {
      if (isAdminApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/|icons/).*)',
  ],
};
