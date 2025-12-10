import NextAuth from 'next-auth';
import authConfig from './auth.config';

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // 인증 체크에서 제외할 경로
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
