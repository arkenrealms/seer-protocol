const path = require('node:path');

const characterTaxonomySpecs = [
  {
    modelName: 'CharacterClass',
    tableName: 'characterClasses',
    accessName: 'characterClasses',
    getMethodName: 'getCharacterClass',
    updateMethodName: 'updateCharacterClass',
    getFeatureFlag: 'WARPSPEED_ENABLE_GET_CHARACTER_CLASS_REDUCER',
    updateFeatureFlag: 'WARPSPEED_ENABLE_UPDATE_CHARACTER_CLASS_REDUCER',
    viewFlag: 'WARPSPEED_ENABLE_CHARACTER_VIEWS',
    reducerFlag: 'WARPSPEED_ENABLE_CHARACTER_REDUCERS',
  },
  {
    modelName: 'CharacterFaction',
    tableName: 'characterFactions',
    accessName: 'characterFactions',
    getMethodName: 'getCharacterFaction',
    getManyMethodName: 'getCharacterFactions',
    createMethodName: 'createCharacterFaction',
    updateMethodName: 'updateCharacterFaction',
    getFeatureFlag: 'WARPSPEED_ENABLE_GET_CHARACTER_FACTION_REDUCER',
    getManyFeatureFlag: 'WARPSPEED_ENABLE_GET_CHARACTER_FACTIONS_REDUCER',
    createFeatureFlag: 'WARPSPEED_ENABLE_CREATE_CHARACTER_FACTION_REDUCER',
    updateFeatureFlag: 'WARPSPEED_ENABLE_UPDATE_CHARACTER_FACTION_REDUCER',
    viewFlag: 'WARPSPEED_ENABLE_CHARACTER_VIEWS',
    reducerFlag: 'WARPSPEED_ENABLE_CHARACTER_REDUCERS',
  },
  {
    modelName: 'CharacterGender',
    tableName: 'characterGenders',
    accessName: 'characterGenders',
    getMethodName: 'getCharacterGender',
    updateMethodName: 'updateCharacterGender',
    getFeatureFlag: 'WARPSPEED_ENABLE_GET_CHARACTER_GENDER_REDUCER',
    updateFeatureFlag: 'WARPSPEED_ENABLE_UPDATE_CHARACTER_GENDER_REDUCER',
    viewFlag: 'WARPSPEED_ENABLE_CHARACTER_VIEWS',
    reducerFlag: 'WARPSPEED_ENABLE_CHARACTER_REDUCERS',
  },
  {
    modelName: 'CharacterNameChoice',
    tableName: 'characterNameChoices',
    accessName: 'characterNameChoices',
    getMethodName: 'getCharacterNameChoice',
    updateMethodName: 'updateCharacterNameChoice',
    getFeatureFlag: 'WARPSPEED_ENABLE_GET_CHARACTER_NAME_CHOICE_REDUCER',
    updateFeatureFlag: 'WARPSPEED_ENABLE_UPDATE_CHARACTER_NAME_CHOICE_REDUCER',
    viewFlag: 'WARPSPEED_ENABLE_CHARACTER_VIEWS',
    reducerFlag: 'WARPSPEED_ENABLE_CHARACTER_REDUCERS',
  },
  {
    modelName: 'CharacterPersonality',
    tableName: 'characterPersonalities',
    accessName: 'characterPersonalities',
    getMethodName: 'getCharacterPersonality',
    updateMethodName: 'updateCharacterPersonality',
    getFeatureFlag: 'WARPSPEED_ENABLE_GET_CHARACTER_PERSONALITY_REDUCER',
    updateFeatureFlag: 'WARPSPEED_ENABLE_UPDATE_CHARACTER_PERSONALITY_REDUCER',
    viewFlag: 'WARPSPEED_ENABLE_CHARACTER_VIEWS',
    reducerFlag: 'WARPSPEED_ENABLE_CHARACTER_REDUCERS',
  },
  {
    modelName: 'CharacterRace',
    tableName: 'characterRaces',
    accessName: 'characterRaces',
    getMethodName: 'getCharacterRace',
    updateMethodName: 'updateCharacterRace',
    getFeatureFlag: 'WARPSPEED_ENABLE_GET_CHARACTER_RACE_REDUCER',
    updateFeatureFlag: 'WARPSPEED_ENABLE_UPDATE_CHARACTER_RACE_REDUCER',
    viewFlag: 'WARPSPEED_ENABLE_CHARACTER_VIEWS',
    reducerFlag: 'WARPSPEED_ENABLE_CHARACTER_REDUCERS',
  },
  {
    modelName: 'CharacterTitle',
    tableName: 'characterTitles',
    accessName: 'characterTitles',
    getMethodName: 'getCharacterTitle',
    updateMethodName: 'updateCharacterTitle',
    getFeatureFlag: 'WARPSPEED_ENABLE_GET_CHARACTER_TITLE_REDUCER',
    updateFeatureFlag: 'WARPSPEED_ENABLE_UPDATE_CHARACTER_TITLE_REDUCER',
    viewFlag: 'WARPSPEED_ENABLE_CHARACTER_VIEWS',
    reducerFlag: 'WARPSPEED_ENABLE_CHARACTER_REDUCERS',
  },
  {
    modelName: 'CharacterType',
    tableName: 'characterTypes',
    accessName: 'characterTypes',
    getMethodName: 'getCharacterType',
    updateMethodName: 'updateCharacterType',
    getFeatureFlag: 'WARPSPEED_ENABLE_GET_CHARACTER_TYPE_REDUCER',
    updateFeatureFlag: 'WARPSPEED_ENABLE_UPDATE_CHARACTER_TYPE_REDUCER',
    viewFlag: 'WARPSPEED_ENABLE_CHARACTER_VIEWS',
    reducerFlag: 'WARPSPEED_ENABLE_CHARACTER_REDUCERS',
  },
];

