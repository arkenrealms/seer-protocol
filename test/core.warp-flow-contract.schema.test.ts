const fs = require('node:fs');
const path = require('node:path');

describe('core warp flow activity contract wiring', () => {
  it('declares ingest/query/output schemas with expected defaults and fields', () => {
    const schemaPath = path.resolve(process.cwd(), 'core/core.schema.ts');
    const source = fs.readFileSync(schemaPath, 'utf8');

    expect(source).toContain("export const WarpFlowIssueState = z.enum(['idle', 'addingIssue', 'issueCreated']);");
    expect(source).toContain("export const WarpFlowActivitySource = z.enum(['simulated', 'llm']);");
    expect(source).toContain("style: z.enum(['floating', 'anchored']).default('floating'),");
    expect(source).toContain('activitySource: WarpFlowActivitySource.default(\'simulated\'),');
    expect(source).toContain('export const WarpFlowActivityInference = z.object({');
    expect(source).toContain("signal: z.enum(['origin-agent', 'origin-non-agent', 'unknown']).default('unknown'),");
    expect(source).toContain('activityInference: WarpFlowActivityInference.optional(),');
    expect(source).toContain('renderHint: WarpFlowRenderHint.optional(),');
    expect(source).toContain('export const WarpFlowActivityIngestInput = z.object({');
    expect(source).toContain('source: z.string().min(1),');
    expect(source).toContain('snapshot: WarpFlowSnapshot,');

    expect(source).toContain('export const WarpFlowActivityQueryInput = z.object({');
    expect(source).toContain('since: z.coerce.date().optional(),');
    expect(source).toContain('limit: z.number().int().min(1).max(500).default(100),');

    expect(source).toContain('export const WarpFlowActivityQueryOutput = z.object({');
    expect(source).toContain('status: z.number().default(200),');
  });
});
