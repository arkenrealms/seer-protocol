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

describe('core application reducer router wiring', () => {
  const originalEnv = { ...process.env };
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
  const reducerLoaderPath = path.resolve(__dirname, 'fixtures', 'warpspeed', 'loader.cjs');
  const routerPath = path.resolve(process.cwd(), 'core/core.router.ts');

  const applicationRecord = {
    id: '123456789012345678901234',
    key: 'cerebro',
    name: 'Cerebro',
    description: 'Reducer-backed application info',
    meta: {},
    data: {},
    status: 'Active',
  };
  const accountRecord = {
    id: 'account-1',
    name: 'Primary Account',
    status: 'Active',
  };
  const conversationMessageRecord = {
    id: 'message-1',
    conversationId: 'conversation-1',
    isStarred: false,
  };
  const warpFlowActivityRecord = {
    id: 'warp-flow-1',
    status: 'ok',
    activeExecutions: 2,
    queuedExecutions: 1,
    timestamp: '2026-03-09T00:00:00.000Z',
  };

  beforeEach(() => {
    restoreProcessEnv();
    delete process.env.WARPSPEED_ENABLE_ROUTE_REDUCERS;
    delete process.env.WARPSPEED_ENABLE_REDUCERS;
    delete process.env.WARPSPEED_ENABLE_GET_APPLICATION_REDUCER;
    delete process.env.WARPSPEED_ENABLE_GET_ACCOUNT_REDUCER;
    delete process.env.WARPSPEED_ENABLE_UPDATE_APPLICATION_REDUCER;
    delete process.env.WARPSPEED_ENABLE_UPDATE_ACCOUNT_REDUCER;
    delete process.env.WARPSPEED_ENABLE_SET_CONVERSATION_MESSAGE_STAR_REDUCER;
    delete process.env.WARPSPEED_ARTIFACT_DIR;
    delete require.cache[reducerLoaderPath];
  });

  afterAll(() => {
    restoreProcessEnv();
  });

  test('core router wires reducer-backed routes through warp.reducer bindings', () => {
    const source = fs.readFileSync(routerPath, 'utf8');

    expect(source).toContain("import { createWarpTrpcBindings } from './warpspeed';");
    expect(source).toContain("const warp = createWarpTrpcBindings(procedure, { serviceName: 'Core' });");
    expect(source).toContain(".reducer('core.getApplication')");
    expect(source).toContain(".view('core.getAccount')");
    expect(source).toContain(".reducer('core.updateApplication')");
    expect(source).toContain(".reducer('core.updateAccount')");
    expect(source).toContain(".reducer('core.setConversationMessageStar')");
    expect(source).toContain(".procedure('core.claimConversationMessage')");
    expect(source).toContain(".procedure('core.ingestWarpFlowActivity')");
    expect(source).toContain(".view('core.getWarpFlowActivity')");
    expect(source).toContain('.query()');
    expect(source).toContain('.mutation()');
  });

  test('warp.reducer bindings fall back to the Core service when the reducer runtime is unavailable', async () => {
    const { createWarpTrpcBindings } = loadTsModule('core/warpspeed.ts');
    const serviceGetApplication = jest.fn(async () => applicationRecord);
    const procedure = {
      use: jest.fn(() => procedure),
      input: jest.fn(() => procedure),
      output: jest.fn(() => procedure),
      query: jest.fn((handler) => handler),
      mutation: jest.fn((handler) => handler),
    };

    const warp = createWarpTrpcBindings(procedure);
    const handler = warp
      .reducer('core.getApplication')
      .use(Symbol('middleware'))
      .input(Symbol('input'))
      .output(Symbol('output'))
      .query();

    const ctx = {
      app: {
        service: {
          Core: {
            getApplication: serviceGetApplication,
          },
        },
        model: {
          Application: {
            findOne: jest.fn(),
          },
        },
        filters: {},
      },
      client: { roles: ['guest'] },
    };

    const result = await handler({
      input: {
        where: {
          name: {
            equals: applicationRecord.name,
          },
        },
      },
      ctx,
    });

    expect(serviceGetApplication).toHaveBeenCalledTimes(1);
    expect(serviceGetApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.any(Object),
      }),
      ctx
    );
    expect(result).toEqual(expect.objectContaining(applicationRecord));
  });

  test('warp.procedure bindings fall back to the Core service by unit name', async () => {
    const { createWarpTrpcBindings } = loadTsModule('core/warpspeed.ts');
    const serviceIngestWarpFlowActivity = jest.fn(async () => warpFlowActivityRecord);
    const procedure = {
      use: jest.fn(() => procedure),
      input: jest.fn(() => procedure),
      output: jest.fn(() => procedure),
      query: jest.fn((handler) => handler),
      mutation: jest.fn((handler) => handler),
    };

    const warp = createWarpTrpcBindings(procedure);
    const handler = warp
      .procedure('core.ingestWarpFlowActivity')
      .use(Symbol('middleware'))
      .input(Symbol('input'))
      .output(Symbol('output'))
      .mutation();

    const ctx = {
      app: {
        service: {
          Core: {
            ingestWarpFlowActivity: serviceIngestWarpFlowActivity,
          },
        },
        model: {},
        filters: {},
      },
      client: { roles: ['guest'] },
    };

    const input = { status: 'ok' };
    const result = await handler({ input, ctx });

    expect(serviceIngestWarpFlowActivity).toHaveBeenCalledTimes(1);
    expect(serviceIngestWarpFlowActivity).toHaveBeenCalledWith(input, ctx);
    expect(result).toEqual(expect.objectContaining(warpFlowActivityRecord));
  });

  test('warp.view bindings fall back to the Core service by unit name', async () => {
    const { createWarpTrpcBindings } = loadTsModule('core/warpspeed.ts');
    const serviceGetWarpFlowActivity = jest.fn(async () => warpFlowActivityRecord);
    const procedure = {
      use: jest.fn(() => procedure),
      input: jest.fn(() => procedure),
      output: jest.fn(() => procedure),
      query: jest.fn((handler) => handler),
      mutation: jest.fn((handler) => handler),
    };

    const warp = createWarpTrpcBindings(procedure);
    const handler = warp
      .view('core.getWarpFlowActivity')
      .use(Symbol('middleware'))
      .input(Symbol('input'))
      .output(Symbol('output'))
      .query();

    const ctx = {
      app: {
        service: {
          Core: {
            getWarpFlowActivity: serviceGetWarpFlowActivity,
          },
        },
        model: {},
        filters: {},
      },
      client: { roles: ['guest'] },
    };

    const input = { since: '2026-03-08T00:00:00.000Z' };
    const result = await handler({ input, ctx });

    expect(serviceGetWarpFlowActivity).toHaveBeenCalledTimes(1);
    expect(serviceGetWarpFlowActivity).toHaveBeenCalledWith(input, ctx);
    expect(result).toEqual(expect.objectContaining(warpFlowActivityRecord));
  });

  test('warp.view bindings can fall back to the Core getAccount service by unit name', async () => {
    const { createWarpTrpcBindings } = loadTsModule('core/warpspeed.ts');
    const serviceGetAccount = jest.fn(async () => accountRecord);
    const procedure = {
      use: jest.fn(() => procedure),
      input: jest.fn(() => procedure),
      output: jest.fn(() => procedure),
      query: jest.fn((handler) => handler),
      mutation: jest.fn((handler) => handler),
    };

    const warp = createWarpTrpcBindings(procedure);
    const handler = warp
      .view('core.getAccount')
      .use(Symbol('middleware'))
      .input(Symbol('input'))
      .output(Symbol('output'))
      .query();

    const ctx = {
      app: {
        service: {
          Core: {
            getAccount: serviceGetAccount,
          },
        },
        model: {},
        filters: {},
      },
      client: { roles: ['guest'] },
    };

    const input = {
      where: {
        id: {
          equals: accountRecord.id,
        },
      },
    };
    const result = await handler({ input, ctx });

    expect(serviceGetAccount).toHaveBeenCalledTimes(1);
    expect(serviceGetAccount).toHaveBeenCalledWith(input, ctx);
    expect(result).toEqual(expect.objectContaining(accountRecord));
  });

  test('protocol WarpSpeed helper falls back to the Core service when the reducer path is disabled', async () => {
    const { maybeInvokeWarpSpeedReducer } = loadTsModule('core/warpspeed.ts');
    const serviceGetApplication = jest.fn(async () => applicationRecord);

    const ctx = {
      app: {
        service: {
          Core: {
            getApplication: serviceGetApplication,
          },
        },
        model: {
          Application: {
            findOne: jest.fn(),
          },
        },
        filters: {},
      },
      client: { roles: ['guest'] },
    };

    const result = await maybeInvokeWarpSpeedReducer({
      reducerName: 'core.getApplication',
      input: {
        where: {
          name: {
            equals: applicationRecord.name,
          },
        },
      },
      ctx,
      fallback: () => serviceGetApplication(),
    });

    expect(serviceGetApplication).toHaveBeenCalledTimes(1);
    expect(result).toEqual(
      expect.objectContaining({
        ...applicationRecord,
      })
    );
  });

  test('protocol WarpSpeed helper exposes typed table access for reducer contexts', async () => {
    const {
      buildWarpSpeedReducerCtxForTests,
      resetWarpSpeedReducerRuntimeForTests,
    } = loadTsModule('core/warpspeed.ts');
    resetWarpSpeedReducerRuntimeForTests();
    const runtime = require(reducerLoaderPath).loadWarpSpeedArtifacts();
    const exec = jest.fn(async () => applicationRecord);
    const findOne = jest.fn(() => ({ exec }));

    const ctx = {
      app: {
        service: { Core: {} },
        model: {
          Application: {
            findOne,
          },
        },
        filters: {},
      },
      client: { roles: ['guest'] },
    };

    const reducerCtx = buildWarpSpeedReducerCtxForTests(ctx, await runtime);
    const result = await reducerCtx.db.applications.findOneByFilter({
      where: {
        id: {
          equals: applicationRecord.id,
        },
      },
    });

    expect(findOne).toHaveBeenCalledTimes(1);
    expect(findOne.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        _id: expect.anything(),
      })
    );
    expect(result).toEqual(expect.objectContaining(applicationRecord));
  });

  test('protocol WarpSpeed helper can execute getApplication through the reducer artifact', async () => {
    const {
      buildWarpSpeedReducerCtxForTests,
      resetWarpSpeedReducerRuntimeForTests,
    } = loadTsModule('core/warpspeed.ts');
    resetWarpSpeedReducerRuntimeForTests();
    const runtime = await require(reducerLoaderPath).loadWarpSpeedArtifacts(path.dirname(reducerLoaderPath));
    const exec = jest.fn(async () => applicationRecord);
    const lean = jest.fn(() => ({ exec }));
    const findOne = jest.fn(() => ({ lean }));

    const ctx = {
      app: {
        service: { Core: {} },
        model: {
          Application: {
            findOne,
          },
        },
        filters: {},
      },
      client: { roles: ['guest'] },
    };

    const reducerCtx = buildWarpSpeedReducerCtxForTests(ctx, runtime);
    const result = await runtime.executeReducer({
      reducerName: 'core.getApplication',
      input: {
        where: {
          id: {
            equals: applicationRecord.id,
          },
        },
      },
      ctx: reducerCtx,
    });

    expect(findOne).toHaveBeenCalledWith({
      _id: applicationRecord.id,
    });
    expect(lean).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expect.objectContaining(applicationRecord));
  });

  test('protocol WarpSpeed helper exposes typed table writes for reducer contexts', async () => {
    const {
      buildWarpSpeedReducerCtxForTests,
      resetWarpSpeedReducerRuntimeForTests,
    } = loadTsModule('core/warpspeed.ts');
    resetWarpSpeedReducerRuntimeForTests();
    const runtime = require(reducerLoaderPath).loadWarpSpeedArtifacts();
    const exec = jest.fn(async () => ({ ...applicationRecord, name: 'Updated Cerebro' }));
    const lean = jest.fn(() => ({ exec }));
    const findByIdAndUpdate = jest.fn(() => ({ lean }));

    const ctx = {
      app: {
        service: { Core: {} },
        model: {
          Application: {
            findByIdAndUpdate,
          },
        },
        filters: {},
      },
      client: { roles: ['admin'] },
    };

    const reducerCtx = buildWarpSpeedReducerCtxForTests(ctx, await runtime);
    expect(reducerCtx.db.applications.primaryKey).toBe('id');
    expect(reducerCtx.db.applications.externalKey).toBeNull();
    expect(reducerCtx.db.applications.keyLayout).toEqual({
      primaryKey: 'id',
      externalKey: null,
    });
    expect(reducerCtx.db.applications.getInternalKey(applicationRecord.id)).toBeNull();
    const result = await reducerCtx.db.applications.updateById(applicationRecord.id, {
      name: 'Updated Cerebro',
    });

    expect(findByIdAndUpdate).toHaveBeenCalledWith(
      applicationRecord.id,
      { name: 'Updated Cerebro' },
      { new: true }
    );
    expect(lean).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expect.objectContaining({ id: applicationRecord.id, name: 'Updated Cerebro' }));
  });

  test('protocol WarpSpeed helper exposes typed account table writes for reducer contexts', async () => {
    const {
      buildWarpSpeedReducerCtxForTests,
      resetWarpSpeedReducerRuntimeForTests,
    } = loadTsModule('core/warpspeed.ts');
    resetWarpSpeedReducerRuntimeForTests();
    const runtime = require(reducerLoaderPath).loadWarpSpeedArtifacts();
    const exec = jest.fn(async () => ({ ...accountRecord, name: 'Updated Account' }));
    const lean = jest.fn(() => ({ exec }));
    const findByIdAndUpdate = jest.fn(() => ({ lean }));

    const ctx = {
      app: {
        service: { Core: {} },
        model: {
          Account: {
            findByIdAndUpdate,
          },
        },
        filters: {},
      },
      client: { roles: ['admin'] },
    };

    const reducerCtx = buildWarpSpeedReducerCtxForTests(ctx, await runtime);
    expect(reducerCtx.db.accounts.primaryKey).toBe('id');
    expect(reducerCtx.db.accounts.externalKey).toBeNull();
    expect(reducerCtx.db.accounts.keyLayout).toEqual({
      primaryKey: 'id',
      externalKey: null,
    });
    expect(reducerCtx.db.accounts.getInternalKey(accountRecord.id)).toBeNull();
    const result = await reducerCtx.db.accounts.updateById(accountRecord.id, {
      name: 'Updated Account',
    });

    expect(findByIdAndUpdate).toHaveBeenCalledWith(
      accountRecord.id,
      { name: 'Updated Account' },
      { new: true }
    );
    expect(lean).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expect.objectContaining({ id: accountRecord.id, name: 'Updated Account' }));
  });

  test('protocol WarpSpeed helper can execute getAccount through the reducer artifact', async () => {
    const {
      buildWarpSpeedReducerCtxForTests,
      resetWarpSpeedReducerRuntimeForTests,
    } = loadTsModule('core/warpspeed.ts');
    resetWarpSpeedReducerRuntimeForTests();
    const runtime = await require(reducerLoaderPath).loadWarpSpeedArtifacts(path.dirname(reducerLoaderPath));
    const exec = jest.fn(async () => accountRecord);
    const lean = jest.fn(() => ({ exec }));
    const findOne = jest.fn(() => ({ lean }));

    const ctx = {
      app: {
        service: { Core: {} },
        model: {
          Account: {
            findOne,
          },
        },
        filters: {},
      },
      client: { roles: ['guest'] },
    };

    const reducerCtx = buildWarpSpeedReducerCtxForTests(ctx, runtime);
    const result = await runtime.executeReducer({
      reducerName: 'core.getAccount',
      input: {
        where: {
          id: {
            equals: accountRecord.id,
          },
        },
      },
      ctx: reducerCtx,
    });

    expect(findOne).toHaveBeenCalledWith({
      _id: accountRecord.id,
    });
    expect(lean).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expect.objectContaining(accountRecord));
  });

  test('protocol WarpSpeed helper can execute updateAccount through the reducer artifact', async () => {
    const {
      buildWarpSpeedReducerCtxForTests,
      resetWarpSpeedReducerRuntimeForTests,
    } = loadTsModule('core/warpspeed.ts');
    resetWarpSpeedReducerRuntimeForTests();
    const runtime = await require(reducerLoaderPath).loadWarpSpeedArtifacts(path.dirname(reducerLoaderPath));
    const exec = jest.fn(async () => ({ ...accountRecord, name: 'Updated Account' }));
    const lean = jest.fn(() => ({ exec }));
    const findByIdAndUpdate = jest.fn(() => ({ lean }));

    const ctx = {
      app: {
        service: { Core: {} },
        model: {
          Account: {
            findByIdAndUpdate,
          },
        },
        filters: {},
      },
      client: { roles: ['admin'] },
    };

    const reducerCtx = buildWarpSpeedReducerCtxForTests(ctx, runtime);
    const result = await runtime.executeReducer({
      reducerName: 'core.updateAccount',
      input: {
        where: {
          id: {
            equals: accountRecord.id,
          },
        },
        data: {
          name: 'Updated Account',
        },
      },
      ctx: reducerCtx,
    });

    expect(findByIdAndUpdate).toHaveBeenCalledWith(
      accountRecord.id,
      { name: 'Updated Account' },
      { new: true }
    );
    expect(lean).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expect.objectContaining({ id: accountRecord.id, name: 'Updated Account' }));
  });

  test('protocol WarpSpeed helper rehydrates structured reducer errors into ARXError-shaped failures', () => {
    const {
      rehydrateWarpSpeedErrorForTests,
    } = loadTsModule('core/warpspeed.ts');
    const error = new Error('NO_INPUT');
    error.name = 'ARXError';
    error.code = 'NO_INPUT';

    expect(rehydrateWarpSpeedErrorForTests(error)).toMatchObject({
      name: 'ARXError',
      code: 'NO_INPUT',
      message: 'NO_INPUT',
    });
  });

  test('protocol WarpSpeed helper exposes typed reducer indexes for conversation reducers', async () => {
    const {
      buildWarpSpeedReducerCtxForTests,
      resetWarpSpeedReducerRuntimeForTests,
    } = loadTsModule('core/warpspeed.ts');
    resetWarpSpeedReducerRuntimeForTests();
    const runtime = require(reducerLoaderPath).loadWarpSpeedArtifacts();
    const messageExec = jest.fn(async () => conversationMessageRecord);
    const messageLean = jest.fn(() => ({ exec: messageExec }));
    const findById = jest.fn(() => ({ lean: messageLean }));
    const conversationExec = jest.fn(async () => ({ id: 'conversation-1' }));
    const conversationLean = jest.fn(() => ({ exec: conversationExec }));
    const conversationFindOne = jest.fn(() => ({ lean: conversationLean }));
    const updatedExec = jest.fn(async () => ({ ...conversationMessageRecord, isStarred: true }));
    const updatedLean = jest.fn(() => ({ exec: updatedExec }));
    const findByIdAndUpdate = jest.fn(() => ({ lean: updatedLean }));

    const ctx = {
      app: {
        service: { Core: {} },
        model: {
          ConversationMessage: {
            findById,
            findByIdAndUpdate,
          },
          Conversation: {
            findOne: conversationFindOne,
          },
        },
        filters: {},
      },
      client: {
        roles: ['user'],
        profile: {
          id: 'profile-1',
        },
      },
    };

    const reducerCtx = buildWarpSpeedReducerCtxForTests(ctx, await runtime);
    expect(reducerCtx.db.conversationMessages.primaryKey).toBe('id');
    expect(reducerCtx.db.conversationMessages.externalKey).toBeNull();
    expect(reducerCtx.db.conversationMessages.keyLayout).toEqual({
      primaryKey: 'id',
      externalKey: null,
    });
    expect(typeof reducerCtx.db.conversationMessages.byId.get).toBe('function');
    const message = await reducerCtx.db.conversationMessages.byId.get(conversationMessageRecord.id);
    const conversation = await reducerCtx.db.conversations.byIdForProfile.findOne({
      id: 'conversation-1',
      profileId: 'profile-1',
    });
    const updated = await reducerCtx.db.conversationMessages.updateById(conversationMessageRecord.id, {
      isStarred: true,
    });

    expect(findById).toHaveBeenCalledWith(conversationMessageRecord.id);
    expect(conversationFindOne).toHaveBeenCalledWith({
      _id: 'conversation-1',
      $or: [{ profileId: 'profile-1' }, { 'participants.profileId': 'profile-1' }],
    });
    expect(findByIdAndUpdate).toHaveBeenCalledWith(
      conversationMessageRecord.id,
      { isStarred: true },
      { new: true }
    );
    expect(message).toEqual(expect.objectContaining(conversationMessageRecord));
    expect(conversation).toEqual(expect.objectContaining({ id: 'conversation-1' }));
    expect(updated).toEqual(expect.objectContaining({ id: conversationMessageRecord.id, isStarred: true }));
    expect(reducerCtx.client.profile.id).toBe('profile-1');
  });

  test('protocol WarpSpeed helper can execute setConversationMessageStar through the reducer artifact', async () => {
    const {
      buildWarpSpeedReducerCtxForTests,
      resetWarpSpeedReducerRuntimeForTests,
    } = loadTsModule('core/warpspeed.ts');
    resetWarpSpeedReducerRuntimeForTests();
    const runtime = await require(reducerLoaderPath).loadWarpSpeedArtifacts(path.dirname(reducerLoaderPath));
    const messageExec = jest.fn(async () => conversationMessageRecord);
    const messageLean = jest.fn(() => ({ exec: messageExec }));
    const findById = jest.fn(() => ({ lean: messageLean }));
    const conversationExec = jest.fn(async () => ({ id: 'conversation-1' }));
    const conversationLean = jest.fn(() => ({ exec: conversationExec }));
    const conversationFindOne = jest.fn(() => ({ lean: conversationLean }));
    const updatedExec = jest.fn(async () => ({ ...conversationMessageRecord, isStarred: true }));
    const updatedLean = jest.fn(() => ({ exec: updatedExec }));
    const findByIdAndUpdate = jest.fn(() => ({ lean: updatedLean }));

    const ctx = {
      app: {
        service: { Core: {} },
        model: {
          ConversationMessage: {
            findById,
            findByIdAndUpdate,
          },
          Conversation: {
            findOne: conversationFindOne,
          },
        },
        filters: {},
      },
      client: {
        roles: ['user'],
        profile: {
          id: 'profile-1',
        },
      },
    };

    const reducerCtx = buildWarpSpeedReducerCtxForTests(ctx, runtime);
    const result = await runtime.executeReducer({
      reducerName: 'core.setConversationMessageStar',
      input: {
        messageId: conversationMessageRecord.id,
        isStarred: true,
      },
      ctx: reducerCtx,
    });

    expect(findById).toHaveBeenCalledWith(conversationMessageRecord.id);
    expect(conversationFindOne).toHaveBeenCalledWith({
      _id: 'conversation-1',
      $or: [{ profileId: 'profile-1' }, { 'participants.profileId': 'profile-1' }],
    });
    expect(findByIdAndUpdate).toHaveBeenCalledWith(
      conversationMessageRecord.id,
      { isStarred: true },
      { new: true }
    );
    expect(result).toEqual({
      ok: true,
      messageId: conversationMessageRecord.id,
      isStarred: true,
    });
  });
});
