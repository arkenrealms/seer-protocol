import { z as zod } from 'zod';
import { initTRPC, inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { customErrorFormatter, hasRole } from '../util/rpc';
import type { RouterContext } from '../types';
import { Video, VideoParticipant, VideoDialogue, VideoTranscript, VideoScene } from './video.schema';
import { Query } from '../schema'; // Assuming the Query schema is located in '../schema'

export const z = zod;
export const t = initTRPC.context<RouterContext>().create();
export const router = t.router;
export const procedure = t.procedure;

export const createRouter = () =>
  router({
    // Video endpoints
    getVideo: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .query(({ input, ctx }) => (ctx.app.service.Video.getVideo as any)(input, ctx)),

    createVideo: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ data: Video.omit({ id: true }) }))
      .mutation(({ input, ctx }) => (ctx.app.service.Video.createVideo as any)(input, ctx)),

    updateVideo: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query, data: Video.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Video.updateVideo as any)(input, ctx)),

    deleteVideo: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .mutation(({ input, ctx }) => (ctx.app.service.Video.deleteVideo as any)(input, ctx)),

    // Video Participant endpoints
    getVideoParticipant: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .query(({ input, ctx }) => (ctx.app.service.Video.getVideoParticipant as any)(input, ctx)),

    createVideoParticipant: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ data: VideoParticipant.omit({ id: true }) }))
      .mutation(({ input, ctx }) => (ctx.app.service.Video.createVideoParticipant as any)(input, ctx)),

    updateVideoParticipant: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query, data: VideoParticipant.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Video.updateVideoParticipant as any)(input, ctx)),

    deleteVideoParticipant: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .mutation(({ input, ctx }) => (ctx.app.service.Video.deleteVideoParticipant as any)(input, ctx)),

    // Video Dialogue endpoints
    getVideoDialogue: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .query(({ input, ctx }) => (ctx.app.service.Video.getVideoDialogue as any)(input, ctx)),

    createVideoDialogue: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ data: VideoDialogue.omit({ id: true }) }))
      .mutation(({ input, ctx }) => (ctx.app.service.Video.createVideoDialogue as any)(input, ctx)),

    updateVideoDialogue: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query, data: VideoDialogue.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Video.updateVideoDialogue as any)(input, ctx)),

    deleteVideoDialogue: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .mutation(({ input, ctx }) => (ctx.app.service.Video.deleteVideoDialogue as any)(input, ctx)),

    // Video Transcript endpoints
    getVideoTranscript: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .query(({ input, ctx }) => (ctx.app.service.Video.getVideoTranscript as any)(input, ctx)),

    createVideoTranscript: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ data: VideoTranscript.omit({ id: true }) }))
      .mutation(({ input, ctx }) => (ctx.app.service.Video.createVideoTranscript as any)(input, ctx)),

    updateVideoTranscript: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query, data: VideoTranscript.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Video.updateVideoTranscript as any)(input, ctx)),

    deleteVideoTranscript: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .mutation(({ input, ctx }) => (ctx.app.service.Video.deleteVideoTranscript as any)(input, ctx)),

    // Video Scene endpoints
    getVideoScene: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .query(({ input, ctx }) => (ctx.app.service.Video.getVideoScene as any)(input, ctx)),

    createVideoScene: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ data: VideoScene.omit({ id: true }) }))
      .mutation(({ input, ctx }) => (ctx.app.service.Video.createVideoScene as any)(input, ctx)),

    updateVideoScene: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query, data: VideoScene.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Video.updateVideoScene as any)(input, ctx)),

    deleteVideoScene: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .mutation(({ input, ctx }) => (ctx.app.service.Video.deleteVideoScene as any)(input, ctx)),
  });

export type Router = ReturnType<typeof createRouter>;
export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