const manifest = {
  manifestVersion: 5,
  tables: [
    {
      tableName: 'accounts',
      accessName: 'accounts',
      model: 'Account',
      primaryKey: 'id',
      externalKey: null,
      indexes: {},
      operations: {
        findOneByFilter: {
          filter: 'getFilter(input)',
        },
        updateById: {
          id: 'input.where.id.equals',
          data: 'input.data',
        },
      },
    },
    {
      tableName: 'applications',
      accessName: 'applications',
      model: 'Application',
      indexes: {},
      operations: {
        findOneByFilter: {
          filter: 'getFilter(input)',
        },
        updateById: {
          id: 'input.where.id.equals',
          data: 'input.data',
        },
      },
    },
    {
      tableName: 'conversationMessages',
      accessName: 'conversationMessages',
      model: 'ConversationMessage',
      indexes: {
        byId: {
          kind: 'byId',
        },
      },
      operations: {
        updateById: {
          id: 'input.messageId',
          data: '{ isStarred: !!input.isStarred }',
        },
      },
    },
    {
      tableName: 'conversations',
      accessName: 'conversations',
      model: 'Conversation',
      indexes: {
        byId: {
          kind: 'byId',
        },
        byIdForProfile: {
          kind: 'findOne',
          filter:
            '({ _id: args.id, $or: [{ profileId: args.profileId }, { "participants.profileId": args.profileId }] })',
        },
      },
      operations: {},
    },
    {
      tableName: 'characters',
      accessName: 'characters',
      model: 'Character',
      indexes: {
        byId: {
          kind: 'byId',
        },
      },
      operations: {},
    },
    {
      tableName: 'characterInventoryItems',
      accessName: 'characterInventoryItems',
      model: 'CharacterInventoryItem',
      primaryKey: 'recordPk',
      externalKey: 'recordId',
      indexes: {
        byRecordId: {
          kind: 'findOne',
          filter: '({ recordId: args.recordId })',
        },
        byCharacterRecord: {
          kind: 'findOne',
          filter: '({ characterId: args.characterId, recordPk: args.recordPk, recordId: args.recordId })',
        },
      },
      operations: {
        findOneByFilter: {
          filter: 'input.where ?? input',
        },
        findManyByFilter: {
          filter: 'input.where ?? input',
        },
      },
    },
    {
      tableName: 'characterInventoryReceipts',
      accessName: 'characterInventoryReceipts',
      model: 'CharacterInventoryReceipt',
      indexes: {
        byCharacterId: {
          kind: 'findOne',
          filter: '({ characterId: args.characterId })',
        },
      },
      operations: {
        findOneByFilter: {
          filter: 'input.where ?? input',
        },
      },
    },
    {
      tableName: 'characterAbilities',
      accessName: 'characterAbilities',
      model: 'CharacterAbility',
      indexes: {
        byId: {
          kind: 'byId',
        },
      },
      operations: {
        updateById: {
          id: 'input.where.id.equals',
          data: 'input.data',
        },
      },
    },
    {
      tableName: 'characterAttributes',
      accessName: 'characterAttributes',
      model: 'CharacterAttribute',
      indexes: {
        byId: {
          kind: 'byId',
        },
      },
      operations: {
        updateById: {
          id: 'input.where.id.equals',
          data: 'input.data',
        },
      },
    },
  ],
  reducers: [
    {
      reducerName: 'core.getApplication',
      runtime: {
        kind: 'authored.workflow',
        guest: 'js',
      },
      source: {
        path: '/Users/dev/shared/arken/seer/node/services/core/core.service.ts',
        className: 'Service',
        methodName: 'getApplication',
      },
      workflowPlan: {
        version: 1,
        prelude: [
          {
            kind: 'loadFindOne',
            into: 'application',
            table: 'applications',
            modelName: 'Application',
            filter: {
              $helper: 'getFilter',
              args: [{ $path: 'input' }],
            },
          },
        ],
        guest: {
          guards: [
            {
              kind: 'present',
              path: 'input',
              error: {
                name: 'ARXError',
                code: 'NO_INPUT',
                message: 'NO_INPUT',
              },
            },
            {
              kind: 'truthy',
              path: 'state.application',
              error: 'Application not found',
            },
          ],
          commands: [],
          output: {
            $path: 'state.application',
          },
        },
      },
      integration: {
        featureFlags: [
          'WARPSPEED_ENABLE_ROUTE_REDUCERS',
          'WARPSPEED_ENABLE_REDUCERS',
          'WARPSPEED_ENABLE_GET_APPLICATION_REDUCER',
        ],
      },
    },
    {
      reducerName: 'core.updateApplication',
      runtime: {
        kind: 'authored.workflow',
        guest: 'js',
      },
      source: {
        path: '/Users/dev/shared/arken/seer/node/services/core/core.service.ts',
        className: 'Service',
        methodName: 'updateApplication',
      },
      workflowPlan: {
        version: 1,
        prelude: [],
        guest: {
          guards: [
            {
              kind: 'present',
              path: 'input',
              error: {
                name: 'ARXError',
                code: 'NO_INPUT',
                message: 'NO_INPUT',
              },
            },
            {
              kind: 'truthy',
              path: 'state.updatedApplication',
              error: 'Application update failed',
            },
          ],
          commands: [
            {
              kind: 'updateById',
              table: 'applications',
              modelName: 'Application',
              into: 'updatedApplication',
              id: {
                $path: 'input.where.id.equals',
              },
              data: {
                $path: 'input.data',
              },
            },
          ],
          output: {
            $path: 'state.updatedApplication',
          },
        },
      },
      integration: {
        featureFlags: [
          'WARPSPEED_ENABLE_ROUTE_REDUCERS',
          'WARPSPEED_ENABLE_REDUCERS',
          'WARPSPEED_ENABLE_UPDATE_APPLICATION_REDUCER',
        ],
      },
    },
    {
      reducerName: 'core.getAccount',
      runtime: {
        kind: 'authored.workflow',
        guest: 'js',
      },
      source: {
        path: '/Users/dev/shared/arken/seer/node/services/core/core.service.ts',
        className: 'Service',
        methodName: 'getAccount',
      },
      workflowPlan: {
        version: 1,
        prelude: [
          {
            kind: 'loadFindOne',
            into: 'account',
            table: 'accounts',
            modelName: 'Account',
            filter: {
              $helper: 'getFilter',
              args: [{ $path: 'input' }],
            },
          },
        ],
        guest: {
          guards: [
            {
              kind: 'present',
              path: 'input',
              error: {
                name: 'ARXError',
                code: 'NO_INPUT',
                message: 'NO_INPUT',
              },
            },
            {
              kind: 'truthy',
              path: 'state.account',
              error: 'Account not found',
            },
          ],
          commands: [],
          output: {
            $path: 'state.account',
          },
        },
      },
      integration: {
        featureFlags: [
          'WARPSPEED_ENABLE_ROUTE_REDUCERS',
          'WARPSPEED_ENABLE_REDUCERS',
          'WARPSPEED_ENABLE_GET_ACCOUNT_REDUCER',
        ],
      },
    },
    {
      reducerName: 'core.updateAccount',
      runtime: {
        kind: 'authored.workflow',
        guest: 'js',
      },
      source: {
        path: '/Users/dev/shared/arken/seer/node/services/core/core.service.ts',
        className: 'Service',
        methodName: 'updateAccount',
      },
      workflowPlan: {
        version: 1,
        prelude: [],
        guest: {
          guards: [
            {
              kind: 'present',
              path: 'input',
              error: {
                name: 'ARXError',
                code: 'NO_INPUT',
                message: 'NO_INPUT',
              },
            },
            {
              kind: 'truthy',
              path: 'state.updatedAccount',
              error: 'Account update failed',
            },
          ],
          commands: [
            {
              kind: 'updateById',
              table: 'accounts',
              modelName: 'Account',
              into: 'updatedAccount',
              id: {
                $path: 'input.where.id.equals',
              },
              data: {
                $path: 'input.data',
              },
            },
          ],
          output: {
            $path: 'state.updatedAccount',
          },
        },
      },
      integration: {
        featureFlags: [
          'WARPSPEED_ENABLE_ROUTE_REDUCERS',
          'WARPSPEED_ENABLE_REDUCERS',
          'WARPSPEED_ENABLE_UPDATE_ACCOUNT_REDUCER',
        ],
      },
    },
    {
      reducerName: 'core.setConversationMessageStar',
      runtime: {
        kind: 'authored.workflow',
        guest: 'wasm',
      },
      workflowPlan: {
        version: 1,
        prelude: [
          {
            kind: 'loadById',
            into: 'message',
            table: 'conversationMessages',
            index: 'byId',
            id: {
              $path: 'input.messageId',
              $coerce: 'string',
            },
          },
          {
            kind: 'loadFindOne',
            into: 'authorizedConversation',
            table: 'conversations',
            index: 'byIdForProfile',
            when: {
              $path: 'state.message.conversationId',
            },
            args: {
              id: {
                $path: 'state.message.conversationId',
                $coerce: 'string',
              },
              profileId: {
                $path: 'ctx.client.profile.id',
                $coerce: 'string',
              },
            },
          },
        ],
        guest: {
          guards: [
            {
              kind: 'present',
              path: 'ctx.client.profile.id',
              error: 'Unauthorized',
            },
            {
              kind: 'truthy',
              path: 'state.message',
              error: 'Message not found',
            },
            {
              kind: 'truthy',
              path: 'state.authorizedConversation',
              error: 'Not authorized for this message',
            },
          ],
          commands: [
            {
              kind: 'updateById',
              table: 'conversationMessages',
              id: {
                $path: 'input.messageId',
                $coerce: 'string',
              },
              data: {
                isStarred: {
                  $path: 'input.isStarred',
                  $coerce: 'boolean',
                },
              },
            },
          ],
          output: {
            ok: true,
            messageId: {
              $path: 'input.messageId',
              $coerce: 'string',
            },
            isStarred: {
              $path: 'input.isStarred',
              $coerce: 'boolean',
            },
          },
        },
      },
      integration: {
        featureFlags: [
          'WARPSPEED_ENABLE_ROUTE_REDUCERS',
          'WARPSPEED_ENABLE_REDUCERS',
          'WARPSPEED_ENABLE_SET_CONVERSATION_MESSAGE_STAR_REDUCER',
        ],
      },
    },
    {
      reducerName: 'character.getCharacterInventory',
      runtime: {
        kind: 'authored.workflow',
        guest: 'js',
      },
      source: {
        path: '/Users/dev/shared/arken/seer/node/services/character/character.service.ts',
        className: 'Service',
        methodName: 'getCharacterInventory',
      },
      workflowPlan: {
        version: 1,
        prelude: [
          {
            kind: 'loadById',
            into: 'character',
            table: 'characters',
            modelName: 'Character',
            index: 'byId',
            id: {
              $path: 'input.characterId',
            },
          },
          {
            kind: 'loadFindMany',
            into: 'inventoryRows',
            table: 'characterInventoryItems',
            modelName: 'CharacterInventoryItem',
            filter: {
              where: {
                characterId: {
                  equals: {
                    $path: 'input.characterId',
                  },
                },
              },
            },
            when: {
              $path: 'state.character',
            },
          },
          {
            kind: 'compute',
            into: 'inventory',
            value: {
              $helper: 'buildWarpCharacterInventoryPublicView',
              args: [
                {
                  $path: 'state.character.id',
                  $coerce: 'string',
                },
                {
                  $path: 'state.inventoryRows',
                },
              ],
            },
            when: {
              $path: 'state.character',
            },
          },
        ],
        guest: {
          guards: [
            {
              kind: 'present',
              path: 'ctx.client.profile',
              error: {
                name: 'ARXError',
                code: 'UNAUTHORIZED',
                message: 'UNAUTHORIZED',
              },
            },
            {
              kind: 'present',
              path: 'input.characterId',
              error: {
                name: 'ARXError',
                code: 'NO_INPUT',
                message: 'NO_INPUT',
              },
            },
            {
              kind: 'truthy',
              path: 'state.character',
              error: 'Character not found',
            },
          ],
          commands: [],
          output: {
            characterId: {
              $path: 'state.character.id',
              $coerce: 'string',
            },
            inventory: {
              $path: 'state.inventory',
            },
          },
        },
      },
      integration: {
        featureFlags: [
          'WARPSPEED_ENABLE_ROUTE_REDUCERS',
          'WARPSPEED_ENABLE_REDUCERS',
          'WARPSPEED_ENABLE_CHARACTER_VIEWS',
          'WARPSPEED_ENABLE_GET_CHARACTER_INVENTORY_REDUCER',
        ],
      },
    },
    {
      reducerName: 'character.getCharacterInventoryReceipt',
      runtime: {
        kind: 'authored.workflow',
        guest: 'js',
      },
      source: {
        path: '/Users/dev/shared/arken/seer/node/services/character/character.service.ts',
        className: 'Service',
        methodName: 'getCharacterInventoryReceipt',
      },
      workflowPlan: {
        version: 1,
        prelude: [
          {
            kind: 'loadById',
            into: 'character',
            table: 'characters',
            modelName: 'Character',
            index: 'byId',
            id: {
              $path: 'input.characterId',
            },
          },
          {
            kind: 'loadFindMany',
            into: 'inventoryRows',
            table: 'characterInventoryItems',
            modelName: 'CharacterInventoryItem',
            filter: {
              where: {
                characterId: {
                  equals: {
                    $path: 'input.characterId',
                  },
                },
              },
            },
            when: {
              $path: 'state.character',
            },
          },
          {
            kind: 'compute',
            into: 'inventoryTable',
            value: {
              $helper: 'materializeWarpCharacterInventoryTableFromRows',
              args: [
                {
                  $path: 'state.character.id',
                  $coerce: 'string',
                },
                {
                  $path: 'state.inventoryRows',
                },
              ],
            },
            when: {
              $path: 'state.character',
            },
          },
          {
            kind: 'compute',
            into: 'inventoryReceipt',
            value: {
              $helper: 'buildWarpCharacterInventoryAuditReceipt',
              args: [{ $path: 'state.inventoryTable' }],
            },
            when: {
              $path: 'state.inventoryTable',
            },
          },
        ],
      },
      integration: {
        featureFlags: [
          'WARPSPEED_ENABLE_ROUTE_REDUCERS',
          'WARPSPEED_ENABLE_REDUCERS',
          'WARPSPEED_ENABLE_CHARACTER_VIEWS',
          'WARPSPEED_ENABLE_GET_CHARACTER_INVENTORY_RECEIPT_REDUCER',
        ],
      },
    },
    {
      reducerName: 'character.getCharacterInventoryAuditExport',
      runtime: {
        kind: 'authored.workflow',
        guest: 'js',
      },
      source: {
        path: '/Users/dev/shared/arken/seer/node/services/character/character.service.ts',
        className: 'Service',
        methodName: 'getCharacterInventoryAuditExport',
      },
      workflowPlan: {
        version: 1,
        prelude: [
          {
            kind: 'loadById',
            into: 'character',
            table: 'characters',
            modelName: 'Character',
            index: 'byId',
            id: {
              $path: 'input.characterId',
            },
          },
          {
            kind: 'loadFindMany',
            into: 'inventoryRows',
            table: 'characterInventoryItems',
            modelName: 'CharacterInventoryItem',
            filter: {
              where: {
                characterId: {
                  equals: {
                    $path: 'input.characterId',
                  },
                },
              },
            },
            when: {
              $path: 'state.character',
            },
          },
          {
            kind: 'loadFindOne',
            into: 'inventoryReceipt',
            table: 'characterInventoryReceipts',
            modelName: 'CharacterInventoryReceipt',
            index: 'byCharacterId',
            args: {
              characterId: {
                $path: 'input.characterId',
              },
            },
            when: {
              $path: 'state.character',
            },
          },
          {
            kind: 'compute',
            into: 'inventoryTable',
            value: {
              $helper: 'materializeWarpCharacterInventoryTableFromRows',
              args: [
                {
                  $path: 'state.character.id',
                  $coerce: 'string',
                },
                {
                  $path: 'state.inventoryRows',
                },
              ],
            },
            when: {
              $path: 'state.character',
            },
          },
        ],
      },
      integration: {
        featureFlags: [
          'WARPSPEED_ENABLE_ROUTE_REDUCERS',
          'WARPSPEED_ENABLE_REDUCERS',
          'WARPSPEED_ENABLE_CHARACTER_VIEWS',
          'WARPSPEED_ENABLE_GET_CHARACTER_INVENTORY_AUDIT_EXPORT_REDUCER',
        ],
      },
    },
    {
      reducerName: 'character.syncCharacterInventory',
      runtime: {
        kind: 'authored.workflow',
        guest: 'js',
      },
      source: {
        path: '/Users/dev/shared/arken/seer/node/services/character/character.service.ts',
        className: 'Service',
        methodName: 'syncCharacterInventory',
      },
      workflowPlan: {
        version: 1,
        prelude: [
          {
            kind: 'loadById',
            into: 'character',
            table: 'characters',
            index: 'byId',
            id: {
              $path: 'input.characterId',
            },
          },
          {
            kind: 'loadFindMany',
            into: 'inventoryRows',
            table: 'characterInventoryItems',
            modelName: 'CharacterInventoryItem',
            filter: {
              where: {
                characterId: {
                  equals: {
                    $path: 'input.characterId',
                  },
                },
              },
            },
            when: {
              $path: 'state.character',
            },
          },
          {
            kind: 'compute',
            into: 'inventoryTable',
            value: {
              $helper: 'materializeWarpCharacterInventoryTableFromRows',
              args: [{ $path: 'state.character.id', $coerce: 'string' }, { $path: 'state.inventoryRows' }],
            },
            when: {
              $path: 'state.character',
            },
          },
          {
            kind: 'compute',
            into: 'inventoryPersistence',
            value: {
              $helper: 'buildWarpCharacterInventoryPersistence',
              args: [{ $path: 'state.character' }, { $path: 'state.inventoryTable' }],
            },
            when: {
              $path: 'state.inventoryTable',
            },
          },
        ],
        guest: {
          guards: [
            {
              kind: 'present',
              path: 'ctx.client.profile',
              error: {
                name: 'ARXError',
                code: 'UNAUTHORIZED',
                message: 'UNAUTHORIZED',
              },
            },
            {
              kind: 'present',
              path: 'input.characterId',
              error: {
                name: 'ARXError',
                code: 'NO_INPUT',
                message: 'NO_INPUT',
              },
            },
            {
              kind: 'truthy',
              path: 'state.character',
              error: 'Character not found',
            },
            {
              kind: 'truthy',
              path: 'state.updatedCharacter',
              error: 'Character not found',
            },
          ],
          commands: [
            {
              kind: 'updateById',
              table: 'characters',
              modelName: 'Character',
              into: 'updatedCharacter',
              id: {
                $path: 'input.characterId',
              },
              data: {
                $path: 'state.inventoryPersistence',
              },
            },
          ],
          output: {
            characterId: {
              $path: 'state.updatedCharacter.id',
              $coerce: 'string',
            },
            inventory: {
              $helper: 'ensureWarpCharacterInventoryForCharacter',
              args: [{ $path: 'state.updatedCharacter' }],
            },
          },
        },
      },
      integration: {
        featureFlags: [
          'WARPSPEED_ENABLE_ROUTE_REDUCERS',
          'WARPSPEED_ENABLE_REDUCERS',
          'WARPSPEED_ENABLE_CHARACTER_REDUCERS',
          'WARPSPEED_ENABLE_SYNC_CHARACTER_INVENTORY_REDUCER',
        ],
      },
    },
    {
      reducerName: 'character.getCharacterAbility',
      runtime: {
        kind: 'authored.workflow',
        guest: 'js',
      },
      source: {
        path: '/Users/dev/shared/arken/seer/node/services/character/character.service.ts',
        className: 'Service',
        methodName: 'getCharacterAbility',
      },
      workflowPlan: {
        version: 1,
        prelude: [
          {
            kind: 'compute',
            into: 'filter',
            value: {
              $helper: 'getFilter',
              args: [{ $path: 'input' }],
            },
          },
          {
            kind: 'loadById',
            into: 'characterAbility',
            table: 'characterAbilities',
            index: 'byId',
            modelName: 'CharacterAbility',
            id: {
              $path: 'state.filter.id',
            },
            when: {
              $path: 'state.filter',
            },
          },
        ],
        guest: {
          guards: [
            {
              kind: 'present',
              path: 'input',
              error: {
                name: 'ARXError',
                code: 'NO_INPUT',
                message: 'NO_INPUT',
              },
            },
            {
              kind: 'truthy',
              path: 'state.characterAbility',
              error: 'CharacterAbility not found',
            },
          ],
          commands: [],
          output: {
            $path: 'state.characterAbility',
          },
        },
      },
      integration: {
        featureFlags: [
          'WARPSPEED_ENABLE_ROUTE_REDUCERS',
          'WARPSPEED_ENABLE_REDUCERS',
          'WARPSPEED_ENABLE_CHARACTER_VIEWS',
          'WARPSPEED_ENABLE_GET_CHARACTER_ABILITY_REDUCER',
        ],
      },
    },
    {
      reducerName: 'character.getCharacterAttribute',
      runtime: {
        kind: 'authored.workflow',
        guest: 'js',
      },
      source: {
        path: '/Users/dev/shared/arken/seer/node/services/character/character.service.ts',
        className: 'Service',
        methodName: 'getCharacterAttribute',
      },
      workflowPlan: {
        version: 1,
        prelude: [
          {
            kind: 'compute',
            into: 'filter',
            value: {
              $helper: 'getFilter',
              args: [{ $path: 'input' }],
            },
          },
          {
            kind: 'loadById',
            into: 'characterAttribute',
            table: 'characterAttributes',
            index: 'byId',
            modelName: 'CharacterAttribute',
            id: {
              $path: 'state.filter.id',
            },
            when: {
              $path: 'state.filter',
            },
          },
        ],
        guest: {
          guards: [
            {
              kind: 'present',
              path: 'input',
              error: {
                name: 'ARXError',
                code: 'NO_INPUT',
                message: 'NO_INPUT',
              },
            },
            {
              kind: 'truthy',
              path: 'state.characterAttribute',
              error: 'CharacterAttribute not found',
            },
          ],
          commands: [],
          output: {
            $path: 'state.characterAttribute',
          },
        },
      },
      integration: {
        featureFlags: [
          'WARPSPEED_ENABLE_ROUTE_REDUCERS',
          'WARPSPEED_ENABLE_REDUCERS',
          'WARPSPEED_ENABLE_CHARACTER_VIEWS',
          'WARPSPEED_ENABLE_GET_CHARACTER_ATTRIBUTE_REDUCER',
        ],
      },
    },
    {
      reducerName: 'character.applyCharacterInventoryPatch',
      runtime: {
        kind: 'authored.workflow',
        guest: 'js',
      },
      source: {
        path: '/Users/dev/shared/arken/seer/node/services/character/character.service.ts',
        className: 'Service',
        methodName: 'applyCharacterInventoryPatch',
      },
      workflowPlan: {
        version: 1,
        prelude: [
          {
            kind: 'loadById',
            into: 'character',
            table: 'characters',
            index: 'byId',
            id: {
              $path: 'input.characterId',
            },
          },
        {
          kind: 'compute',
          into: 'isOwned',
            value: {
              $helper: 'isCharacterOwnedByProfile',
              args: [{ $path: 'state.character' }, { $path: 'ctx.client.profile.id' }],
            },
          },
          {
            kind: 'loadFindMany',
            into: 'inventoryRows',
            table: 'characterInventoryItems',
            modelName: 'CharacterInventoryItem',
            filter: {
              where: {
                characterId: {
                  equals: {
                    $path: 'input.characterId',
                  },
                },
              },
            },
            when: {
              $path: 'state.character',
            },
          },
          {
            kind: 'compute',
            into: 'inventoryTable',
            value: {
              $helper: 'materializeWarpCharacterInventoryTableFromRows',
              args: [
                {
                  $path: 'state.character.id',
                  $coerce: 'string',
                },
                {
                  $path: 'state.inventoryRows',
                },
              ],
            },
            when: {
              $path: 'state.character',
              },
            },
          {
            kind: 'compute',
            into: 'nextInventoryTable',
            value: {
              $helper: 'applyWarpInventorySyncOpsToTable',
              args: [{ $path: 'state.inventoryTable' }, { $path: 'input.ops' }],
            },
            when: {
              $path: 'state.inventoryTable',
            },
          },
            {
              kind: 'compute',
              into: 'inventoryPersistence',
              value: {
                $helper: 'buildWarpCharacterInventoryPersistence',
                args: [{ $path: 'state.character' }, { $path: 'state.nextInventoryTable' }],
              },
              when: {
                $path: 'state.nextInventoryTable',
              },
            },
        ],
        guest: {
          guards: [
            {
              kind: 'present',
              path: 'ctx.client.profile',
              error: {
                name: 'ARXError',
                code: 'UNAUTHORIZED',
                message: 'UNAUTHORIZED',
              },
            },
            {
              kind: 'present',
              path: 'input.characterId',
              error: {
                name: 'ARXError',
                code: 'NO_INPUT',
                message: 'NO_INPUT',
              },
            },
            {
              kind: 'truthy',
              path: 'state.character',
              error: 'Character not found',
            },
            {
              kind: 'truthy',
              path: 'state.isOwned',
              error: {
                name: 'ARXError',
                code: 'FORBIDDEN',
                message: 'FORBIDDEN',
              },
            },
            {
              kind: 'truthy',
              path: 'state.updatedCharacter',
              error: 'Character not found',
            },
          ],
          commands: [
            {
              kind: 'updateById',
              table: 'characters',
              modelName: 'Character',
              into: 'updatedCharacter',
                id: {
                  $path: 'input.characterId',
                },
                data: { $path: 'state.inventoryPersistence' },
              },
            ],
            output: {
              characterId: {
                $path: 'state.updatedCharacter.id',
                $coerce: 'string',
              },
              inventory: {
                $helper: 'ensureWarpCharacterInventoryForCharacter',
                args: [{ $path: 'state.updatedCharacter' }],
              },
            },
          },
        },
      integration: {
        featureFlags: [
          'WARPSPEED_ENABLE_ROUTE_REDUCERS',
          'WARPSPEED_ENABLE_REDUCERS',
          'WARPSPEED_ENABLE_CHARACTER_REDUCERS',
          'WARPSPEED_ENABLE_APPLY_CHARACTER_INVENTORY_PATCH_REDUCER',
        ],
      },
    },
    {
      reducerName: 'character.exchangeCharacterItem',
      runtime: {
        kind: 'authored.workflow',
        guest: 'js',
      },
      source: {
        path: '/Users/dev/shared/arken/seer/node/services/character/character.service.ts',
        className: 'Service',
        methodName: 'exchangeCharacterItem',
      },
      workflowPlan: {
        version: 1,
        prelude: [
          {
            kind: 'loadById',
            into: 'character',
            table: 'characters',
            index: 'byId',
            id: {
              $path: 'input.characterId',
            },
          },
          {
            kind: 'compute',
            into: 'isOwned',
            value: {
              $helper: 'isCharacterOwnedByProfile',
              args: [{ $path: 'state.character' }, { $path: 'ctx.client.profile.id' }],
            },
            when: {
            $path: 'state.character',
          },
        },
        {
          kind: 'loadFindMany',
          into: 'inventoryRows',
          table: 'characterInventoryItems',
          modelName: 'CharacterInventoryItem',
          filter: {
            where: {
              characterId: {
                equals: {
                  $path: 'input.characterId',
                },
              },
            },
          },
          when: {
            $path: 'state.character',
          },
        },
        {
          kind: 'compute',
          into: 'inventoryTable',
          value: {
            $helper: 'materializeWarpCharacterInventoryTableFromRows',
            args: [
              {
                $path: 'state.character.id',
                $coerce: 'string',
              },
              {
                $path: 'state.inventoryRows',
              },
            ],
          },
          when: {
            $path: 'state.character',
              },
            },
          {
            kind: 'compute',
            into: 'nextInventoryTable',
            value: {
              $helper: 'exchangeWarpInventoryItemInTable',
              args: [{ $path: 'state.inventoryTable' }, { $path: 'input' }],
            },
            when: {
              $path: 'state.inventoryTable',
            },
          },
            {
              kind: 'compute',
              into: 'inventoryPersistence',
              value: {
                $helper: 'buildWarpCharacterInventoryPersistence',
                args: [{ $path: 'state.character' }, { $path: 'state.nextInventoryTable' }],
              },
              when: {
                $path: 'state.nextInventoryTable',
              },
            },
        ],
        guest: {
          guards: [
            {
              kind: 'present',
              path: 'ctx.client.profile',
              error: {
                name: 'ARXError',
                code: 'UNAUTHORIZED',
                message: 'UNAUTHORIZED',
              },
            },
            {
              kind: 'present',
              path: 'input.characterId',
              error: {
                name: 'ARXError',
                code: 'NO_INPUT',
                message: 'NO_INPUT',
              },
            },
            {
              kind: 'truthy',
              path: 'state.character',
              error: 'Character not found',
            },
            {
              kind: 'truthy',
              path: 'state.isOwned',
              error: {
                name: 'ARXError',
                code: 'FORBIDDEN',
                message: 'FORBIDDEN',
              },
            },
            {
              kind: 'truthy',
              path: 'state.updatedCharacter',
              error: 'Character not found',
            },
          ],
          commands: [
            {
              kind: 'updateById',
              table: 'characters',
              modelName: 'Character',
              into: 'updatedCharacter',
                id: {
                  $path: 'input.characterId',
                },
                data: { $path: 'state.inventoryPersistence' },
              },
            ],
            output: {
              characterId: {
                $path: 'state.updatedCharacter.id',
                $coerce: 'string',
              },
              inventory: {
                $helper: 'ensureWarpCharacterInventoryForCharacter',
                args: [{ $path: 'state.updatedCharacter' }],
              },
            },
          },
        },
      integration: {
        featureFlags: [
          'WARPSPEED_ENABLE_ROUTE_REDUCERS',
          'WARPSPEED_ENABLE_REDUCERS',
          'WARPSPEED_ENABLE_CHARACTER_REDUCERS',
          'WARPSPEED_ENABLE_EXCHANGE_CHARACTER_ITEM_REDUCER',
        ],
      },
    },
    {
      reducerName: 'character.updateCharacterAbility',
      runtime: {
        kind: 'authored.workflow',
        guest: 'js',
      },
      source: {
        path: '/Users/dev/shared/arken/seer/node/services/character/character.service.ts',
        className: 'Service',
        methodName: 'updateCharacterAbility',
      },
      workflowPlan: {
        version: 1,
        prelude: [
          {
            kind: 'compute',
            into: 'filter',
            value: {
              $helper: 'getFilter',
              args: [{ $path: 'input' }],
            },
          },
        ],
        guest: {
          guards: [
            {
              kind: 'present',
              path: 'input',
              error: {
                name: 'ARXError',
                code: 'NO_INPUT',
                message: 'NO_INPUT',
              },
            },
            {
              kind: 'truthy',
              path: 'state.updatedCharacterAbility',
              error: 'CharacterAbility update failed',
            },
          ],
          commands: [
            {
              kind: 'updateById',
              table: 'characterAbilities',
              modelName: 'CharacterAbility',
              into: 'updatedCharacterAbility',
              id: {
                $path: 'state.filter.id',
              },
              data: {
                $path: 'input.data',
              },
            },
          ],
          output: {
            $path: 'state.updatedCharacterAbility',
          },
        },
      },
      integration: {
        featureFlags: [
          'WARPSPEED_ENABLE_ROUTE_REDUCERS',
          'WARPSPEED_ENABLE_REDUCERS',
          'WARPSPEED_ENABLE_CHARACTER_REDUCERS',
          'WARPSPEED_ENABLE_UPDATE_CHARACTER_ABILITY_REDUCER',
        ],
      },
    },
    {
      reducerName: 'character.updateCharacterAttribute',
      runtime: {
        kind: 'authored.workflow',
        guest: 'js',
      },
      source: {
        path: '/Users/dev/shared/arken/seer/node/services/character/character.service.ts',
        className: 'Service',
        methodName: 'updateCharacterAttribute',
      },
      workflowPlan: {
        version: 1,
        prelude: [
          {
            kind: 'compute',
            into: 'filter',
            value: {
              $helper: 'getFilter',
              args: [{ $path: 'input' }],
            },
          },
        ],
        guest: {
          guards: [
            {
              kind: 'present',
              path: 'input',
              error: {
                name: 'ARXError',
                code: 'NO_INPUT',
                message: 'NO_INPUT',
              },
            },
            {
              kind: 'truthy',
              path: 'state.updatedCharacterAttribute',
              error: 'CharacterAttribute update failed',
            },
          ],
          commands: [
            {
              kind: 'updateById',
              table: 'characterAttributes',
              modelName: 'CharacterAttribute',
              into: 'updatedCharacterAttribute',
              id: {
                $path: 'state.filter.id',
              },
              data: {
                $path: 'input.data',
              },
            },
          ],
          output: {
            $path: 'state.updatedCharacterAttribute',
          },
        },
      },
      integration: {
        featureFlags: [
          'WARPSPEED_ENABLE_ROUTE_REDUCERS',
          'WARPSPEED_ENABLE_REDUCERS',
          'WARPSPEED_ENABLE_CHARACTER_REDUCERS',
          'WARPSPEED_ENABLE_UPDATE_CHARACTER_ATTRIBUTE_REDUCER',
        ],
      },
    },
  ],
};

