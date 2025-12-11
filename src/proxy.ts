import NextAuth from 'next-auth';
import authConfig from './auth.config';
const { auth } = NextAuth(authConfig);
export const proxy = auth; // 'default' 대신 'proxy'로 export
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
