// module/chat.types.ts

import { z } from 'zod';
import * as schema from './chat.schema';
import { Document, Model } from '../util/mongo';

export type * from './chat.router';
export type { RouterContext } from '../types';

export type ChatGroup = z.infer<typeof schema.ChatGroup>;
export type ChatGroupDocument = ChatGroup & Document;

export type ChatMessage = z.infer<typeof schema.ChatMessage>;
export type ChatMessageDocument = ChatMessage & Document;

export type Mappings = {
  ChatGroup: Model<ChatGroupDocument>;
  ChatMessage: Model<ChatMessageDocument>;
};
