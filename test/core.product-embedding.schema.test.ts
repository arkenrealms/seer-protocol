const fs = require('node:fs');
const path = require('node:path');

describe('core product embedding schema wiring', () => {
  it('declares ProductEmbedding contracts in core.schema.ts', () => {
    const schemaPath = path.resolve(process.cwd(), 'core/core.schema.ts');
    const source = fs.readFileSync(schemaPath, 'utf8');

    expect(source).toContain('export const ProductEmbedding = Entity.merge');
    expect(source).toContain("entityType: z.literal('product').default('product').optional()");
    expect(source).toContain('export const ProductEmbeddingUpsertInput = z');
    expect(source).toContain('export const ProductEmbeddingBatchUpsertInput = z');
  });
});
