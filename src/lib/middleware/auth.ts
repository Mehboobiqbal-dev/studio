import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, JWTPayload } from '../auth/jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

function extractToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  const accessTokenCookie = req.cookies.get('accessToken');
  return accessTokenCookie?.value || null;
}

export async function authenticateRequest(
  request: NextRequest
): Promise<{ user: JWTPayload } | { error: NextResponse }> {
  const token = extractToken(request);

  if (!token) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      ),
    };
  }

  try {
    const payload = verifyAccessToken(token);
    return { user: payload };
  } catch (error) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - Invalid or expired token' },
        { status: 401 }
      ),
    };
  }
}

export function requireAuth(handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>) {
  return async (req: NextRequest, context?: any) => {
    const authResult = await authenticateRequest(req);
    
    if ('error' in authResult) {
      return authResult.error;
    }

    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.user = authResult.user;
    
    return handler(authenticatedReq, context);
  };
}

export function requireRole(allowedRoles: string[]) {
  return (handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>) => {
    return async (req: NextRequest, context?: any) => {
      const authResult = await authenticateRequest(req);
      
      if ('error' in authResult) {
        return authResult.error;
      }

      if (!allowedRoles.includes(authResult.user.role)) {
        return NextResponse.json(
          { error: 'Forbidden - Insufficient permissions' },
          { status: 403 }
        );
      }

      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = authResult.user;
      
      return handler(authenticatedReq, context);
    };
  };
}

