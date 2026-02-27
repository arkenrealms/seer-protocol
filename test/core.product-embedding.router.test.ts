const fs = require('node:fs');
const path = require('node:path');

describe('core product embedding router wiring', () => {
  it('registers product embedding procedures on the core router', () => {
    const filePath = path.resolve(__dirname, '../core/core.router.ts');
    const source = fs.readFileSync(filePath, 'utf8');

    expect(source).toContain('getProductEmbedding: procedure');
    expect(source).toContain('getProductEmbeddings: procedure');
    expect(source).toContain('upsertProductEmbedding: procedure');
    expect(source).toContain('upsertProductEmbeddingsBatch: procedure');
    expect(source).toContain('searchProductEmbeddings: procedure');
  });
});