const buildCharacterTaxonomyReducerConfig = ({
  modelName,
  tableName,
  getMethodName,
  getManyMethodName,
  createMethodName,
  updateMethodName,
  getFeatureFlag,
  getManyFeatureFlag,
  createFeatureFlag,
  updateFeatureFlag,
  viewFlag,
  reducerFlag,
}) => {
  const getStateKey = `${getMethodName.slice('get'.length, 'get'.length + 1).toLowerCase()}${getMethodName.slice(
    'get'.length + 1
  )}`;
  const getManyStateKey =
    typeof getManyMethodName === 'string' && getManyMethodName.length > 0
      ? `${getManyMethodName.slice('get'.length, 'get'.length + 1).toLowerCase()}${getManyMethodName.slice(
          'get'.length + 1
        )}`
      : null;
  const createStateKey =
    typeof createMethodName === 'string' && createMethodName.length > 0
      ? `${createMethodName.slice('create'.length, 'create'.length + 1).toLowerCase()}${createMethodName.slice(
          'create'.length + 1
        )}`
      : null;
  const updateStateKey = `updated${updateMethodName.slice('update'.length)}`;

  return [
    {
      reducerName: `character.${getMethodName}`,
      runtime: {
        kind: 'authored.workflow',
        guest: 'js',
      },
      source: {
        path: '/Users/dev/shared/arken/seer/node/services/character/character.service.ts',
        className: 'Service',
        methodName: getMethodName,
      },
      workflowPlan: {
        version: 1,
        prelude: [
          {
            kind: 'compute',
            into: 'filter',
            value: {
              $helper: 'getFilter',
              args: [{ $path: 'input' }],
            },
          },
          {
            kind: 'loadById',
            into: getStateKey,
            table: tableName,
            index: 'byId',
            modelName,
            id: {
              $path: 'state.filter.id',
            },
            when: {
              $path: 'state.filter',
            },
          },
        ],
        guest: {
          guards: [
            {
              kind: 'present',
              path: 'input',
              error: {
                name: 'ARXError',
                code: 'NO_INPUT',
                message: 'NO_INPUT',
              },
            },
            {
              kind: 'truthy',
              path: `state.${getStateKey}`,
              error: `${modelName} not found`,
            },
          ],
          commands: [],
          output: {
            $path: `state.${getStateKey}`,
          },
        },
      },
      integration: {
        featureFlags: [
          'WARPSPEED_ENABLE_ROUTE_REDUCERS',
          'WARPSPEED_ENABLE_REDUCERS',
          viewFlag,
          getFeatureFlag,
        ],
      },
    },
    {
      reducerName: `character.${updateMethodName}`,
      runtime: {
        kind: 'authored.workflow',
        guest: 'js',
      },
      source: {
        path: '/Users/dev/shared/arken/seer/node/services/character/character.service.ts',
        className: 'Service',
        methodName: updateMethodName,
      },
      workflowPlan: {
        version: 1,
        prelude: [
          {
            kind: 'compute',
            into: 'filter',
            value: {
              $helper: 'getFilter',
              args: [{ $path: 'input' }],
            },
          },
        ],
        guest: {
          guards: [
            {
              kind: 'present',
              path: 'input',
              error: {
                name: 'ARXError',
                code: 'NO_INPUT',
                message: 'NO_INPUT',
              },
            },
            {
              kind: 'truthy',
              path: `state.${updateStateKey}`,
              error: `${modelName} update failed`,
            },
          ],
          commands: [
            {
              kind: 'updateById',
              table: tableName,
              modelName,
              into: updateStateKey,
              id: {
                $path: 'state.filter.id',
              },
              data: {
                $path: 'input.data',
              },
            },
          ],
          output: {
            $path: `state.${updateStateKey}`,
          },
        },
      },
      integration: {
        featureFlags: [
          'WARPSPEED_ENABLE_ROUTE_REDUCERS',
          'WARPSPEED_ENABLE_REDUCERS',
          reducerFlag,
          updateFeatureFlag,
        ],
      },
    },
    ...(getManyMethodName
      ? [
          {
            reducerName: `character.${getManyMethodName}`,
            runtime: {
              kind: 'authored.workflow',
              guest: 'js',
            },
            source: {
              path: '/Users/dev/shared/arken/seer/node/services/character/character.service.ts',
              className: 'Service',
              methodName: getManyMethodName,
            },
            workflowPlan: {
              version: 1,
              prelude: [
                {
                  kind: 'compute',
                  into: 'filter',
                  value: {
                    $helper: 'getFilter',
                    args: [{ $path: 'input' }],
                  },
                },
                {
                  kind: 'loadFindMany',
                  into: getManyStateKey,
                  table: tableName,
                  modelName,
                  filter: {
                    $path: 'state.filter',
                  },
                  when: {
                    $path: 'state.filter',
                  },
                },
              ],
              guest: {
                guards: [
                  {
                    kind: 'present',
                    path: 'input',
                    error: {
                      name: 'ARXError',
                      code: 'NO_INPUT',
                      message: 'NO_INPUT',
                    },
                  },
                ],
                commands: [],
                output: {
                  $path: `state.${getManyStateKey}`,
                },
              },
            },
            integration: {
              featureFlags: [
                'WARPSPEED_ENABLE_ROUTE_REDUCERS',
                'WARPSPEED_ENABLE_REDUCERS',
                viewFlag,
                getManyFeatureFlag,
              ],
            },
          },
        ]
      : []),
    ...(createMethodName
      ? [
          {
            reducerName: `character.${createMethodName}`,
            runtime: {
              kind: 'authored.workflow',
              guest: 'js',
            },
            source: {
              path: '/Users/dev/shared/arken/seer/node/services/character/character.service.ts',
              className: 'Service',
              methodName: createMethodName,
            },
            workflowPlan: {
              version: 1,
              prelude: [],
              guest: {
                guards: [
                  {
                    kind: 'present',
                    path: 'input',
                    error: {
                      name: 'ARXError',
                      code: 'NO_INPUT',
                      message: 'NO_INPUT',
                    },
                  },
                ],
                commands: [
                  {
                    kind: 'create',
                    table: tableName,
                    modelName,
                    into: createStateKey,
                    data: {
                      $path: 'input',
                    },
                  },
                ],
                output: {
                  $path: `state.${createStateKey}`,
                },
              },
            },
            integration: {
              featureFlags: [
                'WARPSPEED_ENABLE_ROUTE_REDUCERS',
                'WARPSPEED_ENABLE_REDUCERS',
                reducerFlag,
                createFeatureFlag,
              ],
            },
          },
        ]
      : []),
  ];
};

