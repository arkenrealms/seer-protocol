const fs = require('node:fs');
const path = require('node:path');

describe('SeerEvent index definition hygiene', () => {
  it('avoids duplicate seq/timestamp index declarations in field and schema options', () => {
    const modelsPath = path.resolve(__dirname, '..', 'core', 'core.models.ts');
    const source = fs.readFileSync(modelsPath, 'utf8');

    expect(source).toContain("export const SeerEvent = mongo.createModel<Types.SeerEventDocument>(");
    expect(source).toContain('indexes: [{ seq: 1 }, { timestamp: 1 }]');

    // Guard against reintroducing Mongoose duplicate index warnings.
    expect(source).not.toContain('seq: { type: Number, required: true, index: true }');
    expect(source).not.toContain('timestamp: { type: Date, default: Date.now, index: true }');
  });
});
