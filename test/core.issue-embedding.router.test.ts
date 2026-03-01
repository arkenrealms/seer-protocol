const fs = require('node:fs');
const path = require('node:path');

describe('core issue embedding router wiring', () => {
  it('registers issue embedding procedures on the core router', () => {
    const routerPath = path.resolve(process.cwd(), 'core/core.router.ts');
    const source = fs.readFileSync(routerPath, 'utf8');

    expect(source).toContain('getIssueEmbedding: procedure');
    expect(source).toContain('getIssueEmbeddings: procedure');
    expect(source).toContain('upsertIssueEmbedding: procedure');
    expect(source).toContain('upsertIssueEmbeddingsBatch: procedure');
    expect(source).toContain('searchIssueEmbeddings: procedure');
    expect(source).toContain("ctx.app.service.Core.searchIssueEmbeddings");
  });
});
