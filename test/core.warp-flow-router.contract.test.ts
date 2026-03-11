const fs = require('node:fs');
const path = require('node:path');

describe('core warp flow router contract wiring', () => {
  it('wires ingest/query procedures with expected auth + schema contracts', () => {
    const routerPath = path.resolve(process.cwd(), 'core/core.router.ts');
    const source = fs.readFileSync(routerPath, 'utf8');

    expect(source).toContain("ingestWarpFlowActivity: warp");
    expect(source).toContain(".procedure('core.ingestWarpFlowActivity')");
    expect(source).toContain(".use(hasRole('guest', t))");
    expect(source).toContain('.input(WarpFlowActivityIngestInput)');
    expect(source).toContain('.output(WarpFlowActivityQueryOutput)');
    expect(source).toContain('.mutation()');

    expect(source).toContain("getWarpFlowActivity: warp");
    expect(source).toContain(".view('core.getWarpFlowActivity')");
    expect(source).toContain('.input(WarpFlowActivityQueryInput.optional())');
    expect(source).toContain('.query()');
  });
});
