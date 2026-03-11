const fs = require('node:fs');
const path = require('node:path');

describe('novelist router contract wiring', () => {
  it('wires the shared novelist contract with expected auth and schemas', () => {
    const routerPath = path.resolve(process.cwd(), 'novelist/novelist.router.ts');
    const source = fs.readFileSync(routerPath, 'utf8');

    expect(source).toContain('getProject: procedure');
    expect(source).toContain(".use(hasRole('guest', t))");
    expect(source).toContain('.input(NovelistProjectIdInput)');
    expect(source).toContain('.output(NovelistProjectLoadResultSchema)');

    expect(source).toContain('saveProject: procedure');
    expect(source).toContain(".use(hasRole('user', t))");
    expect(source).toContain('.input(NovelistProjectSaveInput)');
    expect(source).toContain('.output(NovelistProjectSaveResultSchema)');

    expect(source).toContain('generateRevision: procedure');
    expect(source).toContain('.input(NovelistGenerateRevisionInputSchema)');
    expect(source).toContain('.output(NovelistGenerateRevisionResultSchema)');

    expect(source).toContain('resolveRevision: procedure');
    expect(source).toContain('.input(NovelistResolveRevisionInputSchema)');
    expect(source).toContain('.output(NovelistResolveRevisionResultSchema)');

    expect(source).toContain('createSnapshot: procedure');
    expect(source).toContain('.input(NovelistCreateSnapshotInputSchema)');
    expect(source).toContain('.output(NovelistCreateSnapshotResultSchema)');

    expect(source).toContain('restoreSnapshot: procedure');
    expect(source).toContain('.input(NovelistRestoreSnapshotInputSchema)');
    expect(source).toContain('.output(NovelistRestoreSnapshotResultSchema)');

    expect(source).toContain('runAnalysis: procedure');
    expect(source).toContain('.input(NovelistRunAnalysisInputSchema)');
    expect(source).toContain('.output(NovelistRunAnalysisResultSchema)');

    expect(source).toContain('exportEdition: procedure');
    expect(source).toContain('.input(NovelistExportEditionInputSchema)');
    expect(source).toContain('.output(NovelistExportEditionResultSchema)');

    expect(source).toContain('searchCanon: procedure');
    expect(source).toContain('.input(NovelistSearchCanonInput)');
    expect(source).toContain('.output(CanonCatalogItemSchema.array())');
  });
});
