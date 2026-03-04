const fs = require('node:fs');
const path = require('node:path');

describe('core warp flow router contract wiring', () => {
  it('wires ingest/query procedures with expected auth + schema contracts', () => {
    const routerPath = path.resolve(process.cwd(), 'core/core.router.ts');
    const source = fs.readFileSync(routerPath, 'utf8');

    expect(source).toContain('ingestWarpFlowActivity: procedure');
    expect(source).toContain(".use(hasRole('guest', t))");
    expect(source).toContain('.input(WarpFlowActivityIngestInput)');
    expect(source).toContain('.output(WarpFlowActivityQueryOutput)');
    expect(source).toContain('(ctx.app.service.Core.ingestWarpFlowActivity as any)(input, ctx)');

    expect(source).toContain('getWarpFlowActivity: procedure');
    expect(source).toContain('.input(WarpFlowActivityQueryInput.optional())');
    expect(source).toContain('(ctx.app.service.Core.getWarpFlowActivity as any)(input, ctx)');
  });
});
