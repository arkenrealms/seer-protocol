import { z } from 'zod';
import * as schema from './video.schema';
import { Document, Model } from '../util/mongo';
import type { RouterContext } from '../types';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { Router } from './video.router';

export type * from './video.router';
export type { RouterContext };

export type Video = z.infer<typeof schema.Video>;
export type VideoParticipant = z.infer<typeof schema.VideoParticipant>;
export type VideoDialogue = z.infer<typeof schema.VideoDialogue>;
export type VideoTranscript = z.infer<typeof schema.VideoTranscript>;
export type VideoScene = z.infer<typeof schema.VideoScene>;

export type VideoDocument = Video & Document;
export type VideoParticipantDocument = VideoParticipant & Document;
export type VideoDialogueDocument = VideoDialogue & Document;
export type VideoTranscriptDocument = VideoTranscript & Document;
export type VideoSceneDocument = VideoScene & Document;

export type Mappings = {
  Video: Model<VideoDocument>;
  VideoParticipant: Model<VideoParticipantDocument>;
  VideoDialogue: Model<VideoDialogueDocument>;
  VideoTranscript: Model<VideoTranscriptDocument>;
  VideoScene: Model<VideoSceneDocument>;
};

export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
