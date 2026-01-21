import { of } from 'rxjs';

import { WrapperDataInterceptor } from '@/shared/interceptors/wrapper-data.interceptor';

describe('WrapperDataInterceptor', () => {
  it('keeps falsy body as-is', async () => {
    const interceptor = new WrapperDataInterceptor();
    const result = await new Promise((resolve) => {
      interceptor
        .intercept({} as any, { handle: () => of(undefined) } as any)
        .subscribe(resolve);
    });
    expect(result).toBeUndefined();
  });

  it('does not wrap accessToken responses', async () => {
    const interceptor = new WrapperDataInterceptor();
    const result = await new Promise((resolve) => {
      interceptor
        .intercept({} as any, { handle: () => of({ accessToken: 'x' }) } as any)
        .subscribe(resolve);
    });
    expect(result).toEqual({ accessToken: 'x' });
  });

  it('does not wrap meta responses', async () => {
    const interceptor = new WrapperDataInterceptor();
    const body = { meta: { page: 1 }, data: [] };
    const result = await new Promise((resolve) => {
      interceptor.intercept({} as any, { handle: () => of(body) } as any).subscribe(resolve);
    });
    expect(result).toEqual(body);
  });

  it('wraps regular object responses', async () => {
    const interceptor = new WrapperDataInterceptor();
    const result = await new Promise((resolve) => {
      interceptor.intercept({} as any, { handle: () => of({ id: 1 }) } as any).subscribe(resolve);
    });
    expect(result).toEqual({ data: { id: 1 } });
  });

  it('wraps primitive responses', async () => {
    const interceptor = new WrapperDataInterceptor();
    const result = await new Promise((resolve) => {
      interceptor.intercept({} as any, { handle: () => of('ok') } as any).subscribe(resolve);
    });
    expect(result).toEqual({ data: 'ok' });
  });
});

