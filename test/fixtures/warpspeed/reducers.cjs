const hostReducers = {};

const workflowReducers = {
  'core.getApplication': {
    reducerName: 'core.getApplication',
    workflow: {
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
  },
  'core.getAccount': {
    reducerName: 'core.getAccount',
    workflow: {
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
  },
  'core.updateApplication': {
    reducerName: 'core.updateApplication',
    workflow: {
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
  },
  'core.updateAccount': {
    reducerName: 'core.updateAccount',
    workflow: {
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
  },
  'core.setConversationMessageStar': {
    reducerName: 'core.setConversationMessageStar',
      workflow: {
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
  },
  'character.getCharacterInventory': {
    reducerName: 'character.getCharacterInventory',
    workflow: {
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
          inventory: { $path: 'state.inventory' },
        },
      },
    },
  },
  'character.getCharacterInventoryReceipt': {
    reducerName: 'character.getCharacterInventoryReceipt',
    workflow: {
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
          $path: 'state.inventoryReceipt',
        },
      },
    },
  },
  'character.getCharacterInventoryAuditExport': {
    reducerName: 'character.getCharacterInventoryAuditExport',
    workflow: {
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
          $helper: 'buildWarpCharacterInventoryAuditExport',
          args: [{ $path: 'state.inventoryTable' }, { $path: 'state.inventoryReceipt' }],
        },
      },
    },
  },
  'character.syncCharacterInventory': {
    reducerName: 'character.syncCharacterInventory',
    workflow: {
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
  },
  'character.getCharacterAbility': {
    reducerName: 'character.getCharacterAbility',
    workflow: {
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
  },
  'character.getCharacterAttribute': {
    reducerName: 'character.getCharacterAttribute',
    workflow: {
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
  },
  'character.applyCharacterInventoryPatch': {
    reducerName: 'character.applyCharacterInventoryPatch',
    workflow: {
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
  },
  'character.exchangeCharacterItem': {
    reducerName: 'character.exchangeCharacterItem',
    workflow: {
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
  },
  'character.updateCharacterAbility': {
    reducerName: 'character.updateCharacterAbility',
    workflow: {
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
  },
  'character.updateCharacterAttribute': {
    reducerName: 'character.updateCharacterAttribute',
    workflow: {
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
  },
};

const characterTaxonomySpecs = [
  {
    modelName: 'CharacterClass',
    table: 'characterClasses',
    getMethodName: 'getCharacterClass',
    getStateKey: 'characterClass',
    updateMethodName: 'updateCharacterClass',
    updateStateKey: 'updatedCharacterClass',
  },
  {
    modelName: 'CharacterFaction',
    table: 'characterFactions',
    getMethodName: 'getCharacterFaction',
    getStateKey: 'characterFaction',
    getManyMethodName: 'getCharacterFactions',
    getManyStateKey: 'characterFactions',
    createMethodName: 'createCharacterFaction',
    createStateKey: 'characterFaction',
    updateMethodName: 'updateCharacterFaction',
    updateStateKey: 'updatedCharacterFaction',
  },
  {
    modelName: 'CharacterGender',
    table: 'characterGenders',
    getMethodName: 'getCharacterGender',
    getStateKey: 'characterGender',
    updateMethodName: 'updateCharacterGender',
    updateStateKey: 'updatedCharacterGender',
  },
  {
    modelName: 'CharacterNameChoice',
    table: 'characterNameChoices',
    getMethodName: 'getCharacterNameChoice',
    getStateKey: 'characterNameChoice',
    updateMethodName: 'updateCharacterNameChoice',
    updateStateKey: 'updatedCharacterNameChoice',
  },
  {
    modelName: 'CharacterPersonality',
    table: 'characterPersonalities',
    getMethodName: 'getCharacterPersonality',
    getStateKey: 'characterPersonality',
    updateMethodName: 'updateCharacterPersonality',
    updateStateKey: 'updatedCharacterPersonality',
  },
  {
    modelName: 'CharacterRace',
    table: 'characterRaces',
    getMethodName: 'getCharacterRace',
    getStateKey: 'characterRace',
    updateMethodName: 'updateCharacterRace',
    updateStateKey: 'updatedCharacterRace',
  },
  {
    modelName: 'CharacterTitle',
    table: 'characterTitles',
    getMethodName: 'getCharacterTitle',
    getStateKey: 'characterTitle',
    updateMethodName: 'updateCharacterTitle',
    updateStateKey: 'updatedCharacterTitle',
  },
  {
    modelName: 'CharacterType',
    table: 'characterTypes',
    getMethodName: 'getCharacterType',
    getStateKey: 'characterType',
    updateMethodName: 'updateCharacterType',
    updateStateKey: 'updatedCharacterType',
  },
];

const buildCharacterTaxonomyWorkflowReducer = ({
  modelName,
  table,
  getMethodName,
  getStateKey,
  getManyMethodName,
  getManyStateKey,
  createMethodName,
  createStateKey,
  updateMethodName,
  updateStateKey,
}) => ({
  [`character.${getMethodName}`]: {
    reducerName: `character.${getMethodName}`,
    workflow: {
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
          table,
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
  },
  [`character.${updateMethodName}`]: {
    reducerName: `character.${updateMethodName}`,
    workflow: {
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
            table,
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
  },
  ...(getManyMethodName
    ? {
        [`character.${getManyMethodName}`]: {
          reducerName: `character.${getManyMethodName}`,
          workflow: {
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
                table,
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
        },
      }
    : {}),
  ...(createMethodName
    ? {
        [`character.${createMethodName}`]: {
          reducerName: `character.${createMethodName}`,
          workflow: {
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
                  table,
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
        },
      }
    : {}),
});

Object.assign(
  workflowReducers,
  ...characterTaxonomySpecs.map((spec) => buildCharacterTaxonomyWorkflowReducer(spec))
);

const isPlainObject = (value) =>
  !!value &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);

const resolvePath = (root, path) => {
  const segments = String(path || '').split('.').filter(Boolean);
  let current = root;

  for (const segment of segments) {
    if (current == null) {
      return undefined;
    }

    current = current[segment];
  }

  return current;
};

const coerceValue = (value, coerce) => {
  if (coerce === 'boolean') {
    return !!value;
  }

  if (coerce === 'string') {
    return value == null ? '' : String(value);
  }

  return value;
};

const createWorkflowThrownError = (definition) => {
  if (typeof definition === 'string') {
    return new Error(definition);
  }

  const message = definition?.message || definition?.code || 'Workflow execution failed';
  const error = new Error(message);
  if (typeof definition?.name === 'string') {
    error.name = definition.name;
  }
  if (typeof definition?.code === 'string') {
    error.code = definition.code;
  }
  return error;
};

const evaluateWorkflowValue = (template, scope) => {
  if (Array.isArray(template)) {
    return template.map((entry) => evaluateWorkflowValue(entry, scope));
  }

  if (isPlainObject(template) && typeof template.$path === 'string') {
    return coerceValue(resolvePath(scope, template.$path), template.$coerce);
  }

  if (isPlainObject(template) && typeof template.$helper === 'string') {
    const helper = scope?.ctx?.helpers?.[template.$helper];
    if (typeof helper !== 'function') {
      throw new Error(`Workflow helper ${template.$helper} is unavailable`);
    }

    const args = Array.isArray(template.args)
      ? template.args.map((entry) => evaluateWorkflowValue(entry, scope))
      : [];
    return helper(...args);
  }

  if (isPlainObject(template)) {
    return Object.fromEntries(
      Object.entries(template).map(([key, value]) => [key, evaluateWorkflowValue(value, scope)])
    );
  }

  return template;
};

const runWorkflowGuards = ({ guards, scope, preludeOnly = false }) => {
  for (const guard of guards || []) {
    if (preludeOnly && typeof guard?.path === 'string' && guard.path.startsWith('state.')) {
      continue;
    }

    const value = resolvePath(scope, guard.path);
    const satisfied =
      guard.kind === 'present'
        ? value != null && (typeof value !== 'string' || value.length > 0)
        : !!value;

    if (!satisfied) {
      throw createWorkflowThrownError(guard.error);
    }
  }
};

const collectCommandIntoBindings = (workflow) =>
  new Set(
    (workflow?.guest?.commands || [])
      .map((command) => (typeof command?.into === 'string' ? command.into : null))
      .filter(Boolean)
  );

const partitionWorkflowGuards = (workflow) => {
  const commandIntoBindings = collectCommandIntoBindings(workflow);
  const preCommand = [];
  const postCommand = [];

  for (const guard of workflow?.guest?.guards || []) {
    const pathSegments = typeof guard?.path === 'string' ? guard.path.split('.').filter(Boolean) : [];
    if (pathSegments[0] === 'state' && commandIntoBindings.has(pathSegments[1])) {
      postCommand.push(guard);
      continue;
    }

    preCommand.push(guard);
  }

  return { preCommand, postCommand };
};

const executeWorkflowPrelude = async ({ workflow, input, ctx }) => {
  const state = {};
  const buildScope = () => ({ input, ctx, state });

  for (const step of workflow?.prelude || []) {
    if (step.when && !evaluateWorkflowValue(step.when, buildScope())) {
      state[step.into] = null;
      continue;
    }

    if (step.kind === 'loadById') {
      if (step.table && step.index) {
        const table = ctx?.db?.[step.table];
        if (!table) {
          throw new Error(`Workflow table ${step.table} is unavailable`);
        }

        state[step.into] = (await table[step.index].get(evaluateWorkflowValue(step.id, buildScope()))) ?? null;
        continue;
      }

      const modelAccessor = step.modelName && ctx?.db?.model ? ctx.db.model(step.modelName) : null;
      if (!modelAccessor || typeof modelAccessor.findById !== 'function') {
        throw new Error(`Workflow model ${String(step.modelName)} cannot load by id`);
      }

      state[step.into] =
        (await modelAccessor.findById(
          evaluateWorkflowValue(step.id, buildScope()),
          step.select ? evaluateWorkflowValue(step.select, buildScope()) : undefined
        )) ?? null;
      continue;
    }

    if (step.kind === 'loadFindOne') {
      if (step.table && step.index) {
        const table = ctx?.db?.[step.table];
        if (!table) {
          throw new Error(`Workflow table ${step.table} is unavailable`);
        }

        state[step.into] = (await table[step.index].findOne(evaluateWorkflowValue(step.args, buildScope()))) ?? null;
        continue;
      }

      const modelAccessor = step.modelName && ctx?.db?.model ? ctx.db.model(step.modelName) : null;
      if (!modelAccessor || typeof modelAccessor.findOne !== 'function') {
        throw new Error(`Workflow model ${String(step.modelName)} cannot find one`);
      }

      state[step.into] =
        (await modelAccessor.findOne(
          step.filter ? evaluateWorkflowValue(step.filter, buildScope()) : {},
          step.select ? evaluateWorkflowValue(step.select, buildScope()) : undefined
        )) ?? null;
      continue;
    }

    if (step.kind === 'loadFindMany') {
      if (step.table) {
        const table = ctx?.db?.[step.table];
        if (!table || typeof table.findManyByFilter !== 'function') {
          throw new Error(`Workflow table ${step.table} cannot find many`);
        }

        state[step.into] =
          (await table.findManyByFilter(step.filter ? evaluateWorkflowValue(step.filter, buildScope()) : {})) ?? [];
        continue;
      }

      const modelAccessor = step.modelName && ctx?.db?.model ? ctx.db.model(step.modelName) : null;
      if (!modelAccessor || typeof modelAccessor.find !== 'function') {
        throw new Error(`Workflow model ${String(step.modelName)} cannot find many`);
      }

      state[step.into] =
        (await modelAccessor.find(
          step.filter ? evaluateWorkflowValue(step.filter, buildScope()) : {},
          step.select ? evaluateWorkflowValue(step.select, buildScope()) : undefined
        )) ?? [];
      continue;
    }

    if (step.kind === 'compute') {
      state[step.into] = evaluateWorkflowValue(step.value, buildScope());
      continue;
    }

    throw new Error(`Unsupported workflow prelude step ${String(step.kind)}`);
  }

  return state;
};

const executeWorkflowGuestPlan = ({ workflow, input, ctx, state }) => {
  const scope = { input, ctx, state };
  runWorkflowGuards({ guards: partitionWorkflowGuards(workflow).preCommand, scope });

  return {
    commands: (workflow?.guest?.commands || []).map((command) => ({
      kind: command.kind,
      table: command.table,
      modelName: command.modelName,
      into: command.into,
      id: evaluateWorkflowValue(command.id, scope),
      data: evaluateWorkflowValue(command.data, scope),
    })),
  };
};

const applyWorkflowCommands = async ({ commands, ctx, state }) => {
  for (const command of commands || []) {
    if (command.kind === 'updateById') {
      if (command.table) {
        const result = await ctx.db[command.table].updateById(command.id, command.data || {});
        if (command.into && state) {
          state[command.into] = result ?? null;
        }
        continue;
      }

      const modelAccessor = command.modelName && ctx?.db?.model ? ctx.db.model(command.modelName) : null;
      if (!modelAccessor || typeof modelAccessor.findByIdAndUpdate !== 'function') {
        throw new Error(`Workflow model ${String(command.modelName)} cannot update by id`);
      }

      const result = await modelAccessor.findByIdAndUpdate(command.id, command.data || {});
      if (command.into && state) {
        state[command.into] = result ?? null;
      }
      continue;
    }

    if (command.kind === 'create') {
      if (command.table) {
        const result = await ctx.db[command.table].create(command.data || {});
        if (command.into && state) {
          state[command.into] = result ?? null;
        }
        continue;
      }

      const modelAccessor = command.modelName && ctx?.db?.model ? ctx.db.model(command.modelName) : null;
      if (!modelAccessor || typeof modelAccessor.create !== 'function') {
        throw new Error(`Workflow model ${String(command.modelName)} cannot create`);
      }

      const result = await modelAccessor.create(command.data || {});
      if (command.into && state) {
        state[command.into] = result ?? null;
      }
      continue;
    }

    throw new Error(`Unsupported workflow command ${String(command.kind)}`);
  }
};

module.exports = {
  reducerNames: [...Object.keys(hostReducers), ...Object.keys(workflowReducers)],
  getReducer(reducerName) {
    return hostReducers[reducerName] ?? null;
  },
  getWorkflowReducerDefinition(reducerName) {
    return workflowReducers[reducerName] ?? null;
  },
  async executeReducer({ reducerName, input, ctx }) {
    const hostReducer = hostReducers[reducerName];
    if (hostReducer) {
      return hostReducer(ctx, input);
    }

    const workflowReducer = workflowReducers[reducerName];
    if (!workflowReducer) {
      throw new Error(`Compiled reducer not found for ${reducerName}`);
    }

    runWorkflowGuards({
      guards: workflowReducer.workflow?.guest?.guards,
      scope: { input, ctx, state: {} },
      preludeOnly: true,
    });
    const state = await executeWorkflowPrelude({
      workflow: workflowReducer.workflow,
      input,
      ctx,
    });
    const guestPayload = {
      input,
      ctx: {
        client: ctx?.client || {},
      },
      state,
    };
    const guardPhases = partitionWorkflowGuards(workflowReducer.workflow);
    const { commands } = executeWorkflowGuestPlan({
      workflow: {
        ...workflowReducer.workflow,
        guest: {
          ...(workflowReducer.workflow?.guest || {}),
          guards: guardPhases.preCommand,
        },
      },
      input: guestPayload.input,
      ctx: guestPayload.ctx,
      state: guestPayload.state,
    });
    await applyWorkflowCommands({ commands, ctx, state });
    runWorkflowGuards({
      guards: guardPhases.postCommand,
      scope: { input, ctx, state },
    });
    return evaluateWorkflowValue(workflowReducer.workflow?.guest?.output, { input, ctx, state });
  },
};
