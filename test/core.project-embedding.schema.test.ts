const fs = require('node:fs');
const path = require('node:path');

describe('core project embedding schema wiring', () => {
  it('declares ProjectEmbedding contracts in core.schema.ts', () => {
    const schemaPath = path.resolve(process.cwd(), 'core/core.schema.ts');
    const source = fs.readFileSync(schemaPath, 'utf8');

    expect(source).toContain('export const ProjectEmbedding = Entity.merge');
    expect(source).toContain("entityType: z.literal('project').default('project').optional()");
    expect(source).toContain('export const ProjectEmbeddingUpsertInput = z');
    expect(source).toContain('export const ProjectEmbeddingBatchUpsertInput = z');
  });
});
