import * as mongo from '../util/mongo';
import type * as Types from './chat.types';

// ChatGroup
export const ChatGroup = mongo.createModel<Types.ChatGroupDocument>('ChatGroup', {
  name: { type: String, required: true, maxlength: 100 },
  type: { type: String, required: true, enum: ['group', 'private'] },
  members: [{ type: mongo.Schema.Types.ObjectId, ref: 'Profile' }],
  externalId: { type: String },
  externalPlatform: { type: String, enum: ['Telegram', 'Discord'] },
});

// ChatMessage
export const ChatMessage = mongo.createModel<Types.ChatMessageDocument>(
  'ChatMessage',
  {
    groupId: { type: mongo.Schema.Types.ObjectId, ref: 'ChatGroup', required: true },
    profileId: { type: mongo.Schema.Types.ObjectId, ref: 'Profile', required: true },
    content: { type: String },
    mediaUrl: { type: String },
    replyToId: { type: mongo.Schema.Types.ObjectId, ref: 'ChatMessage' },
    reactions: [
      {
        profileId: { type: mongo.Schema.Types.ObjectId, ref: 'Profile' },
        reaction: { type: String },
      },
    ],
    externalId: { type: String },
    externalPlatform: { type: String, enum: ['Telegram', 'Discord'] },
    isSpam: { type: Boolean, default: false },
    tags: { type: mongo.Schema.Types.Mixed }, // Correctly define as array of Mixed
    summary: { type: String },
    entities: { type: mongo.Schema.Types.Mixed }, // Correctly define as array of Mixed
    type: {
      type: String,
      default: 'text',
      enum: ['text', 'image', 'video', 'audio', 'file', 'system'],
    },
  },
  {
    indexes: [{ groupId: 1, createdDate: 1 }, { profileId: 1 }, { status: 1 }, { replyToId: 1 }, { type: 1 }],
  }
);
