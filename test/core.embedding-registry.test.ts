const fs = require('node:fs');
const path = require('node:path');

describe('core embedding registry integrity', () => {
  it('includes ProductEmbedding in RootEntity enum list', () => {
    const schemaPath = path.resolve(__dirname, '..', 'core', 'core.schema.ts');
    const source = fs.readFileSync(schemaPath, 'utf8');

    expect(source).toContain("'IssueEmbedding'");
    expect(source).toContain("'ProjectEmbedding'");
    expect(source).toContain("'ProductEmbedding'");
    expect(source).toContain("'AgentEmbedding'");
  });

  it('binds IssueEmbedding model to IssueEmbedding collection', () => {
    const modelsPath = path.resolve(__dirname, '..', 'core', 'core.models.ts');
    const source = fs.readFileSync(modelsPath, 'utf8');

    expect(source).toContain('export const IssueEmbedding = createModel<Types.IssueEmbeddingDocument>(');
    expect(source).toContain("'IssueEmbedding',\n  'IssueEmbedding',");
  });
});
