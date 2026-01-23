import * as mongo from '../util/mongo';
import type * as Types from './video.types';

export const Video = mongo.createModel<Types.VideoDocument>('Video', {
  youtubeId: { type: String, unique: true, required: true },
  url: { type: String, required: true },
});

export const VideoParticipant = mongo.createModel<Types.VideoParticipantDocument>('VideoParticipant', {
  profileId: { type: mongo.Schema.Types.ObjectId, ref: 'Profile', required: true },
});

export const VideoDialogue = mongo.createModel<Types.VideoDialogueDocument>('VideoDialogue', {
  participantId: { type: mongo.Schema.Types.ObjectId, ref: 'VideoParticipant', required: true },
  text: { type: String, required: true },
  timestamp: { type: String, required: true },
});

export const VideoTranscript = mongo.createModel<Types.VideoTranscriptDocument>('VideoTranscript', {
  videoId: { type: mongo.Schema.Types.ObjectId, ref: 'Video', required: true },
  // transcript: { type: [mongo.Schema.Types.Mixed], required: true },
  summary: { type: String, optional: true },
});

export const VideoScene = mongo.createModel<Types.VideoSceneDocument>('VideoScene', {});
