// arken/packages/node/modules/interface/interface.models.ts
//
import * as mongo from '../util/mongo';
import type * as Types from './interface.types';

export const Interface = mongo.createModel<Types.InterfaceDocument>('Interface', {
  key: { type: String, required: true },
  submissions: [{ type: mongo.Schema.Types.ObjectId, ref: 'InterfaceSubmission' }],
  groupId: { type: mongo.Schema.Types.ObjectId, ref: 'InterfaceGroup', required: true },

  status: {
    type: String,
    default: 'Active',
    enum: ['Paused', 'Pending', 'Active', 'Archived', 'Published', 'Draft'],
  },

  // ✅ NEW (typed-wrapper-safe): store as Mixed, validate via Zod on IO
  inherits: { type: mongo.Schema.Types.Mixed, default: [] }, // string[]
  variables: { type: mongo.Schema.Types.Mixed, default: {} }, // record
  patches: { type: mongo.Schema.Types.Mixed, default: [] }, // patch[]

  nodes: { type: mongo.Schema.Types.Mixed, default: [] },
  version: { type: Number },
});

export const InterfaceGroup = mongo.createModel<Types.InterfaceGroupDocument>('InterfaceGroup', {});

export const InterfaceComponent = mongo.createModel<Types.InterfaceComponentDocument>('InterfaceComponent', {
  value: { type: Object, default: {} },
  type: { type: String },
  hasAttachment: { type: Boolean },
  hasValidation: { type: Boolean },
  isDisabled: { type: Boolean },
  isEditable: { type: Boolean },
  isRequired: { type: Boolean },
});

export const InterfaceSubmission = mongo.createModel<Types.InterfaceSubmissionDocument>('InterfaceSubmission', {
  interfaceId: { type: mongo.Schema.Types.ObjectId, ref: 'Interface' } as any,
});
