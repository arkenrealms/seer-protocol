// arken/packages/node/modules/interface/interface.schema.ts
//
import { z, ObjectId, Entity } from '../schema';

// Patch ops for interface composition
const InterfacePatch = z.object({
  op: z.enum(['merge', 'replace', 'remove', 'push', 'unshift', 'splice']).default('merge'),
  key: z.string().min(1), // target node key (or special key like "root")
  path: z.string().optional(), // optional deep path inside that node, ex: "props.omit"
  value: z.unknown().optional(), // payload for merge/replace/push/etc
});

export const Interface = Entity.merge(
  z.object({
    ratingId: ObjectId.optional(),
    groupId: ObjectId.optional(),
    submissions: z.array(ObjectId).optional(),

    // ✅ NEW: composition / inheritance
    inherits: z.array(z.string()).default([]),

    // ✅ NEW: variables available to formula scope + patch engine
    variables: z.record(z.unknown()).default({}),

    // ✅ NEW: patch list applied on top of inherited/base nodes
    patches: z.array(InterfacePatch).default([]),

    // existing
    nodes: z.any(), // you can later tighten this to z.array(AnyNodeSchema)
    version: z.number().optional(),
    status: z.enum(['Paused', 'Pending', 'Active', 'Archived', 'Published', 'Draft']).default('Active'),
  })
);

export const InterfaceGroup = Entity.merge(
  z.object({
    roles: z.array(ObjectId).optional(),
  })
);

export const InterfaceComponent = Entity.merge(
  z.object({
    value: z.unknown().optional(),
    data: z.record(z.unknown()).optional(),
    type: z.string().optional(),
    hasAttachment: z.boolean().optional(),
    hasValidation: z.boolean().optional(),
    isDisabled: z.boolean().optional(),
    isEditable: z.boolean().optional(),
    isRequired: z.boolean().optional(),
  })
);

export const InterfaceSubmission = Entity.merge(
  z.object({
    interfaceId: ObjectId,
    interface: ObjectId.optional(),
  })
);
