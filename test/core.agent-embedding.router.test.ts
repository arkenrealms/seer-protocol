const fs = require('node:fs');
const path = require('node:path');

describe('core agent embedding router wiring', () => {
  it('registers agent embedding procedures on the core router', () => {
    const filePath = path.resolve(__dirname, '../core/core.router.ts');
    const source = fs.readFileSync(filePath, 'utf8');

    expect(source).toContain('getAgentEmbedding: procedure');
    expect(source).toContain('getAgentEmbeddings: procedure');
    expect(source).toContain('upsertAgentEmbedding: procedure');
    expect(source).toContain('upsertAgentEmbeddingsBatch: procedure');
    expect(source).toContain('searchAgentEmbeddings: procedure');
  });
});
