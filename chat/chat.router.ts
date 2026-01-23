// module/chat.router.ts

import { z as zod } from 'zod';
import { initTRPC, inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { customErrorFormatter, hasRole } from '../util/rpc';
import type { RouterContext } from '../types';
import { ChatGroup, ChatMessage } from './chat.schema';

export const z = zod;
export const t = initTRPC.context<RouterContext>().create();
export const router = t.router;
export const procedure = t.procedure;

export const createRouter = () =>
  router({
    getChatGroup: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ chatGroupId: z.string() }))
      .query(({ input, ctx }) => (ctx.app.service.Chat.getChatGroup as any)(input, ctx)),

    getChatGroups: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ chatGroupId: z.string() }))
      .query(({ input, ctx }) => (ctx.app.service.Chat.getChatGroup as any)(input, ctx)),

    createChatGroup: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(ChatGroup)
      .mutation(({ input, ctx }) => (ctx.app.service.Chat.createChatGroup as any)(input, ctx)),

    updateChatGroup: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ chatGroupId: z.string(), data: ChatGroup.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Chat.updateChatGroup as any)(input, ctx)),

    getChatMessage: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ chatMessageId: z.string() }))
      .query(({ input, ctx }) => (ctx.app.service.Chat.getChatMessage as any)(input, ctx)),

    getChatMessages: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ chatMessageId: z.string() }))
      .query(({ input, ctx }) => (ctx.app.service.Chat.getChatMessage as any)(input, ctx)),

    createChatMessage: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(ChatMessage)
      .mutation(({ input, ctx }) => (ctx.app.service.Chat.createChatMessage as any)(input, ctx)),

    updateChatMessage: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ chatMessageId: z.string(), data: ChatMessage.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Chat.updateChatMessage as any)(input, ctx)),
  });

export type Router = ReturnType<typeof createRouter>;
export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