manifest.tables.push(
  ...characterTaxonomySpecs.map(({ tableName, accessName, modelName }) => ({
    tableName,
    accessName,
    model: modelName,
    primaryKey: 'id',
    externalKey: null,
    indexes: {
      byId: {
        kind: 'byId',
      },
    },
    operations: {
      findManyByFilter: {
        filter: 'getFilter(input)',
      },
      create: {
        data: 'input',
      },
      updateById: {
        id: 'input.where.id.equals',
        data: 'input.data',
      },
    },
  }))
);

manifest.reducers.push(
  ...characterTaxonomySpecs.flatMap((spec) => buildCharacterTaxonomyReducerConfig(spec))
);

module.exports = {
  async loadWarpSpeedArtifacts(baseDir = __dirname) {
    const tableConfigs = Object.fromEntries(manifest.tables.map((table) => [table.tableName, table]));
    const reducerConfigs = Object.fromEntries(manifest.reducers.map((reducer) => [reducer.reducerName, reducer]));
    const reducers = require(path.join(baseDir, 'reducers.cjs'));

    return {
      manifest,
      runtimeInfo: {
        reducerWorkflowGuest: 'js',
      },
      tableNames: Object.keys(tableConfigs),
      reducerNames: Object.keys(reducerConfigs),
      getTableConfig(tableName) {
        return tableConfigs[tableName] ?? null;
      },
      getReducerConfig(reducerName) {
        return reducerConfigs[reducerName] ?? null;
      },
      isReducerEnabled(reducerName, env = process.env) {
        const reducer = reducerConfigs[reducerName];
        if (!reducer) {
          return false;
        }

        return reducer.integration.featureFlags.some((name) => env && env[name] === 'true');
      },
      async executeReducer({ reducerName, input, ctx }) {
        return reducers.executeReducer({ reducerName, input, ctx });
      },
    };
  },
};
