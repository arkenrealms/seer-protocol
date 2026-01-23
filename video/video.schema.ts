import { z, ObjectId, Entity } from '../schema';

export const Video = Entity.merge(
  z.object({
    youtubeId: z.string().min(1),
    url: z.string().url(),
    title: z.string().min(1),
    description: z.string().optional(),
    duration: z.number().min(0).optional(),
    // publishedAt: z.date().optional(),
  })
);

export const VideoParticipant = Entity.merge(
  z.object({
    videoId: ObjectId, // Reference to the associated Video
    profileId: ObjectId.optional(), // Reference to a participant profile
    role: z.enum(['Host', 'Contributor', 'Guest']).optional(),
  })
);

export const VideoDialogue = Entity.merge(
  z.object({
    videoId: ObjectId, // Reference to the associated Video
    participantId: ObjectId, // Reference to the VideoParticipant
    text: z.string().min(1),
    timestamp: z.string().regex(/^\d{2}:\d{2}:\d{2}$/), // Format HH:MM:SS
  })
);

export const VideoTranscript = Entity.merge(
  z.object({
    videoId: ObjectId, // Reference to the associated Video
    transcript: z.array(VideoDialogue), // Array of dialogues
    summary: z.string().optional(),
  })
);

export const VideoScene = Entity.merge(
  z.object({
    videoId: ObjectId, // Reference to the associated Video
    startTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/), // Format HH:MM:SS
    endTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/), // Format HH:MM:SS
    description: z.string().optional(),
  })
);
