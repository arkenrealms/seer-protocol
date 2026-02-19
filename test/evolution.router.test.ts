// arken/packages/seer/packages/protocol/test/evolution.router.test.ts
const fs = require('node:fs/promises');
const path = require('node:path');

describe('evolution router dispatch shape', () => {
  const root = process.cwd();

  test('uses direct service dispatch while preserving query/mutation semantics', async () => {
    const source = await fs.readFile(path.resolve(root, 'evolution', 'evolution.router.ts'), 'utf8');

    const infoBlock = source.match(/info:[\s\S]*?(?=\n\s*updateConfig:)/)?.[0] ?? '';
    const updateConfigBlock = source.match(/updateConfig:[\s\S]*?(?=\n\s*updateGameStats:)/)?.[0] ?? '';
    const monitorPartiesBlock =
      source.match(/monitorParties:[\s\S]*?(?=\n\s*getParties:)/)?.[0] ?? '';
    const updateSettingsBlock =
      source.match(/updateSettings:[\s\S]*?(?=\n\s*getPayments:)/)?.[0] ?? '';

    expect(source).toMatch(/import\s+\{\s*initTRPC\s*\}\s+from\s+'@trpc\/server';/);
    expect(source).not.toMatch(/TRPCError/);

    expect(infoBlock).toMatch(/\.query\(\(\{ input, ctx \}\) => \(ctx\.app\.service\.Evolution\.info as any\)\(input, ctx\)\)/);

    expect(updateConfigBlock).toMatch(/\.mutation\(\(\{ input, ctx \}\) => \(ctx\.app\.service\.Evolution\.updateConfig as any\)\(input, ctx\)\)/);
    expect(updateConfigBlock).not.toMatch(/\.query\(\(\{ input, ctx \}\) =>/);

    expect(monitorPartiesBlock).toMatch(
      /\.query\(\(\{ input, ctx \}\) => \(ctx\.app\.service\.Evolution\.monitorParties as any\)\(input, ctx\)\)/
    );

    expect(updateSettingsBlock).toMatch(
      /\.mutation\(\(\{ input, ctx \}\) => \(ctx\.app\.service\.Evolution\.updateSettings as any\)\(input, ctx\)\)/
    );
    expect(updateSettingsBlock).not.toMatch(/\.query\(\(\{ input, ctx \}\) =>/);

    expect(source).not.toMatch(/Object\.prototype\.hasOwnProperty\.call\(evolutionService/);
    expect(source).not.toMatch(/Object\.getOwnPropertyDescriptor\(evolutionService/);
  });
});
