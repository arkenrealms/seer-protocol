import * as mongo from '../util/mongo';
import type * as Types from './product.types';

export const Product = mongo.createModel<Types.ProductDocument>(
  'Product',
  {
    shortDescription: { type: String, maxlength: 300, required: false },
    content: { type: String, required: false },
    communityId: { type: mongo.Schema.Types.ObjectId, ref: 'Community', required: false },
    type: { type: String, default: 'game', maxlength: 100 },
    releaseDate: { type: Date },

    // New fields from Objection.js model
    parentId: { type: mongo.Schema.Types.ObjectId, ref: 'Product' },
    score: { type: Number },
    ownerId: { type: mongo.Schema.Types.ObjectId, ref: 'Profile' },
    ratingId: { type: mongo.Schema.Types.ObjectId, ref: 'Rating' },
    ideaId: { type: mongo.Schema.Types.ObjectId, ref: 'Idea' },
    meta: {
      name: String,
      members: [{ type: mongo.Schema.Types.ObjectId, ref: 'Profile' }],
      isProposal: Boolean,
      price: Number,
      oldPrice: Number,
      images: Object,
      video: String,
      genre: String,
      releaseDate: String,
      developer: String,
      publisher: String,
      developerTags: [String],
      languageSupport: [Object], // Adjust as needed
      systemRequirements: [Object], // Adjust as needed
      tags: [{ type: mongo.Schema.Types.ObjectId, ref: 'Tag' }],
      type: String,
      downloads: Number,
      plans: [Object], // Adjust as needed
      frequentlyTradedAssets: [{ type: mongo.Schema.Types.ObjectId, ref: 'Asset' }],
      saleBox: Object,
      assets: [{ type: mongo.Schema.Types.ObjectId, ref: 'Asset' }],
      community: Object,
      nameUrl: String,
      steamId: Number,
      author: String,
    },
  },
  {
    virtuals: [
      {
        name: 'projects',
        ref: 'Project',
        localField: '_id',
        foreignField: 'productId',
      },
      {
        name: 'leaderboards',
        ref: 'Leaderboard',
        localField: '_id',
        foreignField: 'productId',
      },
      {
        name: 'games',
        ref: 'Game',
        localField: '_id',
        foreignField: 'productId',
      },
      {
        name: 'productUpdates',
        ref: 'ProductUpdate',
        localField: '_id',
        foreignField: 'productId',
      },
      // Adding missing relations as virtuals
      {
        name: 'owner',
        ref: 'Profile',
        localField: 'ownerId',
        foreignField: '_id',
        justOne: true,
      },
      {
        name: 'rating',
        ref: 'Rating',
        localField: 'ratingId',
        foreignField: '_id',
        justOne: true,
      },
      {
        name: 'community',
        ref: 'Community',
        localField: 'communityId',
        foreignField: '_id',
        justOne: true,
      },
      {
        name: 'idea',
        ref: 'Idea',
        localField: 'ideaId',
        foreignField: '_id',
        justOne: true,
      },
      {
        name: 'subproducts',
        ref: 'Product',
        localField: '_id',
        foreignField: 'parentId',
      },
      {
        name: 'servers',
        ref: 'Server',
        localField: '_id',
        foreignField: 'productId',
      },
      // {
      //   name: 'votes',
      //   ref: 'Vote',
      //   localField: '_id',
      //   foreignField: 'productId',
      //   through: {
      //     from: 'nodes.toProductId',
      //     to: 'nodes.fromVoteId',
      //     extra: ['relationKey'],
      //   },
      // },
      // {
      //   name: 'files',
      //   ref: 'File',
      //   localField: '_id',
      //   foreignField: 'productId',
      //   through: {
      //     from: 'nodes.fromProductId',
      //     to: 'nodes.toFileId',
      //     extra: ['relationKey'],
      //   },
      // },
      // {
      //   name: 'tags',
      //   ref: 'Tag',
      //   localField: '_id',
      //   foreignField: 'productId',
      //   through: {
      //     from: 'nodes.fromProductId',
      //     to: 'nodes.toTagId',
      //     extra: ['relationKey'],
      //   },
      // },
      // {
      //   name: 'internalTags',
      //   ref: 'Tag',
      //   localField: '_id',
      //   foreignField: 'productId',
      //   through: {
      //     from: 'nodes.fromProductId',
      //     to: 'nodes.toTagId',
      //     extra: ['relationKey'],
      //   },
      // },
    ],
  }
);

export const ProductUpdate = mongo.createModel<Types.ProductUpdateDocument>('ProductUpdate', {
  productId: { type: mongo.Schema.Types.ObjectId, ref: 'Product', required: true },
  updateContent: { type: String, required: true },
  updateDate: { type: Date, required: true },
});
