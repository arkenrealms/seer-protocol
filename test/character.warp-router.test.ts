const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

function loadTsModule(relativePath) {
  const root = process.cwd();
  const filePath = path.resolve(root, relativePath);
  const source = fs.readFileSync(filePath, 'utf8');

  let { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: filePath,
  });

  outputText = outputText.replace(/require\(["'](\.\.?\/[^"']+)["']\)/g, (full, spec) => {
    const tsPath = path.resolve(path.dirname(filePath), `${spec}.ts`);
    return fs.existsSync(tsPath) ? `require("${spec}.ts")` : full;
  });

  const prior = Module._extensions['.ts'];
  Module._extensions['.ts'] = (mod, filename) => {
    const src = fs.readFileSync(filename, 'utf8');
    let { outputText: js } = ts.transpileModule(src, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
      fileName: filename,
    });
    js = js.replace(/require\(["'](\.\.?\/[^"']+)["']\)/g, (f, s) => {
      const maybe = path.resolve(path.dirname(filename), `${s}.ts`);
      return fs.existsSync(maybe) ? `require("${s}.ts")` : f;
    });
    mod._compile(js, filename);
  };

  try {
    const m = new Module.Module(filePath, module);
    m.filename = filePath;
    m.paths = Module.Module._nodeModulePaths(path.dirname(filePath));
    m._compile(outputText, filePath);
    return m.exports;
  } finally {
    Module._extensions['.ts'] = prior;
  }
}

