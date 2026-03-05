const fs = require('node:fs');
const path = require('node:path');

describe('Memory retrieval index coverage', () => {
  it('defines dominant app/model/entity/time/type indexes for memory retrieval records', () => {
    const modelsPath = path.resolve(__dirname, '..', 'core', 'core.models.ts');
    const source = fs.readFileSync(modelsPath, 'utf8');

    expect(source).toContain("{ applicationId: 1, recordType: 1, createdDate: -1 }");
    expect(source).toContain("{ 'writebackEvent.category': 1, createdDate: -1 }");
    expect(source).toContain("{ 'retrievalRequest.startedAt': -1 }");
    expect(source).toContain(
      '{ applicationId: 1, modelId: 1, vectorDimensions: 1, entityType: 1, updatedDate: -1, createdDate: -1 }'
    );
  });
});
