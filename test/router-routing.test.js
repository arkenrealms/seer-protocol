// arken/packages/seer/packages/protocol/test/router-routing.test.ts
const fs = require('node:fs/promises');
const path = require('node:path');

describe('isles/infinite router method routing', () => {
  const root = process.cwd();

  test('isles router resolves method-matched handlers with Isles-first and Evolution fallback', async () => {
    const source = await fs.readFile(path.resolve(root, 'isles', 'isles.router.ts'), 'utf8');

    expect(source).toMatch(/import\s+\{\s*initTRPC\s*,\s*TRPCError\s*\}\s+from\s+'@trpc\/server';/);
    expect(source).toMatch(/const resolveIslesHandler/);
    expect(source).toMatch(/service\?\.Isles/);
    expect(source).toMatch(/hasOwnProperty\.call\(islesService, methodName\)/);
    expect(source).toMatch(/hasOwnProperty\.call\(evolutionService, methodName\)/);
    expect(source).toMatch(/resolveIslesHandler\(ctx, 'interact'\)/);
    expect(source).toMatch(/resolveIslesHandler\(ctx, 'getScene'\)/);
    expect(source).not.toMatch(/Evolution\.saveRound as any\)\(input, ctx\)/);
  });

  test('infinite router resolves method-matched handlers with Infinite-first and Evolution fallback', async () => {
    const source = await fs.readFile(path.resolve(root, 'infinite', 'infinite.router.ts'), 'utf8');

    expect(source).toMatch(/import\s+\{\s*initTRPC\s*,\s*TRPCError\s*\}\s+from\s+'@trpc\/server';/);
    expect(source).toMatch(/const resolveInfiniteHandler/);
    expect(source).toMatch(/service\?\.Infinite/);
    expect(source).toMatch(/hasOwnProperty\.call\(infiniteService, methodName\)/);
    expect(source).toMatch(/hasOwnProperty\.call\(evolutionService, methodName\)/);
    expect(source).toMatch(/resolveInfiniteHandler\(ctx, 'interact'\)/);
    expect(source).toMatch(/resolveInfiniteHandler\(ctx, 'getScene'\)/);
    expect(source).not.toMatch(/Evolution\.saveRound as any\)\(input, ctx\)/);
  });
});