describe('character warp router wiring', () => {
  const routerPath = path.resolve(process.cwd(), 'character/character.router.ts');
  const originalEnv = { ...process.env };
  const reducerLoaderPath = path.resolve(__dirname, 'fixtures', 'warpspeed', 'loader.cjs');
  const characterTaxonomySpecs = [
    {
      noun: 'Class',
      modelName: 'CharacterClass',
      getUnit: 'character.getCharacterClass',
      updateUnit: 'character.updateCharacterClass',
      getServiceMethod: 'getCharacterClass',
      updateServiceMethod: 'updateCharacterClass',
      getFlag: 'WARPSPEED_ENABLE_GET_CHARACTER_CLASS_REDUCER',
      updateFlag: 'WARPSPEED_ENABLE_UPDATE_CHARACTER_CLASS_REDUCER',
      sampleId: 'class-1',
      readResult: { id: 'class-1', name: 'Chronomancer' },
      updateData: { name: 'Chronomancer Prime' },
      updateResult: { id: 'class-1', name: 'Chronomancer Prime' },
    },
    {
      noun: 'Faction',
      modelName: 'CharacterFaction',
      getUnit: 'character.getCharacterFaction',
      updateUnit: 'character.updateCharacterFaction',
      getServiceMethod: 'getCharacterFaction',
      updateServiceMethod: 'updateCharacterFaction',
      getFlag: 'WARPSPEED_ENABLE_GET_CHARACTER_FACTION_REDUCER',
      updateFlag: 'WARPSPEED_ENABLE_UPDATE_CHARACTER_FACTION_REDUCER',
      sampleId: 'faction-1',
      readResult: { id: 'faction-1', name: 'Wayfarers' },
      updateData: { name: 'Wayfarers Prime' },
      updateResult: { id: 'faction-1', name: 'Wayfarers Prime' },
    },
    {
      noun: 'Gender',
      modelName: 'CharacterGender',
      getUnit: 'character.getCharacterGender',
      updateUnit: 'character.updateCharacterGender',
      getServiceMethod: 'getCharacterGender',
      updateServiceMethod: 'updateCharacterGender',
      getFlag: 'WARPSPEED_ENABLE_GET_CHARACTER_GENDER_REDUCER',
      updateFlag: 'WARPSPEED_ENABLE_UPDATE_CHARACTER_GENDER_REDUCER',
      sampleId: 'gender-1',
      readResult: { id: 'gender-1', name: 'Flux' },
      updateData: { name: 'Flux Prime' },
      updateResult: { id: 'gender-1', name: 'Flux Prime' },
    },
    {
      noun: 'NameChoice',
      modelName: 'CharacterNameChoice',
      getUnit: 'character.getCharacterNameChoice',
      updateUnit: 'character.updateCharacterNameChoice',
      getServiceMethod: 'getCharacterNameChoice',
      updateServiceMethod: 'updateCharacterNameChoice',
      getFlag: 'WARPSPEED_ENABLE_GET_CHARACTER_NAME_CHOICE_REDUCER',
      updateFlag: 'WARPSPEED_ENABLE_UPDATE_CHARACTER_NAME_CHOICE_REDUCER',
      sampleId: 'name-choice-1',
      readResult: { id: 'name-choice-1', name: 'Starseer' },
      updateData: { name: 'Starseer Prime' },
      updateResult: { id: 'name-choice-1', name: 'Starseer Prime' },
    },
    {
      noun: 'Personality',
      modelName: 'CharacterPersonality',
      getUnit: 'character.getCharacterPersonality',
      updateUnit: 'character.updateCharacterPersonality',
      getServiceMethod: 'getCharacterPersonality',
      updateServiceMethod: 'updateCharacterPersonality',
      getFlag: 'WARPSPEED_ENABLE_GET_CHARACTER_PERSONALITY_REDUCER',
      updateFlag: 'WARPSPEED_ENABLE_UPDATE_CHARACTER_PERSONALITY_REDUCER',
      sampleId: 'personality-1',
      readResult: { id: 'personality-1', name: 'Stoic' },
      updateData: { name: 'Resolute' },
      updateResult: { id: 'personality-1', name: 'Resolute' },
    },
    {
      noun: 'Race',
      modelName: 'CharacterRace',
      getUnit: 'character.getCharacterRace',
      updateUnit: 'character.updateCharacterRace',
      getServiceMethod: 'getCharacterRace',
      updateServiceMethod: 'updateCharacterRace',
      getFlag: 'WARPSPEED_ENABLE_GET_CHARACTER_RACE_REDUCER',
      updateFlag: 'WARPSPEED_ENABLE_UPDATE_CHARACTER_RACE_REDUCER',
      sampleId: 'race-1',
      readResult: { id: 'race-1', name: 'Aetherborn' },
      updateData: { name: 'Aetherborn Prime' },
      updateResult: { id: 'race-1', name: 'Aetherborn Prime' },
    },
    {
      noun: 'Title',
      modelName: 'CharacterTitle',
      getUnit: 'character.getCharacterTitle',
      updateUnit: 'character.updateCharacterTitle',
      getServiceMethod: 'getCharacterTitle',
      updateServiceMethod: 'updateCharacterTitle',
      getFlag: 'WARPSPEED_ENABLE_GET_CHARACTER_TITLE_REDUCER',
      updateFlag: 'WARPSPEED_ENABLE_UPDATE_CHARACTER_TITLE_REDUCER',
      sampleId: 'title-1',
      readResult: { id: 'title-1', name: 'Sky Marshal' },
      updateData: { name: 'High Sky Marshal' },
      updateResult: { id: 'title-1', name: 'High Sky Marshal' },
    },
    {
      noun: 'Type',
      modelName: 'CharacterType',
      getUnit: 'character.getCharacterType',
      updateUnit: 'character.updateCharacterType',
      getServiceMethod: 'getCharacterType',
      updateServiceMethod: 'updateCharacterType',
      getFlag: 'WARPSPEED_ENABLE_GET_CHARACTER_TYPE_REDUCER',
      updateFlag: 'WARPSPEED_ENABLE_UPDATE_CHARACTER_TYPE_REDUCER',
      sampleId: 'type-1',
      readResult: { id: 'type-1', name: 'Operator' },
      updateData: { name: 'Prime Operator' },
      updateResult: { id: 'type-1', name: 'Prime Operator' },
    },
  ];

  const restoreProcessEnv = () => {
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) {
        delete process.env[key];
      }
    }

    for (const [key, value] of Object.entries(originalEnv)) {
      process.env[key] = value;
    }
  };

  beforeEach(() => {
    restoreProcessEnv();
    delete process.env.WARPSPEED_ENABLE_ROUTE_REDUCERS;
    delete process.env.WARPSPEED_ENABLE_REDUCERS;
    delete process.env.WARPSPEED_ENABLE_CHARACTER_VIEWS;
    delete process.env.WARPSPEED_ENABLE_CHARACTER_REDUCERS;
    delete process.env.WARPSPEED_ENABLE_GET_CHARACTER_ABILITY_REDUCER;
    delete process.env.WARPSPEED_ENABLE_GET_CHARACTER_ATTRIBUTE_REDUCER;
    delete process.env.WARPSPEED_ENABLE_GET_CHARACTER_INVENTORY_REDUCER;
    delete process.env.WARPSPEED_ENABLE_GET_CHARACTER_INVENTORY_RECEIPT_REDUCER;
    delete process.env.WARPSPEED_ENABLE_SYNC_CHARACTER_INVENTORY_REDUCER;
    delete process.env.WARPSPEED_ENABLE_APPLY_CHARACTER_INVENTORY_PATCH_REDUCER;
    delete process.env.WARPSPEED_ENABLE_EXCHANGE_CHARACTER_ITEM_REDUCER;
    delete process.env.WARPSPEED_ENABLE_UPDATE_CHARACTER_ABILITY_REDUCER;
    delete process.env.WARPSPEED_ENABLE_UPDATE_CHARACTER_ATTRIBUTE_REDUCER;
    for (const spec of characterTaxonomySpecs) {
      delete process.env[spec.getFlag];
      delete process.env[spec.updateFlag];
    }
    delete process.env.WARPSPEED_ARTIFACT_DIR;
    delete require.cache[reducerLoaderPath];
  });

  afterAll(() => {
    restoreProcessEnv();
  });

  test('character router binds inventory reads through warp.view with Character service fallback', () => {
    const source = fs.readFileSync(routerPath, 'utf8');

    expect(source).toContain("import { createWarpTrpcBindings } from '../core/warpspeed';");
    expect(source).toContain("const warp = createWarpTrpcBindings(procedure, { serviceName: 'Character' });");
    expect(source).toContain(".view('character.getCharacterAbility')");
    expect(source).toContain(".view('character.getCharacterAttribute')");
    expect(source).toContain(".view('character.getCharacterInventory')");
    expect(source).toContain(".view('character.getCharacterInventoryReceipt')");
    expect(source).toContain(".view('character.getCharacterInventoryAuditExport')");
    expect(source).toContain(".reducer('character.syncCharacterInventory')");
    expect(source).toContain(".view('character.getCharacterFactions')");
    expect(source).toContain(".reducer('character.updateCharacterAbility')");
    expect(source).toContain(".reducer('character.updateCharacterAttribute')");
    expect(source).toContain(".reducer('character.applyCharacterInventoryPatch')");
    expect(source).toContain(".reducer('character.exchangeCharacterItem')");
    expect(source).toContain(".reducer('character.createCharacterFaction')");
    for (const spec of characterTaxonomySpecs) {
      expect(source).toContain(`.view('${spec.getUnit}')`);
      expect(source).toContain(`.reducer('${spec.updateUnit}')`);
    }
    expect(source).toContain('.output(');
  });

  test('service-aware warp.view bindings fall back to Character ability methods by unit name', async () => {
    const { createWarpTrpcBindings } = loadTsModule('core/warpspeed.ts');
    const serviceGetCharacterAbility = jest.fn(async () => ({
      id: 'ability-1',
      name: 'Shadow Bolt',
    }));
    const procedure = {
      use: jest.fn(() => procedure),
      input: jest.fn(() => procedure),
      output: jest.fn(() => procedure),
      query: jest.fn((handler) => handler),
      mutation: jest.fn((handler) => handler),
    };

    const warp = createWarpTrpcBindings(procedure, { serviceName: 'Character' });
    const handler = warp
      .view('character.getCharacterAbility')
      .use(Symbol('middleware'))
      .input(Symbol('input'))
      .query();

    const ctx = {
      app: {
        service: {
          Character: {
            getCharacterAbility: serviceGetCharacterAbility,
          },
        },
        model: {},
        filters: {},
      },
      client: { roles: ['guest'] },
    };

    const input = { where: { id: { equals: 'ability-1' } } };
    const result = await handler({ input, ctx });

    expect(serviceGetCharacterAbility).toHaveBeenCalledTimes(1);
    expect(serviceGetCharacterAbility).toHaveBeenCalledWith(input, ctx);
    expect(result).toEqual({
      id: 'ability-1',
      name: 'Shadow Bolt',
    });
  });

  test('service-aware warp.view bindings fall back to Character service methods by unit name', async () => {
    const { createWarpTrpcBindings } = loadTsModule('core/warpspeed.ts');
    const serviceGetCharacterInventory = jest.fn(async () => ({
      characterId: 'character-1',
      inventory: [{ items: [{ itemId: 'item-sword' }] }],
    }));
    const procedure = {
      use: jest.fn(() => procedure),
      input: jest.fn(() => procedure),
      output: jest.fn(() => procedure),
      query: jest.fn((handler) => handler),
      mutation: jest.fn((handler) => handler),
    };

    const warp = createWarpTrpcBindings(procedure, { serviceName: 'Character' });
    const handler = warp
      .view('character.getCharacterInventory')
      .use(Symbol('middleware'))
      .input(Symbol('input'))
      .mutation();

    const ctx = {
      app: {
        service: {
          Character: {
            getCharacterInventory: serviceGetCharacterInventory,
          },
        },
        model: {},
        filters: {},
      },
      client: { roles: ['user'] },
    };

    const input = { characterId: 'character-1' };
    const result = await handler({ input, ctx });

    expect(serviceGetCharacterInventory).toHaveBeenCalledTimes(1);
    expect(serviceGetCharacterInventory).toHaveBeenCalledWith(input, ctx);
    expect(result).toEqual({
      characterId: 'character-1',
      inventory: [{ items: [{ itemId: 'item-sword' }] }],
    });
  });

  test('service-aware warp.view bindings fall back to Character inventory receipt by unit name', async () => {
    const { createWarpTrpcBindings } = loadTsModule('core/warpspeed.ts');
    const serviceGetCharacterInventoryReceipt = jest.fn(async () => ({
      version: 1,
      verificationMode: 'audited',
      tableName: 'characterInventoryItems',
      characterId: 'character-1',
      rowCount: 1,
      nextRecordPk: 2,
      receiptHash: 'receipt-1',
      exportHash: 'export-1',
      updatedDate: '2026-03-11T00:00:00.000Z',
    }));
    const procedure = {
      use: jest.fn(() => procedure),
      input: jest.fn(() => procedure),
      output: jest.fn(() => procedure),
      query: jest.fn((handler) => handler),
      mutation: jest.fn((handler) => handler),
    };

    const warp = createWarpTrpcBindings(procedure, { serviceName: 'Character' });
    const handler = warp
      .view('character.getCharacterInventoryReceipt')
      .use(Symbol('middleware'))
      .input(Symbol('input'))
      .query();

    const ctx = {
      app: {
        service: {
          Character: {
            getCharacterInventoryReceipt: serviceGetCharacterInventoryReceipt,
          },
        },
        model: {},
        filters: {},
      },
      client: { roles: ['user'] },
    };

    const input = { characterId: 'character-1' };
    const result = await handler({ input, ctx });

    expect(serviceGetCharacterInventoryReceipt).toHaveBeenCalledTimes(1);
    expect(serviceGetCharacterInventoryReceipt).toHaveBeenCalledWith(input, ctx);
    expect(result).toEqual({
      version: 1,
      verificationMode: 'audited',
      tableName: 'characterInventoryItems',
      characterId: 'character-1',
      rowCount: 1,
      nextRecordPk: 2,
      receiptHash: 'receipt-1',
      exportHash: 'export-1',
      updatedDate: '2026-03-11T00:00:00.000Z',
    });
  });

  test('service-aware warp.view bindings fall back to Character inventory audit export by unit name', async () => {
    const { createWarpTrpcBindings } = loadTsModule('core/warpspeed.ts');
    const serviceGetCharacterInventoryAuditExport = jest.fn(async () => ({
      receipt: {
        version: 1,
        verificationMode: 'audited',
        tableName: 'characterInventoryItems',
        characterId: 'character-1',
        rowCount: 1,
        nextRecordPk: 2,
        receiptHash: 'receipt-1',
        exportHash: 'export-1',
        updatedDate: '2026-03-11T00:00:00.000Z',
      },
      exportHash: 'export-1',
      publication: {
        publisherId: 'seer-node-1',
        publishedAt: '2026-03-11T00:00:00.000Z',
        publicationHash: 'publication-1',
        exportHash: 'export-1',
        receiptHash: 'receipt-1',
        signatureMaterial: {
          algorithm: 'sha256-envelope-v1',
          signerId: 'seer-node-1',
          payload: '{"tableName":"characterInventoryItems"}',
          payloadHash: 'payload-hash-1',
        },
      },
      proofBundle: {
        algorithm: 'sha256-merkle-v1',
        tableName: 'characterInventoryItems',
        characterId: 'character-1',
        receiptHash: 'receipt-1',
        exportHash: 'export-1',
        publicationHash: 'publication-1',
        rowCount: 1,
        merkleRoot: 'merkle-root-1',
        rows: [
          {
            recordPk: 1,
            recordId: 'character-1:1',
            rowHash: 'row-hash-1',
            leafHash: 'leaf-hash-1',
            proof: [],
          },
        ],
      },
      inventory: [{ items: [{ itemId: 'item-sword' }] }],
      rows: [
        {
          recordPk: 1,
          recordId: 'character-1:1',
          characterId: 'character-1',
          bagIndex: 0,
          slotIndex: 0,
          itemId: 'item-sword',
          quantity: 1,
          hasExplicitQuantity: false,
          item: { itemId: 'item-sword' },
          rowHash: 'row-hash-1',
        },
      ],
    }));
    const procedure = {
      use: jest.fn(() => procedure),
      input: jest.fn(() => procedure),
      output: jest.fn(() => procedure),
      query: jest.fn((handler) => handler),
      mutation: jest.fn((handler) => handler),
    };

    const warp = createWarpTrpcBindings(procedure, { serviceName: 'Character' });
    const handler = warp
      .view('character.getCharacterInventoryAuditExport')
      .use(Symbol('middleware'))
      .input(Symbol('input'))
      .query();

    const ctx = {
      app: {
        service: {
          Character: {
            getCharacterInventoryAuditExport: serviceGetCharacterInventoryAuditExport,
          },
        },
        model: {},
        filters: {},
      },
      client: { roles: ['user'] },
    };

    const input = { characterId: 'character-1' };
    const result = await handler({ input, ctx });

    expect(serviceGetCharacterInventoryAuditExport).toHaveBeenCalledTimes(1);
    expect(serviceGetCharacterInventoryAuditExport).toHaveBeenCalledWith(input, ctx);
    expect(result).toEqual({
      receipt: {
        version: 1,
        verificationMode: 'audited',
        tableName: 'characterInventoryItems',
        characterId: 'character-1',
        rowCount: 1,
        nextRecordPk: 2,
        receiptHash: 'receipt-1',
        exportHash: 'export-1',
        updatedDate: '2026-03-11T00:00:00.000Z',
      },
      exportHash: 'export-1',
      publication: {
        publisherId: 'seer-node-1',
        publishedAt: '2026-03-11T00:00:00.000Z',
        publicationHash: 'publication-1',
        exportHash: 'export-1',
        receiptHash: 'receipt-1',
        signatureMaterial: {
          algorithm: 'sha256-envelope-v1',
          signerId: 'seer-node-1',
          payload: '{"tableName":"characterInventoryItems"}',
          payloadHash: 'payload-hash-1',
        },
      },
      proofBundle: {
        algorithm: 'sha256-merkle-v1',
        tableName: 'characterInventoryItems',
        characterId: 'character-1',
        receiptHash: 'receipt-1',
        exportHash: 'export-1',
        publicationHash: 'publication-1',
        rowCount: 1,
        merkleRoot: 'merkle-root-1',
        rows: [
          {
            recordPk: 1,
            recordId: 'character-1:1',
            rowHash: 'row-hash-1',
            leafHash: 'leaf-hash-1',
            proof: [],
          },
        ],
      },
      inventory: [{ items: [{ itemId: 'item-sword' }] }],
      rows: [
        {
          recordPk: 1,
          recordId: 'character-1:1',
          characterId: 'character-1',
          bagIndex: 0,
          slotIndex: 0,
          itemId: 'item-sword',
          quantity: 1,
          hasExplicitQuantity: false,
          item: { itemId: 'item-sword' },
          rowHash: 'row-hash-1',
        },
      ],
    });
  });

  test('service-aware warp.reducer bindings fall back to Character inventory sync by unit name', async () => {
    const { createWarpTrpcBindings } = loadTsModule('core/warpspeed.ts');
    const serviceSyncCharacterInventory = jest.fn(async () => ({
      characterId: 'character-1',
      inventory: [{ items: [{ itemId: 'item-sword' }] }],
    }));
    const procedure = {
      use: jest.fn(() => procedure),
      input: jest.fn(() => procedure),
      output: jest.fn(() => procedure),
      query: jest.fn((handler) => handler),
      mutation: jest.fn((handler) => handler),
    };

    const warp = createWarpTrpcBindings(procedure, { serviceName: 'Character' });
    const handler = warp
      .reducer('character.syncCharacterInventory')
      .use(Symbol('middleware'))
      .input(Symbol('input'))
      .mutation();

    const ctx = {
      app: {
        service: {
          Character: {
            syncCharacterInventory: serviceSyncCharacterInventory,
          },
        },
        model: {},
        filters: {},
      },
      client: { roles: ['user'], profile: { id: 'profile-1' } },
    };

    const input = { characterId: 'character-1', mode: 'refresh' };
    const result = await handler({ input, ctx });

    expect(serviceSyncCharacterInventory).toHaveBeenCalledTimes(1);
    expect(serviceSyncCharacterInventory).toHaveBeenCalledWith(input, ctx);
    expect(result).toEqual({
      characterId: 'character-1',
      inventory: [{ items: [{ itemId: 'item-sword' }] }],
    });
  });

  test('service-aware warp.view bindings fall back to Character attribute methods by unit name', async () => {
    const { createWarpTrpcBindings } = loadTsModule('core/warpspeed.ts');
    const serviceGetCharacterAttribute = jest.fn(async () => ({
      id: 'attribute-1',
      name: 'Wisdom',
    }));
    const procedure = {
      use: jest.fn(() => procedure),
      input: jest.fn(() => procedure),
      output: jest.fn(() => procedure),
      query: jest.fn((handler) => handler),
      mutation: jest.fn((handler) => handler),
    };

    const warp = createWarpTrpcBindings(procedure, { serviceName: 'Character' });
    const handler = warp
      .view('character.getCharacterAttribute')
      .use(Symbol('middleware'))
      .input(Symbol('input'))
      .query();

    const ctx = {
      app: {
        service: {
          Character: {
            getCharacterAttribute: serviceGetCharacterAttribute,
          },
        },
        model: {},
        filters: {},
      },
      client: { roles: ['guest'] },
    };

    const input = { where: { id: { equals: 'attribute-1' } } };
    const result = await handler({ input, ctx });

    expect(serviceGetCharacterAttribute).toHaveBeenCalledTimes(1);
    expect(serviceGetCharacterAttribute).toHaveBeenCalledWith(input, ctx);
    expect(result).toEqual({
      id: 'attribute-1',
      name: 'Wisdom',
    });
  });

  test('service-aware warp.reducer bindings fall back to Character inventory patch service methods by unit name', async () => {
    const { createWarpTrpcBindings } = loadTsModule('core/warpspeed.ts');
    const serviceApplyCharacterInventoryPatch = jest.fn(async () => ({
      characterId: 'character-1',
      inventory: [{ items: [{ itemKey: 'sprite-dust', quantity: 3 }] }],
    }));
    const procedure = {
      use: jest.fn(() => procedure),
      input: jest.fn(() => procedure),
      output: jest.fn(() => procedure),
      query: jest.fn((handler) => handler),
      mutation: jest.fn((handler) => handler),
    };

    const warp = createWarpTrpcBindings(procedure, { serviceName: 'Character' });
    const handler = warp
      .reducer('character.applyCharacterInventoryPatch')
      .use(Symbol('middleware'))
      .input(Symbol('input'))
      .mutation();

    const ctx = {
      app: {
        service: {
          Character: {
            applyCharacterInventoryPatch: serviceApplyCharacterInventoryPatch,
          },
        },
        model: {},
        filters: {},
      },
      client: { roles: ['user'], profile: { id: 'profile-1' } },
    };

    const input = {
      characterId: 'character-1',
      ops: [{ op: 'remove', itemKey: 'sprite-dust', quantity: 2 }],
    };
    const result = await handler({ input, ctx });

    expect(serviceApplyCharacterInventoryPatch).toHaveBeenCalledTimes(1);
    expect(serviceApplyCharacterInventoryPatch).toHaveBeenCalledWith(input, ctx);
    expect(result).toEqual({
      characterId: 'character-1',
      inventory: [{ items: [{ itemKey: 'sprite-dust', quantity: 3 }] }],
    });
  });

  test('service-aware warp.reducer bindings fall back to Character exchange item service methods by unit name', async () => {
    const { createWarpTrpcBindings } = loadTsModule('core/warpspeed.ts');
    const serviceExchangeCharacterItem = jest.fn(async () => ({
      characterId: 'character-1',
      inventory: [{ items: [{ itemId: 'item-1', x: 1, y: 1 }] }],
    }));
    const procedure = {
      use: jest.fn(() => procedure),
      input: jest.fn(() => procedure),
      output: jest.fn(() => procedure),
      query: jest.fn((handler) => handler),
      mutation: jest.fn((handler) => handler),
    };

    const warp = createWarpTrpcBindings(procedure, { serviceName: 'Character' });
    const handler = warp
      .reducer('character.exchangeCharacterItem')
      .use(Symbol('middleware'))
      .input(Symbol('input'))
      .mutation();

    const ctx = {
      app: {
        service: {
          Character: {
            exchangeCharacterItem: serviceExchangeCharacterItem,
          },
        },
        model: {},
        filters: {},
      },
      client: { roles: ['user'], profile: { id: 'profile-1' } },
    };

    const input = {
      characterId: 'character-1',
      itemId: 'item-2',
      quantity: 1,
    };
    const result = await handler({ input, ctx });

    expect(serviceExchangeCharacterItem).toHaveBeenCalledTimes(1);
    expect(serviceExchangeCharacterItem).toHaveBeenCalledWith(input, ctx);
    expect(result).toEqual({
      characterId: 'character-1',
      inventory: [{ items: [{ itemId: 'item-1', x: 1, y: 1 }] }],
    });
  });

  test('service-aware warp.reducer bindings fall back to Character ability update methods by unit name', async () => {
    const { createWarpTrpcBindings } = loadTsModule('core/warpspeed.ts');
    const serviceUpdateCharacterAbility = jest.fn(async () => ({
      id: 'ability-1',
      power: 9,
    }));
    const procedure = {
      use: jest.fn(() => procedure),
      input: jest.fn(() => procedure),
      output: jest.fn(() => procedure),
      query: jest.fn((handler) => handler),
      mutation: jest.fn((handler) => handler),
    };

    const warp = createWarpTrpcBindings(procedure, { serviceName: 'Character' });
    const handler = warp
      .reducer('character.updateCharacterAbility')
      .use(Symbol('middleware'))
      .input(Symbol('input'))
      .mutation();

    const ctx = {
      app: {
        service: {
          Character: {
            updateCharacterAbility: serviceUpdateCharacterAbility,
          },
        },
        model: {},
        filters: {},
      },
      client: { roles: ['admin'] },
    };

    const input = {
      where: { id: { equals: 'ability-1' } },
      data: { power: 9 },
    };
    const result = await handler({ input, ctx });

    expect(serviceUpdateCharacterAbility).toHaveBeenCalledTimes(1);
    expect(serviceUpdateCharacterAbility).toHaveBeenCalledWith(input, ctx);
    expect(result).toEqual({
      id: 'ability-1',
      power: 9,
    });
  });

  test('service-aware warp.reducer bindings fall back to Character attribute update methods by unit name', async () => {
    const { createWarpTrpcBindings } = loadTsModule('core/warpspeed.ts');
    const serviceUpdateCharacterAttribute = jest.fn(async () => ({
      id: 'attribute-1',
      bonus: 4,
    }));
    const procedure = {
      use: jest.fn(() => procedure),
      input: jest.fn(() => procedure),
      output: jest.fn(() => procedure),
      query: jest.fn((handler) => handler),
      mutation: jest.fn((handler) => handler),
    };

    const warp = createWarpTrpcBindings(procedure, { serviceName: 'Character' });
    const handler = warp
      .reducer('character.updateCharacterAttribute')
      .use(Symbol('middleware'))
      .input(Symbol('input'))
      .mutation();

    const ctx = {
      app: {
        service: {
          Character: {
            updateCharacterAttribute: serviceUpdateCharacterAttribute,
          },
        },
        model: {},
        filters: {},
      },
      client: { roles: ['admin'] },
    };

    const input = {
      where: { id: { equals: 'attribute-1' } },
      data: { bonus: 4 },
    };
    const result = await handler({ input, ctx });

    expect(serviceUpdateCharacterAttribute).toHaveBeenCalledTimes(1);
    expect(serviceUpdateCharacterAttribute).toHaveBeenCalledWith(input, ctx);
    expect(result).toEqual({
      id: 'attribute-1',
      bonus: 4,
    });
  });

  test('protocol WarpSpeed helper can execute character inventory through the artifact runtime', async () => {
    const {
      buildWarpSpeedReducerCtxForTests,
      resetWarpSpeedReducerRuntimeForTests,
    } = loadTsModule('core/warpspeed.ts');
    process.env.WARPSPEED_ARTIFACT_DIR = path.resolve(__dirname, 'fixtures', 'warpspeed');
    process.env.WARPSPEED_ENABLE_ROUTE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_GET_CHARACTER_INVENTORY_REDUCER = 'true';
    resetWarpSpeedReducerRuntimeForTests();

    const findByIdExec = jest.fn(async () => ({
      id: 'character-1',
      inventory: [{ items: [{ itemId: { valueOf: () => 'item-sword' } }] }],
      data: {
        warpTables: {
          characterInventoryItems: {
            version: 1,
            tableName: 'characterInventoryItems',
            accessName: 'characterInventoryItems',
            primaryKey: 'recordPk',
            externalKey: 'recordId',
            verificationMode: 'audited',
            characterId: 'character-1',
            nextRecordPk: 2,
            bags: [{ items: [] }],
            rows: [
              {
                recordPk: 1,
                recordId: 'character-1:1',
                characterId: 'character-1',
                bagIndex: 0,
                slotIndex: 0,
                itemId: 'item-sword',
                quantity: 1,
                hasExplicitQuantity: false,
                item: {
                  itemId: 'item-sword',
                },
              },
            ],
          },
        },
      },
    }));

    const ctx = {
      app: {
        service: { Character: {} },
        model: {
          Character: {
            findById: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: findByIdExec })),
            })),
          },
        },
        filters: {},
      },
      client: { roles: ['user'], profile: { id: 'profile-1' } },
    };

    const runtime = await require(reducerLoaderPath).loadWarpSpeedArtifacts(path.dirname(reducerLoaderPath));
    const reducerCtx = buildWarpSpeedReducerCtxForTests(ctx, runtime);
    const result = await runtime.executeReducer({
      reducerName: 'character.getCharacterInventory',
      input: { characterId: 'character-1' },
      ctx: reducerCtx,
    });

    expect(findByIdExec).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      characterId: 'character-1',
      inventory: [{ items: [{ itemId: 'item-sword' }] }],
    });
  });

  test('protocol WarpSpeed helper can execute character inventory receipt through the artifact runtime', async () => {
    const {
      buildWarpSpeedReducerCtxForTests,
      resetWarpSpeedReducerRuntimeForTests,
    } = loadTsModule('core/warpspeed.ts');
    process.env.WARPSPEED_ARTIFACT_DIR = path.resolve(__dirname, 'fixtures', 'warpspeed');
    process.env.WARPSPEED_ENABLE_ROUTE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_CHARACTER_VIEWS = 'true';
    process.env.WARPSPEED_ENABLE_GET_CHARACTER_INVENTORY_RECEIPT_REDUCER = 'true';
    resetWarpSpeedReducerRuntimeForTests();

    const findByIdExec = jest.fn(async () => ({
      id: 'character-1',
      inventory: [{ items: [{ itemId: { valueOf: () => 'item-sword' } }] }],
      data: {
        warpTables: {
          characterInventoryItems: {
            version: 1,
            tableName: 'characterInventoryItems',
            accessName: 'characterInventoryItems',
            primaryKey: 'recordPk',
            externalKey: 'recordId',
            verificationMode: 'audited',
            characterId: 'character-1',
            nextRecordPk: 2,
            bags: [{ items: [] }],
            rows: [
              {
                recordPk: 1,
                recordId: 'character-1:1',
                characterId: 'character-1',
                bagIndex: 0,
                slotIndex: 0,
                itemId: 'item-sword',
                quantity: 1,
                hasExplicitQuantity: false,
                item: {
                  itemId: 'item-sword',
                },
              },
            ],
          },
        },
      },
    }));

    const ctx = {
      app: {
        service: { Character: {} },
        model: {
          Character: {
            findById: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: findByIdExec })),
            })),
          },
        },
        filters: {},
      },
      client: { roles: ['user'], profile: { id: 'profile-1' } },
    };

    const runtime = await require(reducerLoaderPath).loadWarpSpeedArtifacts(path.dirname(reducerLoaderPath));
    const reducerCtx = buildWarpSpeedReducerCtxForTests(ctx, runtime);
    const result = await runtime.executeReducer({
      reducerName: 'character.getCharacterInventoryReceipt',
      input: { characterId: 'character-1' },
      ctx: reducerCtx,
    });

    expect(findByIdExec).toHaveBeenCalled();
    expect(result).toEqual(
      expect.objectContaining({
        version: 1,
        verificationMode: 'audited',
        tableName: 'characterInventoryItems',
        characterId: 'character-1',
        rowCount: 1,
        nextRecordPk: 2,
        receiptHash: expect.any(String),
        exportHash: expect.any(String),
      })
    );
  });

  test('protocol WarpSpeed helper can execute character inventory audit export through the artifact runtime', async () => {
    const {
      buildWarpSpeedReducerCtxForTests,
      resetWarpSpeedReducerRuntimeForTests,
    } = loadTsModule('core/warpspeed.ts');
    process.env.WARPSPEED_ARTIFACT_DIR = path.resolve(__dirname, 'fixtures', 'warpspeed');
    process.env.WARPSPEED_ENABLE_ROUTE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_CHARACTER_VIEWS = 'true';
    process.env.WARPSPEED_ENABLE_GET_CHARACTER_INVENTORY_AUDIT_EXPORT_REDUCER = 'true';
    resetWarpSpeedReducerRuntimeForTests();

    const findByIdExec = jest.fn(async () => ({
      id: 'character-1',
      inventory: [{ items: [{ itemId: { valueOf: () => 'item-sword' } }] }],
      data: {
        warpTables: {
          characterInventoryItems: {
            version: 1,
            tableName: 'characterInventoryItems',
            accessName: 'characterInventoryItems',
            primaryKey: 'recordPk',
            externalKey: 'recordId',
            characterId: 'character-1',
            nextRecordPk: 2,
            bags: [{ items: [] }],
            rows: [
              {
                recordPk: 1,
                recordId: 'character-1:1',
                characterId: 'character-1',
                bagIndex: 0,
                slotIndex: 0,
                itemId: 'item-sword',
                quantity: 1,
                hasExplicitQuantity: false,
                item: {
                  itemId: 'item-sword',
                },
              },
            ],
          },
        },
      },
    }));
    const inventoryFindExec = jest.fn(async () => [
      {
        recordPk: 1,
        recordId: 'character-1:1',
        characterId: 'character-1',
        bagIndex: 0,
        slotIndex: 0,
        itemId: 'item-sword',
        quantity: 1,
        hasExplicitQuantity: false,
        item: {
          itemId: 'item-sword',
        },
      },
    ]);
    const receiptFindOneExec = jest.fn(async () => ({
      version: 1,
      verificationMode: 'audited',
      tableName: 'characterInventoryItems',
      characterId: 'character-1',
      rowCount: 1,
      nextRecordPk: 2,
      receiptHash: 'receipt-1',
      exportHash: 'export-1',
      updatedDate: '2026-03-11T00:00:00.000Z',
    }));

    const ctx = {
      app: {
        service: { Character: {} },
        model: {
          Character: {
            findById: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: findByIdExec })),
            })),
          },
          CharacterInventoryItem: {
            find: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: inventoryFindExec })),
            })),
          },
          CharacterInventoryReceipt: {
            findOne: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: receiptFindOneExec })),
            })),
          },
        },
        filters: {},
      },
      client: { roles: ['user'], profile: { id: 'profile-1' } },
    };

    const runtime = await require(reducerLoaderPath).loadWarpSpeedArtifacts(path.dirname(reducerLoaderPath));
    const reducerCtx = buildWarpSpeedReducerCtxForTests(ctx, runtime);
    const result = await runtime.executeReducer({
      reducerName: 'character.getCharacterInventoryAuditExport',
      input: { characterId: 'character-1' },
      ctx: reducerCtx,
    });

    expect(findByIdExec).toHaveBeenCalled();
    expect(inventoryFindExec).toHaveBeenCalledTimes(1);
    expect(receiptFindOneExec).toHaveBeenCalledTimes(1);
    expect(result.exportHash).toEqual(expect.any(String));
    expect(result.publication).toEqual(
      expect.objectContaining({
        publisherId: expect.any(String),
        publishedAt: expect.any(String),
        publicationHash: expect.any(String),
        exportHash: expect.any(String),
        receiptHash: expect.any(String),
        signatureMaterial: expect.objectContaining({
          algorithm: 'sha256-envelope-v1',
          signerId: expect.any(String),
          payload: expect.any(String),
          payloadHash: expect.any(String),
        }),
      })
    );
    expect(result.proofBundle).toEqual(
      expect.objectContaining({
        algorithm: 'sha256-merkle-v1',
        tableName: 'characterInventoryItems',
        characterId: 'character-1',
        receiptHash: expect.any(String),
        exportHash: expect.any(String),
        publicationHash: expect.any(String),
        rowCount: 1,
        merkleRoot: expect.any(String),
      })
    );
    expect(result.proofBundle.rows).toHaveLength(1);
    expect(result.proofBundle.rows[0].recordPk).toBe(1);
    expect(result.proofBundle.rows[0].recordId).toBe('character-1:1');
    expect(typeof result.proofBundle.rows[0].rowHash).toBe('string');
    expect(result.proofBundle.rows[0].rowHash.length).toBeGreaterThan(0);
    expect(typeof result.proofBundle.rows[0].leafHash).toBe('string');
    expect(result.proofBundle.rows[0].leafHash.length).toBeGreaterThan(0);
    expect(Array.isArray(result.proofBundle.rows[0].proof)).toBe(true);
    expect(result.receipt).toEqual(
      expect.objectContaining({
        version: 1,
        verificationMode: 'audited',
        tableName: 'characterInventoryItems',
        characterId: 'character-1',
        rowCount: 1,
        nextRecordPk: 2,
        receiptHash: expect.any(String),
        updatedDate: expect.any(String),
      })
    );
    expect(result.inventory).toEqual([{ items: [{ itemId: 'item-sword' }] }]);
    expect(result.rows).toEqual([
      expect.objectContaining({
        recordPk: 1,
        recordId: 'character-1:1',
        characterId: 'character-1',
        itemId: 'item-sword',
        quantity: 1,
        rowHash: expect.any(String),
      }),
    ]);
  });

  test('protocol WarpSpeed helper can execute character inventory sync through the artifact runtime', async () => {
    const {
      buildWarpSpeedReducerCtxForTests,
      resetWarpSpeedReducerRuntimeForTests,
    } = loadTsModule('core/warpspeed.ts');
    process.env.WARPSPEED_ARTIFACT_DIR = path.resolve(__dirname, 'fixtures', 'warpspeed');
    process.env.WARPSPEED_ENABLE_ROUTE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_CHARACTER_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_SYNC_CHARACTER_INVENTORY_REDUCER = 'true';
    resetWarpSpeedReducerRuntimeForTests();

    const findByIdExec = jest.fn(async () => ({
      id: 'character-1',
      inventory: [{ items: [{ itemId: { valueOf: () => 'item-sword' } }] }],
      data: {
        warpTables: {
          characterInventoryItems: {
            version: 1,
            tableName: 'characterInventoryItems',
            accessName: 'characterInventoryItems',
            primaryKey: 'recordPk',
            externalKey: 'recordId',
            characterId: 'character-1',
            nextRecordPk: 2,
            bags: [{ items: [] }],
            rows: [
              {
                recordPk: 1,
                recordId: 'character-1:1',
                characterId: 'character-1',
                bagIndex: 0,
                slotIndex: 0,
                itemId: 'item-sword',
                quantity: 1,
                hasExplicitQuantity: false,
                item: {
                  itemId: 'item-sword',
                },
              },
            ],
          },
        },
      },
    }));

    const ctx = {
      app: {
        service: { Character: {} },
        model: {
          Character: {
            findById: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: findByIdExec })),
            })),
            findByIdAndUpdate: jest.fn(() => ({
              lean: jest.fn(() => ({
                exec: jest.fn(async () => ({
                  id: 'character-1',
                  inventory: [{ items: [{ itemId: 'item-sword' }] }],
                  data: {
                    warpTables: {
                      characterInventoryItems: {
                        version: 1,
                      },
                    },
                  },
                })),
              })),
            })),
          },
        },
        filters: {},
      },
      client: { roles: ['user'], profile: { id: 'profile-1' } },
    };

    const runtime = await require(reducerLoaderPath).loadWarpSpeedArtifacts(path.dirname(reducerLoaderPath));
    const reducerCtx = buildWarpSpeedReducerCtxForTests(ctx, runtime);
    const result = await runtime.executeReducer({
      reducerName: 'character.syncCharacterInventory',
      input: { characterId: 'character-1', mode: 'refresh' },
      ctx: reducerCtx,
    });

    expect(findByIdExec).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      characterId: 'character-1',
      inventory: [{ items: [{ itemId: 'item-sword' }] }],
    });
  });

  test('protocol WarpSpeed reducer ctx exposes characterInventoryItems as a mirrored internal-key table', async () => {
    const {
      buildWarpSpeedReducerCtxForTests,
      resetWarpSpeedReducerRuntimeForTests,
    } = loadTsModule('core/warpspeed.ts');
    process.env.WARPSPEED_ARTIFACT_DIR = path.resolve(__dirname, 'fixtures', 'warpspeed');
    resetWarpSpeedReducerRuntimeForTests();

    const findByIdExec = jest.fn(async () => ({
      id: 'character-1',
      inventory: [
        {
          items: [
            {
              itemId: { valueOf: () => 'item-sword' },
            },
          ],
        },
      ],
      data: {
        warpTables: {
          characterInventoryItems: {
            version: 1,
            tableName: 'characterInventoryItems',
            accessName: 'characterInventoryItems',
            primaryKey: 'recordPk',
            externalKey: 'recordId',
            characterId: 'character-1',
            nextRecordPk: 2,
            bags: [{ items: [] }],
            rows: [
              {
                recordPk: 1,
                recordId: 'character-1:1',
                characterId: 'character-1',
                bagIndex: 0,
                slotIndex: 0,
                itemId: 'item-sword',
                quantity: 1,
                hasExplicitQuantity: false,
                item: {
                  itemId: 'item-sword',
                },
              },
            ],
          },
        },
      },
    }));

    const ctx = {
      app: {
        service: { Character: {} },
        model: {
          Character: {
            findById: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: findByIdExec })),
            })),
          },
        },
        filters: {},
      },
      client: { roles: ['user'], profile: { id: 'profile-1' } },
    };

    const runtime = await require(reducerLoaderPath).loadWarpSpeedArtifacts(path.dirname(reducerLoaderPath));
    const reducerCtx = buildWarpSpeedReducerCtxForTests(ctx, runtime);

    expect(reducerCtx.db.characterInventoryItems.primaryKey).toBe('recordPk');
    expect(reducerCtx.db.characterInventoryItems.externalKey).toBe('recordId');
    expect(reducerCtx.db.characterInventoryItems.keyLayout).toEqual({
      primaryKey: 'recordPk',
      externalKey: 'recordId',
    });
    expect(reducerCtx.db.characterInventoryItems.getInternalKey('character-1:1')).toBe(1);

    const rows = await reducerCtx.db.characterInventoryItems.findManyByFilter({
      where: {
        characterId: {
          equals: 'character-1',
        },
      },
    });

    const row = await reducerCtx.db.characterInventoryItems.byRecordId.findOne({
      recordId: 'character-1:1',
    });
    const receipt = await reducerCtx.db.characterInventoryItems.getReceipt('character-1');

    expect(findByIdExec).toHaveBeenCalledTimes(3);
    expect(rows).toEqual([
      expect.objectContaining({
        recordPk: 1,
        recordId: 'character-1:1',
        characterId: 'character-1',
        itemId: 'item-sword',
      }),
    ]);
    expect(row).toEqual(
      expect.objectContaining({
        recordPk: 1,
        recordId: 'character-1:1',
        characterId: 'character-1',
        itemId: 'item-sword',
      })
    );
    expect(receipt).toEqual(
      expect.objectContaining({
        version: 1,
        verificationMode: 'audited',
        tableName: 'characterInventoryItems',
        characterId: 'character-1',
        rowCount: 1,
        receiptHash: expect.any(String),
      })
    );
  });

  test('protocol WarpSpeed reducer ctx prefers CharacterInventoryItem model when available', async () => {
    const {
      buildWarpSpeedReducerCtxForTests,
      resetWarpSpeedReducerRuntimeForTests,
    } = loadTsModule('core/warpspeed.ts');
    process.env.WARPSPEED_ARTIFACT_DIR = path.resolve(__dirname, 'fixtures', 'warpspeed');
    process.env.WARPSPEED_ENABLE_ROUTE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_CHARACTER_VIEWS = 'true';
    process.env.WARPSPEED_ENABLE_GET_CHARACTER_INVENTORY_REDUCER = 'true';
    resetWarpSpeedReducerRuntimeForTests();

    const characterFindByIdExec = jest.fn(async () => ({
      id: 'character-1',
      ownerId: 'profile-1',
      inventory: [{ items: [{ itemKey: 'stale-item' }] }],
    }));
    const inventoryFindExec = jest.fn(async () => [
      {
        characterId: 'character-1',
        recordPk: 1,
        recordId: 'character-1:1',
        bagIndex: 0,
        slotIndex: 0,
        itemId: 'item-sword',
        quantity: 1,
        hasExplicitQuantity: false,
        item: { itemId: 'item-sword', x: 1, y: 1 },
      },
    ]);
    const inventoryFindOneExec = jest.fn(async () => ({
      characterId: 'character-1',
      recordPk: 1,
      recordId: 'character-1:1',
      bagIndex: 0,
      slotIndex: 0,
      itemId: 'item-sword',
      quantity: 1,
      hasExplicitQuantity: false,
      item: { itemId: 'item-sword', x: 1, y: 1 },
    }));
    const receiptFindOneExec = jest.fn(async () => ({
      characterId: 'character-1',
      version: 1,
      verificationMode: 'audited',
      tableName: 'characterInventoryItems',
      rowCount: 1,
      nextRecordPk: 2,
      receiptHash: 'receipt-1',
      updatedDate: '2026-03-11T00:00:00.000Z',
    }));

    const ctx = {
      app: {
        service: { Character: {} },
        model: {
          Character: {
            findById: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: characterFindByIdExec })),
            })),
          },
          CharacterInventoryItem: {
            find: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: inventoryFindExec })),
            })),
            findOne: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: inventoryFindOneExec })),
            })),
          },
          CharacterInventoryReceipt: {
            findOne: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: receiptFindOneExec })),
            })),
          },
        },
        filters: {},
      },
      client: { roles: ['user'], profile: { id: 'profile-1' } },
    };

    const runtime = await require(reducerLoaderPath).loadWarpSpeedArtifacts(path.dirname(reducerLoaderPath));
    const reducerCtx = buildWarpSpeedReducerCtxForTests(ctx, runtime);

    const rows = await reducerCtx.db.characterInventoryItems.findManyByFilter({
      where: {
        characterId: {
          equals: 'character-1',
        },
      },
    });

    const row = await reducerCtx.db.characterInventoryItems.byRecordId.findOne({
      recordId: 'character-1:1',
    });
    const receipt = await reducerCtx.db.characterInventoryItems.getReceipt('character-1');

    expect(rows).toEqual([
      expect.objectContaining({
        recordPk: 1,
        recordId: 'character-1:1',
        characterId: 'character-1',
        itemId: 'item-sword',
      }),
    ]);
    expect(row).toEqual(
      expect.objectContaining({
        recordPk: 1,
        recordId: 'character-1:1',
        characterId: 'character-1',
        itemId: 'item-sword',
      })
    );
    expect(receipt).toEqual(
      expect.objectContaining({
        characterId: 'character-1',
        verificationMode: 'audited',
        receiptHash: expect.any(String),
        exportHash: expect.any(String),
        rowCount: 1,
      })
    );
    expect(ctx.app.model.CharacterInventoryItem.find).toHaveBeenCalledTimes(2);
    expect(ctx.app.model.CharacterInventoryItem.findOne).toHaveBeenCalledTimes(1);
    expect(ctx.app.model.CharacterInventoryReceipt.findOne).toHaveBeenCalledTimes(1);
    expect(characterFindByIdExec).not.toHaveBeenCalled();
  });

  test('protocol WarpSpeed helper repairs stale CharacterInventoryReceipt from authoritative rows', async () => {
    const {
      buildWarpSpeedReducerCtxForTests,
      resetWarpSpeedReducerRuntimeForTests,
    } = loadTsModule('core/warpspeed.ts');
    process.env.WARPSPEED_ARTIFACT_DIR = path.resolve(__dirname, 'fixtures', 'warpspeed');
    resetWarpSpeedReducerRuntimeForTests();

    const characterFindByIdExec = jest.fn(async () => ({
      id: 'character-1',
      applicationId: 'app-1',
      ownerId: 'profile-1',
      inventory: [{ items: [{ itemKey: 'stale-item' }] }],
      data: {},
    }));
    const inventoryFindExec = jest.fn(async () => [
      {
        characterId: 'character-1',
        recordPk: 1,
        recordId: 'character-1:1',
        bagIndex: 0,
        slotIndex: 0,
        itemKey: 'runic-bag',
        quantity: 2,
        hasExplicitQuantity: true,
        item: { itemKey: 'runic-bag', quantity: 2, x: 1, y: 1 },
      },
    ]);
    const inventoryBulkWrite = jest.fn(async () => ({ ok: 1 }));
    const receiptFindOneExec = jest.fn(async () => ({
      characterId: 'character-1',
      version: 1,
      verificationMode: 'audited',
      tableName: 'characterInventoryItems',
      rowCount: 99,
      nextRecordPk: 99,
      receiptHash: 'stale-receipt',
      exportHash: 'stale-export',
      updatedDate: '2026-03-11T00:00:00.000Z',
    }));
    const receiptReplaceOne = jest.fn(async () => ({ acknowledged: true }));

    const ctx = {
      app: {
        service: { Character: {} },
        model: {
          Character: {
            findById: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: characterFindByIdExec })),
            })),
          },
          CharacterInventoryItem: {
            find: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: inventoryFindExec })),
            })),
            findOne: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: jest.fn(async () => null) })),
            })),
            bulkWrite: inventoryBulkWrite,
          },
          CharacterInventoryReceipt: {
            findOne: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: receiptFindOneExec })),
            })),
            replaceOne: receiptReplaceOne,
          },
        },
        filters: {},
      },
      client: { roles: ['user'], profile: { id: 'profile-1' } },
    };

    const runtime = await require(reducerLoaderPath).loadWarpSpeedArtifacts(path.dirname(reducerLoaderPath));
    const reducerCtx = buildWarpSpeedReducerCtxForTests(ctx, runtime);

    const table = await reducerCtx.helpers.loadAuthoritativeCharacterInventoryTable({
      id: 'character-1',
      applicationId: 'app-1',
      ownerId: 'profile-1',
    });

    expect(table).toEqual(
      expect.objectContaining({
        characterId: 'character-1',
        rows: [
          expect.objectContaining({
            recordPk: 1,
            recordId: 'character-1:1',
            itemKey: 'runic-bag',
            quantity: 2,
          }),
        ],
      })
    );
    expect(inventoryBulkWrite).toHaveBeenCalledTimes(1);
    expect(receiptReplaceOne).toHaveBeenCalledWith(
      { characterId: 'character-1' },
      expect.objectContaining({
        characterId: 'character-1',
        verificationMode: 'audited',
        rowCount: 1,
        nextRecordPk: 2,
        receiptHash: expect.any(String),
        exportHash: expect.any(String),
      }),
      { upsert: true }
    );
  });

  test('protocol WarpSpeed reducer ctx backfills CharacterInventoryItem rows from Character when collection is empty', async () => {
    const {
      buildWarpSpeedReducerCtxForTests,
      resetWarpSpeedReducerRuntimeForTests,
    } = loadTsModule('core/warpspeed.ts');
    process.env.WARPSPEED_ARTIFACT_DIR = path.resolve(__dirname, 'fixtures', 'warpspeed');
    resetWarpSpeedReducerRuntimeForTests();

    const characterFindByIdExec = jest.fn(async () => ({
      id: 'character-1',
      applicationId: 'app-1',
      ownerId: 'profile-1',
      inventory: [{ items: [{ itemKey: 'runic-bag', quantity: 2, x: 1, y: 1 }] }],
      data: {},
    }));
    const inventoryFindExec = jest.fn(async () => []);
    const inventoryFindOneExec = jest.fn(async () => null);
    const inventoryBulkWrite = jest.fn(async () => ({ ok: 1 }));
    const receiptReplaceOne = jest.fn(async () => ({ acknowledged: true }));

    const ctx = {
      app: {
        service: { Character: {} },
        model: {
          Character: {
            findById: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: characterFindByIdExec })),
            })),
          },
          CharacterInventoryItem: {
            find: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: inventoryFindExec })),
            })),
            findOne: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: inventoryFindOneExec })),
            })),
            bulkWrite: inventoryBulkWrite,
          },
          CharacterInventoryReceipt: {
            replaceOne: receiptReplaceOne,
          },
        },
        filters: {},
      },
      client: { roles: ['user'], profile: { id: 'profile-1' } },
    };

    const runtime = await require(reducerLoaderPath).loadWarpSpeedArtifacts(path.dirname(reducerLoaderPath));
    const reducerCtx = buildWarpSpeedReducerCtxForTests(ctx, runtime);

    const rows = await reducerCtx.db.characterInventoryItems.findManyByFilter({
      where: {
        characterId: {
          equals: 'character-1',
        },
      },
    });

    expect(rows).toEqual([
      expect.objectContaining({
        recordPk: 1,
        recordId: 'character-1:1',
        characterId: 'character-1',
        itemKey: 'runic-bag',
        quantity: 2,
      }),
    ]);
    expect(characterFindByIdExec).toHaveBeenCalledTimes(1);
    expect(inventoryBulkWrite).toHaveBeenCalledWith(
      [
        {
          replaceOne: {
            filter: {
              characterId: 'character-1',
              recordPk: 1,
            },
            replacement: expect.objectContaining({
              characterId: 'character-1',
              applicationId: 'app-1',
              ownerId: 'profile-1',
              recordPk: 1,
              recordId: 'character-1:1',
              itemKey: 'runic-bag',
              quantity: 2,
              audit: expect.objectContaining({
                verificationMode: 'audited',
                characterId: 'character-1',
                rowCount: 1,
                receiptHash: expect.any(String),
                exportHash: expect.any(String),
              }),
            }),
            upsert: true,
          },
        },
        {
          deleteMany: {
            filter: {
              characterId: 'character-1',
              recordPk: {
                $nin: [1],
              },
            },
          },
        },
      ],
      { ordered: true }
    );
    expect(receiptReplaceOne).toHaveBeenCalledWith(
      { characterId: 'character-1' },
      expect.objectContaining({
        version: 1,
        verificationMode: 'audited',
        tableName: 'characterInventoryItems',
        characterId: 'character-1',
        rowCount: 1,
        nextRecordPk: 2,
        receiptHash: expect.any(String),
        exportHash: expect.any(String),
        applicationId: 'app-1',
        ownerId: 'profile-1',
      }),
      { upsert: true }
    );
  });

  test('protocol WarpSpeed helper can execute character ability reads through the artifact runtime', async () => {
    const {
      buildWarpSpeedReducerCtxForTests,
      resetWarpSpeedReducerRuntimeForTests,
    } = loadTsModule('core/warpspeed.ts');
    process.env.WARPSPEED_ARTIFACT_DIR = path.resolve(__dirname, 'fixtures', 'warpspeed');
    process.env.WARPSPEED_ENABLE_ROUTE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_CHARACTER_VIEWS = 'true';
    process.env.WARPSPEED_ENABLE_GET_CHARACTER_ABILITY_REDUCER = 'true';
    resetWarpSpeedReducerRuntimeForTests();

    const findByIdExec = jest.fn(async () => ({
      id: 'ability-1',
      name: 'Shadow Bolt',
    }));

    const ctx = {
      app: {
        service: { Character: {} },
        model: {
          CharacterAbility: {
            findById: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: findByIdExec })),
            })),
          },
        },
        filters: {},
      },
      client: { roles: ['guest'] },
    };

    const runtime = await require(reducerLoaderPath).loadWarpSpeedArtifacts(path.dirname(reducerLoaderPath));
    const reducerCtx = buildWarpSpeedReducerCtxForTests(ctx, runtime);
    const result = await runtime.executeReducer({
      reducerName: 'character.getCharacterAbility',
      input: { where: { id: { equals: 'ability-1' } } },
      ctx: {
        ...reducerCtx,
        helpers: {
          ...(reducerCtx.helpers ?? {}),
          getFilter: (input) => ({ id: input?.where?.id?.equals }),
        },
      },
    });

    expect(findByIdExec).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      id: 'ability-1',
      name: 'Shadow Bolt',
    });
  });

  test('protocol WarpSpeed helper can execute character attribute reads through the artifact runtime', async () => {
    const {
      buildWarpSpeedReducerCtxForTests,
      resetWarpSpeedReducerRuntimeForTests,
    } = loadTsModule('core/warpspeed.ts');
    process.env.WARPSPEED_ARTIFACT_DIR = path.resolve(__dirname, 'fixtures', 'warpspeed');
    process.env.WARPSPEED_ENABLE_ROUTE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_CHARACTER_VIEWS = 'true';
    process.env.WARPSPEED_ENABLE_GET_CHARACTER_ATTRIBUTE_REDUCER = 'true';
    resetWarpSpeedReducerRuntimeForTests();

    const findByIdExec = jest.fn(async () => ({
      id: 'attribute-1',
      name: 'Wisdom',
    }));

    const ctx = {
      app: {
        service: { Character: {} },
        model: {
          CharacterAttribute: {
            findById: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: findByIdExec })),
            })),
          },
        },
        filters: {},
      },
      client: { roles: ['guest'] },
    };

    const runtime = await require(reducerLoaderPath).loadWarpSpeedArtifacts(path.dirname(reducerLoaderPath));
    const reducerCtx = buildWarpSpeedReducerCtxForTests(ctx, runtime);
    const result = await runtime.executeReducer({
      reducerName: 'character.getCharacterAttribute',
      input: { where: { id: { equals: 'attribute-1' } } },
      ctx: {
        ...reducerCtx,
        helpers: {
          ...(reducerCtx.helpers ?? {}),
          getFilter: (input) => ({ id: input?.where?.id?.equals }),
        },
      },
    });

    expect(findByIdExec).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      id: 'attribute-1',
      name: 'Wisdom',
    });
  });

  test('protocol WarpSpeed helper can execute character inventory patches through the reducer artifact', async () => {
    const {
      buildWarpSpeedReducerCtxForTests,
      resetWarpSpeedReducerRuntimeForTests,
    } = loadTsModule('core/warpspeed.ts');
    process.env.WARPSPEED_ARTIFACT_DIR = path.resolve(__dirname, 'fixtures', 'warpspeed');
    process.env.WARPSPEED_ENABLE_ROUTE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_CHARACTER_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_APPLY_CHARACTER_INVENTORY_PATCH_REDUCER = 'true';
    resetWarpSpeedReducerRuntimeForTests();

    const originalCharacter = {
      id: 'character-1',
      ownerId: 'profile-1',
      inventory: [{ items: [{ itemKey: 'sprite-dust', quantity: 5 }] }],
      data: {
        warpTables: {
          characterInventoryItems: {
            version: 1,
            tableName: 'characterInventoryItems',
            accessName: 'characterInventoryItems',
            primaryKey: 'recordPk',
            externalKey: 'recordId',
            verificationMode: 'audited',
            characterId: 'character-1',
            nextRecordPk: 2,
            bags: [],
            rows: [
              {
                recordPk: 1,
                recordId: 'character-1:1',
                characterId: 'character-1',
                bagIndex: 0,
                slotIndex: 0,
                itemKey: 'sprite-dust',
                quantity: 5,
                hasExplicitQuantity: true,
                item: { itemKey: 'sprite-dust', quantity: 5 },
              },
            ],
          },
        },
      },
    };
    const updatedCharacter = {
      id: 'character-1',
      ownerId: 'profile-1',
      inventory: [{ items: [{ itemKey: 'sprite-dust', quantity: 3 }] }],
    };

    const findByIdExec = jest.fn(async () => originalCharacter);
    const findByIdAndUpdateExec = jest.fn(async () => updatedCharacter);

    const ctx = {
      app: {
        service: { Character: {} },
        model: {
          Character: {
            findById: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: findByIdExec })),
            })),
            findByIdAndUpdate: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: findByIdAndUpdateExec })),
            })),
          },
        },
        filters: {},
      },
      client: { roles: ['user'], profile: { id: 'profile-1' } },
    };

    const runtime = await require(reducerLoaderPath).loadWarpSpeedArtifacts(path.dirname(reducerLoaderPath));
    const reducerCtx = buildWarpSpeedReducerCtxForTests(ctx, runtime);
    const result = await runtime.executeReducer({
      reducerName: 'character.applyCharacterInventoryPatch',
      input: {
        characterId: 'character-1',
        ops: [{ op: 'remove', itemKey: 'sprite-dust', quantity: 2 }],
      },
      ctx: reducerCtx,
    });

    expect(findByIdExec).toHaveBeenCalledTimes(2);
    expect(findByIdAndUpdateExec).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      characterId: 'character-1',
      inventory: [{ items: [{ itemKey: 'sprite-dust', quantity: 3 }] }],
    });
  });

  test('protocol WarpSpeed helper can execute Mongo-shaped inventory push patches through the reducer artifact', async () => {
    const {
      buildWarpSpeedReducerCtxForTests,
      resetWarpSpeedReducerRuntimeForTests,
    } = loadTsModule('core/warpspeed.ts');
    process.env.WARPSPEED_ARTIFACT_DIR = path.resolve(__dirname, 'fixtures', 'warpspeed');
    process.env.WARPSPEED_ENABLE_ROUTE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_CHARACTER_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_APPLY_CHARACTER_INVENTORY_PATCH_REDUCER = 'true';
    resetWarpSpeedReducerRuntimeForTests();

    const originalCharacter = {
      id: 'character-1',
      ownerId: 'profile-1',
      inventory: JSON.stringify([
        {
          items: [
            {
              itemId: { $oid: 'item-1' },
              x: 1,
              y: 1,
            },
          ],
        },
      ]),
      data: {
        warpTables: {
          characterInventoryItems: {
            version: 1,
            tableName: 'characterInventoryItems',
            accessName: 'characterInventoryItems',
            primaryKey: 'recordPk',
            externalKey: 'recordId',
            verificationMode: 'audited',
            characterId: 'character-1',
            nextRecordPk: 2,
            bags: [],
            rows: [
              {
                recordPk: 1,
                recordId: 'character-1:1',
                characterId: 'character-1',
                bagIndex: 0,
                slotIndex: 0,
                itemId: 'item-1',
                quantity: 1,
                hasExplicitQuantity: false,
                item: { itemId: 'item-1', x: 1, y: 1 },
              },
            ],
          },
        },
      },
    };
    const updatedCharacter = {
      id: 'character-1',
      ownerId: 'profile-1',
      inventory: JSON.stringify([
        {
          items: [
            {
              itemId: { $oid: 'item-1' },
              x: 1,
              y: 1,
            },
            {
              itemId: { $oid: 'item-2' },
              x: 2,
              y: 1,
            },
          ],
        },
      ]),
    };

    const findByIdExec = jest.fn(async () => originalCharacter);
    const findByIdAndUpdateExec = jest.fn(async () => updatedCharacter);

    const ctx = {
      app: {
        service: { Character: {} },
        model: {
          Character: {
            findById: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: findByIdExec })),
            })),
            findByIdAndUpdate: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: findByIdAndUpdateExec })),
            })),
          },
        },
        filters: {},
      },
      client: { roles: ['user'], profile: { id: 'profile-1' } },
    };

    const runtime = await require(reducerLoaderPath).loadWarpSpeedArtifacts(path.dirname(reducerLoaderPath));
    const reducerCtx = buildWarpSpeedReducerCtxForTests(ctx, runtime);
    const result = await runtime.executeReducer({
      reducerName: 'character.applyCharacterInventoryPatch',
      input: {
        characterId: 'character-1',
        ops: [
          {
            op: 'push',
            key: 'inventory.0.items',
            value: { itemId: 'item-2', x: 2, y: 1 },
          },
        ],
      },
      ctx: reducerCtx,
    });

    expect(findByIdExec).toHaveBeenCalledTimes(2);
    expect(findByIdAndUpdateExec).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      characterId: 'character-1',
      inventory: [
        {
          items: [
            { itemId: 'item-1', x: 1, y: 1 },
            { itemId: 'item-2', x: 2, y: 1 },
          ],
        },
      ],
    });
  });

  test('protocol WarpSpeed helper can execute character item exchange through the reducer artifact', async () => {
    const {
      buildWarpSpeedReducerCtxForTests,
      resetWarpSpeedReducerRuntimeForTests,
    } = loadTsModule('core/warpspeed.ts');
    process.env.WARPSPEED_ARTIFACT_DIR = path.resolve(__dirname, 'fixtures', 'warpspeed');
    process.env.WARPSPEED_ENABLE_ROUTE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_CHARACTER_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_EXCHANGE_CHARACTER_ITEM_REDUCER = 'true';
    resetWarpSpeedReducerRuntimeForTests();

    const originalCharacter = {
      id: 'character-1',
      ownerId: 'profile-1',
      inventory: JSON.stringify([
        {
          items: [
            { itemId: { $oid: 'item-1' }, x: 1, y: 1 },
            { itemId: { $oid: 'item-2' }, x: 2, y: 1 },
          ],
        },
      ]),
      data: {
        warpTables: {
          characterInventoryItems: {
            version: 1,
            tableName: 'characterInventoryItems',
            accessName: 'characterInventoryItems',
            primaryKey: 'recordPk',
            externalKey: 'recordId',
            verificationMode: 'audited',
            characterId: 'character-1',
            nextRecordPk: 3,
            bags: [],
            rows: [
              {
                recordPk: 1,
                recordId: 'character-1:1',
                characterId: 'character-1',
                bagIndex: 0,
                slotIndex: 0,
                itemId: 'item-1',
                quantity: 1,
                hasExplicitQuantity: false,
                item: { itemId: 'item-1', x: 1, y: 1 },
              },
              {
                recordPk: 2,
                recordId: 'character-1:2',
                characterId: 'character-1',
                bagIndex: 0,
                slotIndex: 1,
                itemId: 'item-2',
                quantity: 1,
                hasExplicitQuantity: false,
                item: { itemId: 'item-2', x: 2, y: 1 },
              },
            ],
          },
        },
      },
    };
    const updatedCharacter = {
      id: 'character-1',
      ownerId: 'profile-1',
      inventory: JSON.stringify([
        {
          items: [{ itemId: { $oid: 'item-1' }, x: 1, y: 1 }],
        },
      ]),
    };

    const findByIdExec = jest.fn(async () => originalCharacter);
    const findByIdAndUpdateExec = jest.fn(async () => updatedCharacter);

    const ctx = {
      app: {
        service: { Character: {} },
        model: {
          Character: {
            findById: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: findByIdExec })),
            })),
            findByIdAndUpdate: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: findByIdAndUpdateExec })),
            })),
          },
        },
        filters: {},
      },
      client: { roles: ['user'], profile: { id: 'profile-1' } },
    };

    const runtime = await require(reducerLoaderPath).loadWarpSpeedArtifacts(path.dirname(reducerLoaderPath));
    const reducerCtx = buildWarpSpeedReducerCtxForTests(ctx, runtime);
    const result = await runtime.executeReducer({
      reducerName: 'character.exchangeCharacterItem',
      input: {
        characterId: 'character-1',
        itemId: 'item-2',
        quantity: 1,
      },
      ctx: reducerCtx,
    });

    expect(findByIdExec).toHaveBeenCalledTimes(2);
    expect(findByIdAndUpdateExec).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      characterId: 'character-1',
      inventory: [
        {
          items: [{ itemId: 'item-1', x: 1, y: 1 }],
        },
      ],
    });
  });

  test('protocol WarpSpeed helper resolves inventory itemKey patches before dispatch', async () => {
    const {
      maybeInvokeWarpSpeedReducer,
      normalizeWarpSpeedReducerInputForTests,
      resetWarpSpeedReducerRuntimeForTests,
    } = loadTsModule('core/warpspeed.ts');
    resetWarpSpeedReducerRuntimeForTests();

    const findItemExec = jest.fn(async () => ({
      _id: { valueOf: () => 'item-2' },
      key: 'sprites',
    }));
    const fallback = jest.fn(async (normalizedInput) => normalizedInput);

    const ctx = {
      app: {
        service: { Character: {} },
        model: {
          Item: {
            findOne: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: findItemExec })),
            })),
          },
        },
        filters: {},
      },
      client: { roles: ['user'], profile: { id: 'profile-1' } },
    };

    const rawInput = {
      characterId: 'character-1',
      ops: [
        {
          op: 'push',
          key: 'inventory.0.items',
          value: { itemKey: 'sprites', quantity: 2, x: 2, y: 1 },
        },
      ],
    };

    const normalizedInput = await normalizeWarpSpeedReducerInputForTests({
      reducerName: 'character.applyCharacterInventoryPatch',
      input: rawInput,
      ctx,
    });

    expect(findItemExec).toHaveBeenCalledTimes(1);
    expect(normalizedInput).toEqual({
      characterId: 'character-1',
      ops: [
        {
          op: 'push',
          key: 'inventory.0.items',
          value: { itemId: 'item-2', x: 2, y: 1 },
        },
        {
          op: 'push',
          key: 'inventory.0.items',
          value: { itemId: 'item-2', x: 2, y: 1 },
        },
      ],
    });

    delete process.env.WARPSPEED_ARTIFACT_DIR;
    const result = await maybeInvokeWarpSpeedReducer({
      reducerName: 'character.applyCharacterInventoryPatch',
      input: rawInput,
      ctx,
      fallback,
    });

    expect(fallback).toHaveBeenCalledTimes(1);
    expect(fallback).toHaveBeenCalledWith(normalizedInput);
    expect(result).toEqual(normalizedInput);
  });

  test('protocol WarpSpeed helper resolves exchangeCharacterItem itemKey values before dispatch', async () => {
    const {
      maybeInvokeWarpSpeedReducer,
      normalizeWarpSpeedReducerInputForTests,
      resetWarpSpeedReducerRuntimeForTests,
    } = loadTsModule('core/warpspeed.ts');
    resetWarpSpeedReducerRuntimeForTests();

    const findItemExec = jest.fn(async () => ({
      _id: { valueOf: () => 'item-2' },
      key: 'sprites',
    }));
    const fallback = jest.fn(async (normalizedInput) => normalizedInput);

    const ctx = {
      app: {
        service: { Character: {} },
        model: {
          Item: {
            findOne: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: findItemExec })),
            })),
          },
        },
        filters: {},
      },
      client: { roles: ['user'], profile: { id: 'profile-1' } },
    };

    const rawInput = {
      characterId: 'character-1',
      itemKey: 'sprites',
      quantity: 2,
    };

    const normalizedInput = await normalizeWarpSpeedReducerInputForTests({
      reducerName: 'character.exchangeCharacterItem',
      input: rawInput,
      ctx,
    });

    expect(findItemExec).toHaveBeenCalledTimes(1);
    expect(normalizedInput).toEqual({
      characterId: 'character-1',
      itemId: 'item-2',
      itemKey: 'sprites',
      quantity: 2,
    });

    delete process.env.WARPSPEED_ARTIFACT_DIR;
    const result = await maybeInvokeWarpSpeedReducer({
      reducerName: 'character.exchangeCharacterItem',
      input: rawInput,
      ctx,
      fallback,
    });

    expect(fallback).toHaveBeenCalledTimes(1);
    expect(fallback).toHaveBeenCalledWith(normalizedInput);
    expect(result).toEqual(normalizedInput);
  });

  test('protocol WarpSpeed helper can execute character ability updates through the reducer artifact', async () => {
    const {
      buildWarpSpeedReducerCtxForTests,
      resetWarpSpeedReducerRuntimeForTests,
    } = loadTsModule('core/warpspeed.ts');
    process.env.WARPSPEED_ARTIFACT_DIR = path.resolve(__dirname, 'fixtures', 'warpspeed');
    process.env.WARPSPEED_ENABLE_ROUTE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_CHARACTER_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_UPDATE_CHARACTER_ABILITY_REDUCER = 'true';
    resetWarpSpeedReducerRuntimeForTests();

    const findByIdAndUpdateExec = jest.fn(async () => ({
      id: 'ability-1',
      power: 9,
    }));

    const ctx = {
      app: {
        service: { Character: {} },
        model: {
          CharacterAbility: {
            findByIdAndUpdate: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: findByIdAndUpdateExec })),
            })),
          },
        },
        filters: {},
      },
      client: { roles: ['admin'] },
    };

    const runtime = await require(reducerLoaderPath).loadWarpSpeedArtifacts(path.dirname(reducerLoaderPath));
    const reducerCtx = buildWarpSpeedReducerCtxForTests(ctx, runtime);
    const result = await runtime.executeReducer({
      reducerName: 'character.updateCharacterAbility',
      input: { where: { id: { equals: 'ability-1' } }, data: { power: 9 } },
      ctx: {
        ...reducerCtx,
        helpers: {
          ...(reducerCtx.helpers ?? {}),
          getFilter: (input) => ({ id: input?.where?.id?.equals }),
        },
      },
    });

    expect(findByIdAndUpdateExec).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      id: 'ability-1',
      power: 9,
    });
  });

  test('protocol WarpSpeed helper can execute character attribute updates through the reducer artifact', async () => {
    const {
      buildWarpSpeedReducerCtxForTests,
      resetWarpSpeedReducerRuntimeForTests,
    } = loadTsModule('core/warpspeed.ts');
    process.env.WARPSPEED_ARTIFACT_DIR = path.resolve(__dirname, 'fixtures', 'warpspeed');
    process.env.WARPSPEED_ENABLE_ROUTE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_CHARACTER_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_UPDATE_CHARACTER_ATTRIBUTE_REDUCER = 'true';
    resetWarpSpeedReducerRuntimeForTests();

    const findByIdAndUpdateExec = jest.fn(async () => ({
      id: 'attribute-1',
      bonus: 4,
    }));

    const ctx = {
      app: {
        service: { Character: {} },
        model: {
          CharacterAttribute: {
            findByIdAndUpdate: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: findByIdAndUpdateExec })),
            })),
          },
        },
        filters: {},
      },
      client: { roles: ['admin'] },
    };

    const runtime = await require(reducerLoaderPath).loadWarpSpeedArtifacts(path.dirname(reducerLoaderPath));
    const reducerCtx = buildWarpSpeedReducerCtxForTests(ctx, runtime);
    const result = await runtime.executeReducer({
      reducerName: 'character.updateCharacterAttribute',
      input: { where: { id: { equals: 'attribute-1' } }, data: { bonus: 4 } },
      ctx: {
        ...reducerCtx,
        helpers: {
          ...(reducerCtx.helpers ?? {}),
          getFilter: (input) => ({ id: input?.where?.id?.equals }),
        },
      },
    });

    expect(findByIdAndUpdateExec).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      id: 'attribute-1',
      bonus: 4,
    });
  });

  for (const spec of characterTaxonomySpecs) {
    test(`service-aware warp.view bindings fall back to ${spec.noun} methods by unit name`, async () => {
      const { createWarpTrpcBindings } = loadTsModule('core/warpspeed.ts');
      const serviceGet = jest.fn(async () => spec.readResult);
      const procedure = {
        use: jest.fn(() => procedure),
        input: jest.fn(() => procedure),
        output: jest.fn(() => procedure),
        query: jest.fn((handler) => handler),
        mutation: jest.fn((handler) => handler),
      };

      const warp = createWarpTrpcBindings(procedure, { serviceName: 'Character' });
      const handler = warp.view(spec.getUnit).use(Symbol('middleware')).input(Symbol('input')).query();
      const ctx = {
        app: {
          service: {
            Character: {
              [spec.getServiceMethod]: serviceGet,
            },
          },
          model: {},
          filters: {},
        },
        client: { roles: ['guest'] },
      };
      const input = { where: { id: { equals: spec.sampleId } } };
      const result = await handler({ input, ctx });

      expect(serviceGet).toHaveBeenCalledTimes(1);
      expect(serviceGet).toHaveBeenCalledWith(input, ctx);
      expect(result).toEqual(spec.readResult);
    });

    test(`service-aware warp.reducer bindings fall back to ${spec.noun} update methods by unit name`, async () => {
      const { createWarpTrpcBindings } = loadTsModule('core/warpspeed.ts');
      const serviceUpdate = jest.fn(async () => spec.updateResult);
      const procedure = {
        use: jest.fn(() => procedure),
        input: jest.fn(() => procedure),
        output: jest.fn(() => procedure),
        query: jest.fn((handler) => handler),
        mutation: jest.fn((handler) => handler),
      };

      const warp = createWarpTrpcBindings(procedure, { serviceName: 'Character' });
      const handler = warp.reducer(spec.updateUnit).use(Symbol('middleware')).input(Symbol('input')).mutation();
      const ctx = {
        app: {
          service: {
            Character: {
              [spec.updateServiceMethod]: serviceUpdate,
            },
          },
          model: {},
          filters: {},
        },
        client: { roles: ['admin'] },
      };
      const input = { where: { id: { equals: spec.sampleId } }, data: spec.updateData };
      const result = await handler({ input, ctx });

      expect(serviceUpdate).toHaveBeenCalledTimes(1);
      expect(serviceUpdate).toHaveBeenCalledWith(input, ctx);
      expect(result).toEqual(spec.updateResult);
    });

    test(`protocol WarpSpeed helper can execute ${spec.noun} reads through the artifact runtime`, async () => {
      const {
        buildWarpSpeedReducerCtxForTests,
        resetWarpSpeedReducerRuntimeForTests,
      } = loadTsModule('core/warpspeed.ts');
      process.env.WARPSPEED_ARTIFACT_DIR = path.resolve(__dirname, 'fixtures', 'warpspeed');
      process.env.WARPSPEED_ENABLE_ROUTE_REDUCERS = 'true';
      process.env.WARPSPEED_ENABLE_REDUCERS = 'true';
      process.env.WARPSPEED_ENABLE_CHARACTER_VIEWS = 'true';
      process.env[spec.getFlag] = 'true';
      resetWarpSpeedReducerRuntimeForTests();

      const findByIdExec = jest.fn(async () => spec.readResult);
      const ctx = {
        app: {
          service: { Character: {} },
          model: {
            [spec.modelName]: {
              findById: jest.fn(() => ({
                lean: jest.fn(() => ({ exec: findByIdExec })),
              })),
            },
          },
          filters: {},
        },
        client: { roles: ['guest'] },
      };

      const runtime = await require(reducerLoaderPath).loadWarpSpeedArtifacts(path.dirname(reducerLoaderPath));
      const reducerCtx = buildWarpSpeedReducerCtxForTests(ctx, runtime);
      const result = await runtime.executeReducer({
        reducerName: spec.getUnit,
        input: { where: { id: { equals: spec.sampleId } } },
        ctx: {
          ...reducerCtx,
          helpers: {
            ...(reducerCtx.helpers ?? {}),
            getFilter: (input) => ({ id: input?.where?.id?.equals }),
          },
        },
      });

      expect(findByIdExec).toHaveBeenCalledTimes(1);
      expect(result).toEqual(spec.readResult);
    });

    test(`protocol WarpSpeed helper can execute ${spec.noun} updates through the reducer artifact`, async () => {
      const {
        buildWarpSpeedReducerCtxForTests,
        resetWarpSpeedReducerRuntimeForTests,
      } = loadTsModule('core/warpspeed.ts');
      process.env.WARPSPEED_ARTIFACT_DIR = path.resolve(__dirname, 'fixtures', 'warpspeed');
      process.env.WARPSPEED_ENABLE_ROUTE_REDUCERS = 'true';
      process.env.WARPSPEED_ENABLE_REDUCERS = 'true';
      process.env.WARPSPEED_ENABLE_CHARACTER_REDUCERS = 'true';
      process.env[spec.updateFlag] = 'true';
      resetWarpSpeedReducerRuntimeForTests();

      const findByIdAndUpdateExec = jest.fn(async () => spec.updateResult);
      const ctx = {
        app: {
          service: { Character: {} },
          model: {
            [spec.modelName]: {
              findByIdAndUpdate: jest.fn(() => ({
                lean: jest.fn(() => ({ exec: findByIdAndUpdateExec })),
              })),
            },
          },
          filters: {},
        },
        client: { roles: ['admin'] },
      };

      const runtime = await require(reducerLoaderPath).loadWarpSpeedArtifacts(path.dirname(reducerLoaderPath));
      const reducerCtx = buildWarpSpeedReducerCtxForTests(ctx, runtime);
      const result = await runtime.executeReducer({
        reducerName: spec.updateUnit,
        input: { where: { id: { equals: spec.sampleId } }, data: spec.updateData },
        ctx: {
          ...reducerCtx,
          helpers: {
            ...(reducerCtx.helpers ?? {}),
            getFilter: (input) => ({ id: input?.where?.id?.equals }),
          },
        },
      });

      expect(findByIdAndUpdateExec).toHaveBeenCalledTimes(1);
      expect(result).toEqual(spec.updateResult);
    });
  }

  test('service-aware warp.view bindings fall back to Character getCharacterFactions by unit name', async () => {
    const { createWarpTrpcBindings } = loadTsModule('core/warpspeed.ts');
    const serviceGetMany = jest.fn(async () => [{ id: 'faction-1', name: 'Wayfarers' }]);
    const procedure = {
      use: jest.fn(() => procedure),
      input: jest.fn(() => procedure),
      output: jest.fn(() => procedure),
      query: jest.fn((handler) => handler),
      mutation: jest.fn((handler) => handler),
    };

    const warp = createWarpTrpcBindings(procedure, { serviceName: 'Character' });
    const handler = warp.view('character.getCharacterFactions').use(Symbol('middleware')).input(Symbol('input')).query();
    const ctx = {
      app: {
        service: {
          Character: {
            getCharacterFactions: serviceGetMany,
          },
        },
        model: {},
        filters: {},
      },
      client: { roles: ['guest'] },
    };
    const input = { where: { name: { contains: 'Way' } } };
    const result = await handler({ input, ctx });

    expect(serviceGetMany).toHaveBeenCalledTimes(1);
    expect(serviceGetMany).toHaveBeenCalledWith(input, ctx);
    expect(result).toEqual([{ id: 'faction-1', name: 'Wayfarers' }]);
  });

  test('service-aware warp.reducer bindings fall back to Character createCharacterFaction by unit name', async () => {
    const { createWarpTrpcBindings } = loadTsModule('core/warpspeed.ts');
    const serviceCreate = jest.fn(async () => ({ id: 'faction-1' }));
    const procedure = {
      use: jest.fn(() => procedure),
      input: jest.fn(() => procedure),
      output: jest.fn(() => procedure),
      query: jest.fn((handler) => handler),
      mutation: jest.fn((handler) => handler),
    };

    const warp = createWarpTrpcBindings(procedure, { serviceName: 'Character' });
    const handler = warp.reducer('character.createCharacterFaction').use(Symbol('middleware')).input(Symbol('input')).mutation();
    const ctx = {
      app: {
        service: {
          Character: {
            createCharacterFaction: serviceCreate,
          },
        },
        model: {},
        filters: {},
      },
      client: { roles: ['admin'] },
    };
    const input = { id: 'faction-1', name: 'Wayfarers' };
    const result = await handler({ input, ctx });

    expect(serviceCreate).toHaveBeenCalledTimes(1);
    expect(serviceCreate).toHaveBeenCalledWith(input, ctx);
    expect(result).toEqual({ id: 'faction-1' });
  });

  test('protocol WarpSpeed helper can execute CharacterFaction list reads through the artifact runtime', async () => {
    const {
      buildWarpSpeedReducerCtxForTests,
      resetWarpSpeedReducerRuntimeForTests,
    } = loadTsModule('core/warpspeed.ts');
    process.env.WARPSPEED_ARTIFACT_DIR = path.resolve(__dirname, 'fixtures', 'warpspeed');
    process.env.WARPSPEED_ENABLE_ROUTE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_CHARACTER_VIEWS = 'true';
    process.env.WARPSPEED_ENABLE_GET_CHARACTER_FACTIONS_REDUCER = 'true';
    resetWarpSpeedReducerRuntimeForTests();

    const findExec = jest.fn(async () => [{ id: 'faction-1', name: 'Wayfarers' }]);
    const ctx = {
      app: {
        service: { Character: {} },
        model: {
          CharacterFaction: {
            find: jest.fn(() => ({
              lean: jest.fn(() => ({ exec: findExec })),
            })),
          },
        },
        filters: {},
      },
      client: { roles: ['guest'] },
    };

    const runtime = await require(reducerLoaderPath).loadWarpSpeedArtifacts(path.dirname(reducerLoaderPath));
    const reducerCtx = buildWarpSpeedReducerCtxForTests(ctx, runtime);
    const result = await runtime.executeReducer({
      reducerName: 'character.getCharacterFactions',
      input: { where: { name: { contains: 'Way' } } },
      ctx: {
        ...reducerCtx,
        helpers: {
          ...(reducerCtx.helpers ?? {}),
          getFilter: (input) => ({ name: { $regex: input?.where?.name?.contains ?? '', $options: 'i' } }),
        },
      },
    });

    expect(findExec).toHaveBeenCalledTimes(1);
    expect(result).toEqual([{ id: 'faction-1', name: 'Wayfarers' }]);
  });

  test('protocol WarpSpeed helper can execute CharacterFaction creates through the artifact runtime', async () => {
    const {
      buildWarpSpeedReducerCtxForTests,
      resetWarpSpeedReducerRuntimeForTests,
    } = loadTsModule('core/warpspeed.ts');
    process.env.WARPSPEED_ARTIFACT_DIR = path.resolve(__dirname, 'fixtures', 'warpspeed');
    process.env.WARPSPEED_ENABLE_ROUTE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_CHARACTER_REDUCERS = 'true';
    process.env.WARPSPEED_ENABLE_CREATE_CHARACTER_FACTION_REDUCER = 'true';
    resetWarpSpeedReducerRuntimeForTests();

    const createModel = jest.fn(async (input) => ({ id: input.id, name: input.name }));
    const ctx = {
      app: {
        service: { Character: {} },
        model: {
          CharacterFaction: {
            create: createModel,
          },
        },
        filters: {},
      },
      client: { roles: ['admin'] },
    };

    const runtime = await require(reducerLoaderPath).loadWarpSpeedArtifacts(path.dirname(reducerLoaderPath));
    const reducerCtx = buildWarpSpeedReducerCtxForTests(ctx, runtime);
    const result = await runtime.executeReducer({
      reducerName: 'character.createCharacterFaction',
      input: { id: 'faction-1', name: 'Wayfarers' },
      ctx: reducerCtx,
    });

    expect(createModel).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ id: 'faction-1', name: 'Wayfarers' });
  });
});
