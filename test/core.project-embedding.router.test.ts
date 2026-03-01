const fs = require('node:fs');
const path = require('node:path');

describe('core project embedding router wiring', () => {
  it('registers project embedding procedures on the core router', () => {
    const routerPath = path.resolve(process.cwd(), 'core/core.router.ts');
    const source = fs.readFileSync(routerPath, 'utf8');

    expect(source).toContain('getProjectEmbedding: procedure');
    expect(source).toContain('getProjectEmbeddings: procedure');
    expect(source).toContain('upsertProjectEmbedding: procedure');
    expect(source).toContain('upsertProjectEmbeddingsBatch: procedure');
    expect(source).toContain('searchProjectEmbeddings: procedure');
    expect(source).toContain('ctx.app.service.Core.searchProjectEmbeddings');
  });
});
