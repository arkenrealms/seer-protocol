import { z, ObjectId, Entity } from '../schema';

export const ChatGroup = Entity.merge(
  z.object({
    name: z
      .string()
      .max(100)
      .min(1),
    type: z.enum(['group', 'private']),
    members: z.array(ObjectId),
    externalId: z.string().optional(),
    externalPlatform: z.enum(['Telegram', 'Discord']).optional(),
  })
);

export const ChatMessage = Entity.merge(
  z.object({
    groupId: ObjectId,
    profileId: ObjectId,
    content: z.string().optional(),
    mediaUrl: z.string().optional(),
    replyToId: ObjectId.optional(),
    reactions: z
      .array(
        z.object({
          profileId: ObjectId,
          reaction: z.string(),
        })
      )
      .optional(),
    externalId: z.string().optional(),
    externalPlatform: z.enum(['Telegram', 'Discord']).optional(),
    isSpam: z.boolean().default(false),
    tags: z.array(z.unknown()).default([]),
    summary: z.string().optional(),
    entities: z.array(z.unknown()).default([]),
    type: z.enum(['text', 'image', 'video', 'audio', 'file', 'system']).default('text'),
  })
);
