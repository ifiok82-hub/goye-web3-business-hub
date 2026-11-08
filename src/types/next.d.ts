declare module 'next/server' {
  export class NextResponse extends Response {
    static json(data: any, init?: ResponseInit): NextResponse;
    static next(): NextResponse;
    cookies: {
      set: (name: string, value: string, options?: any) => void;
      get: (name: string) => any;
      delete: (name: string) => void;
    };
  }
  export interface NextRequest extends Request {
    nextUrl: URL & { pathname: string };
    cookies: any;
  }
}
