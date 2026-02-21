// arken/packages/seer/packages/protocol/schema.ts
//
import Mongoose, { Types } from 'mongoose';
import { z as zod, ZodTypeAny, ZodLazy, ZodObject, ZodArray } from 'zod';
import { AnyProcedure, inferProcedureOutput, AnyRouter, AnyTRPCClientTypes, TRPCRouterRecord } from '@trpc/server';

export type { inferRouterInputs } from '@trpc/server';

export const z = zod;

// @ts-ignore
export const ObjectId = z.union([
  z.string().refine((value) => Mongoose.isValidObjectId(value), {
    // Accept valid ObjectId strings
    message: 'Invalid ObjectId',
  }),
  z.instanceof(Types.ObjectId), // Accept Mongoose ObjectId instances
]);

export const Anything = z.any();
export const Nothing = z.object({});
export const Signature = z.object({ hash: z.string(), address: z.string() });
export const UnsignedData = z.object({ data: z.any() });
export const SignedData = z.object({
  data: z.any(),
  signature: Signature,
});

export const AnyInput = z.any();
export const OnlySignatureInput = z.object({ signature: Signature });
export const NoDataOutput = z.object({ status: z.number() });
export const AnyDataOutput = z.object({ data: z.any(), status: z.number() });

export enum Status {
  Paused = 'Paused',
  Pending = 'Pending',
  Active = 'Active',
  Archived = 'Archived',
}

export type Meta = {
  [key: string]: unknown;
};

export const Common = z.object({
  id: ObjectId.optional(),
  meta: z.any(), // Default value set here matches Mongoose
  data: z.any(), // Default value set here matches Mongoose
  status: z.enum(['Paused', 'Pending', 'Active', 'Archived']).default('Active'), // Default set in StatusEnum matches Mongoose
  merkleLeaf: z.string().optional(),
  merkleIndex: z.number().optional(),
  createdById: ObjectId.optional(),
  editedById: ObjectId.optional(),
  deletedById: ObjectId.optional(),
  createdDate: z.date().default(() => new Date()), // Default matches Mongoose
  updatedDate: z.date().optional(),
  deletedDate: z.date().optional(),
});

export type Common = zod.infer<typeof Common>;

export const Entity = z
  .object({
    id: z.string().min(24).max(24).trim().optional(),
    key: z.string().min(1).max(200).trim().optional(),
    name: z.string().min(1).max(200).trim().optional(),
    description: z.string().optional(),
    applicationId: ObjectId.optional(),
    ownerId: ObjectId.optional(),
  })
  .merge(Common);

export type Entity = zod.infer<typeof Entity>;

const ReservedQueryEnvelopeKeys = new Set(['__proto__', 'constructor', 'prototype']);

const rejectReservedQueryEnvelopeKey = (
  key: string,
  label: string,
  ctx: zod.RefinementCtx
) => {
  const normalizedKey = key.trim();

  if (ReservedQueryEnvelopeKeys.has(normalizedKey)) {
    ctx.addIssue({
      code: zod.ZodIssueCode.custom,
      message: `${label} cannot include reserved key \"${normalizedKey}\"`,
    });
    return true;
  }

  return false;
};

const rejectUntrimmedQueryEnvelopeKey = (
  key: string,
  label: string,
  ctx: zod.RefinementCtx
) => {
  if (key !== key.trim()) {
    ctx.addIssue({
      code: zod.ZodIssueCode.custom,
      message: `${label} keys must not contain leading or trailing whitespace`,
    });
    return true;
  }

  return false;
};

const rejectEmptyQueryFilterOperators = (
  operators: Record<string, unknown>,
  ctx: zod.RefinementCtx
) => {
  if (Object.keys(operators).length === 0) {
    ctx.addIssue({
      code: zod.ZodIssueCode.custom,
      message: 'where filter operators must include at least one operator',
    });
    return true;
  }

  return false;
};

const rejectEmptyWhereObject = (
  where: Record<string, unknown>,
  ctx: zod.RefinementCtx
) => {
  if (Object.keys(where).length === 0) {
    ctx.addIssue({
      code: zod.ZodIssueCode.custom,
      message: 'where must include at least one filter or logical clause',
    });
    return true;
  }

  return false;
};

const QueryFilterOperators = z
  .object({
    equals: z.any().optional(),
    not: z.any().optional(),
    in: z.array(z.any()).min(1, 'in must contain at least one value').optional(),
    notIn: z.array(z.any()).min(1, 'notIn must contain at least one value').optional(),
    lt: z.any().optional(),
    lte: z.any().optional(),
    gt: z.any().optional(),
    gte: z.any().optional(),
    contains: z.string().optional(),
    startsWith: z.string().optional(),
    endsWith: z.string().optional(),
    mode: z.enum(['default', 'insensitive']).optional(),
  })
  .superRefine((operators, ctx) => {
    rejectEmptyQueryFilterOperators(operators, ctx);
  });


const NonBlankOrderByRecord = z
  .record(z.enum(['asc', 'desc']))
  .superRefine((orderBy, ctx) => {
    for (const key of Object.keys(orderBy)) {
      if (key.trim().length === 0) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: 'orderBy keys must be non-empty and non-whitespace',
        });
        return;
      }

      if (rejectUntrimmedQueryEnvelopeKey(key, 'orderBy', ctx)) {
        return;
      }

      if (rejectReservedQueryEnvelopeKey(key, 'orderBy', ctx)) {
        return;
      }
    }
  });

const NonBlankBooleanRecord = z
  .record(z.boolean())
  .superRefine((selectionMap, ctx) => {
    for (const key of Object.keys(selectionMap)) {
      if (key.trim().length === 0) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: 'selection keys must be non-empty and non-whitespace',
        });
        return;
      }

      if (rejectUntrimmedQueryEnvelopeKey(key, 'selection', ctx)) {
        return;
      }

      if (rejectReservedQueryEnvelopeKey(key, 'selection', ctx)) {
        return;
      }
    }
  });

const NonBlankCursorRecord = z
  .record(z.any())
  .superRefine((cursorMap, ctx) => {
    if (Object.keys(cursorMap).length === 0) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: 'cursor must include at least one key',
      });
      return;
    }

    for (const key of Object.keys(cursorMap)) {
      if (key.trim().length === 0) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: 'cursor keys must be non-empty and non-whitespace',
        });
        return;
      }

      if (rejectUntrimmedQueryEnvelopeKey(key, 'cursor', ctx)) {
        return;
      }

      if (rejectReservedQueryEnvelopeKey(key, 'cursor', ctx)) {
        return;
      }
    }
  });

const assertTakeLimitParity = (
  query: { take?: number; limit?: number },
  ctx: zod.RefinementCtx,
  path: Array<string>
) => {
  if (query.take !== undefined && query.limit !== undefined && query.take !== query.limit) {
    ctx.addIssue({
      code: zod.ZodIssueCode.custom,
      path,
      message: 'take and limit must match when both are provided',
    });
  }
};

const normalizeTakeLimitAliases = <T extends { take?: number; limit?: number }>(query: T): T => {
  if (query.take === undefined && query.limit !== undefined) {
    return { ...query, take: query.limit };
  }

  if (query.limit === undefined && query.take !== undefined) {
    return { ...query, limit: query.take };
  }

  return query;
};

const applyTakeLimitDefaults = <T extends { take?: number; limit?: number }>(query: T): T => {
  if (query.take === undefined && query.limit === undefined) {
    return { ...query, take: 10, limit: 10 };
  }

  return query;
};

const isPlainRecord = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  return Object.prototype.toString.call(value) === '[object Object]';
};

const QueryWhereSchema = z.lazy(() =>
  z
    .object({
      AND: z.array(QueryWhereSchema).min(1, 'AND must contain at least one condition').optional(),
      OR: z.array(QueryWhereSchema).min(1, 'OR must contain at least one condition').optional(),
      NOT: z.array(QueryWhereSchema).min(1, 'NOT must contain at least one condition').optional(),
      id: QueryFilterOperators.optional(),
      key: QueryFilterOperators.optional(),
      name: QueryFilterOperators.optional(),
      email: QueryFilterOperators.optional(),
      status: QueryFilterOperators.optional(),
    })
    .strict()
    .superRefine((where, ctx) => {
      rejectEmptyWhereObject(where, ctx);
    })
);

export const Query = z
  .object({
    skip: z.number().int().min(0).optional().default(0),
    take: z.number().int().min(0).optional(),
    // legacy alias kept for backward compatibility across callers
    limit: z.number().int().min(0).optional(),
    cursor: NonBlankCursorRecord.optional(),
    where: QueryWhereSchema.optional(),
    orderBy: NonBlankOrderByRecord.optional(),
    include: NonBlankBooleanRecord.optional(),
    select: NonBlankBooleanRecord.optional(),
  })
  .superRefine((query, ctx) => {
    assertTakeLimitParity(query, ctx, ['limit']);
  })
  .transform((query) => applyTakeLimitDefaults(normalizeTakeLimitAliases(query)));

// // Operators for filtering in a Prisma-like way
// type PrismaFilterOperators<T extends ZodTypeAny> = zod.ZodObject<
//   {
//     equals?: T;
//     not?: T;
//     in?: zod.ZodArray<T>;
//     notIn?: zod.ZodArray<T>;
//     lt?: T;
//     lte?: T;
//     gt?: T;
//     gte?: T;
//     contains?: zod.ZodString; // T extends zod.ZodString ? zod.ZodString : never;
//     startsWith?: zod.ZodString; // T extends zod.ZodString ? zod.ZodString : never;
//     endsWith?: zod.ZodString; // T extends zod.ZodString ? zod.ZodString : never;
//     mode?: zod.ZodString; // T extends zod.ZodString ? zod.ZodEnum<['default', 'insensitive']> : never;
//   },
//   'strip',
//   ZodTypeAny
// >;

// // Level 0: No AND, OR, NOT
// type PrismaWhereLevel0<T extends zod.ZodRawShape> = ZodObject<
//   {
//     [K in keyof T]?: PrismaFilterOperators<T[K]>;
//   },
//   'strip',
//   ZodTypeAny
// >;

// // Level 1: Includes AND, OR, NOT of Level 0
// type PrismaWhereLevel1<T extends zod.ZodRawShape> = ZodObject<
//   {
//     AND?: ZodArray<ZodLazy<PrismaWhereLevel0<T>>>;
//     OR?: ZodArray<ZodLazy<PrismaWhereLevel0<T>>>;
//     NOT?: ZodArray<ZodLazy<PrismaWhereLevel0<T>>>;
//   } & {
//     [K in keyof T]?: PrismaFilterOperators<T[K]>;
//   },
//   'strip',
//   ZodTypeAny
// >;

// // Level 2: Includes AND, OR, NOT of Level 1
// type PrismaWhereLevel2<T extends zod.ZodRawShape> = ZodObject<
//   {
//     AND?: ZodArray<ZodLazy<PrismaWhereLevel1<T>>>;
//     OR?: ZodArray<ZodLazy<PrismaWhereLevel1<T>>>;
//     NOT?: ZodArray<ZodLazy<PrismaWhereLevel1<T>>>;
//   } & {
//     [K in keyof T]?: PrismaFilterOperators<T[K]>;
//   },
//   'strip',
//   ZodTypeAny
// >;

// // Level 3: Includes AND, OR, NOT of Level 2
// type PrismaWhereLevel3<T extends zod.ZodRawShape> = ZodObject<
//   {
//     AND?: ZodArray<ZodLazy<PrismaWhereLevel2<T>>>;
//     OR?: ZodArray<ZodLazy<PrismaWhereLevel2<T>>>;
//     NOT?: ZodArray<ZodLazy<PrismaWhereLevel2<T>>>;
//   } & {
//     [K in keyof T]?: PrismaFilterOperators<T[K]>;
//   },
//   'strip',
//   ZodTypeAny
// >;

// // Level 4: Includes AND, OR, NOT of Level 3
// type PrismaWhereLevel4<T extends zod.ZodRawShape> = ZodObject<
//   {
//     AND?: ZodArray<ZodLazy<PrismaWhereLevel3<T>>>;
//     OR?: ZodArray<ZodLazy<PrismaWhereLevel3<T>>>;
//     NOT?: ZodArray<ZodLazy<PrismaWhereLevel3<T>>>;
//   } & {
//     [K in keyof T]?: PrismaFilterOperators<T[K]>;
//   },
//   'strip',
//   ZodTypeAny
// >;

// Function to create a recursive schema up to level 4
export const createPrismaWhereSchema = <T extends zod.ZodRawShape>(
  modelSchema: zod.ZodObject<T>,
  depth: number = 3
): zod.ZodObject<any> => {
  const fields = modelSchema.shape;
  const normalizedDepth = Number.isFinite(depth) ? Math.max(0, Math.floor(depth)) : 0;

  /**
   * For each field, accept either:
   *   - a full operator object: { equals, in, lt, ... }
   *   - OR a raw value shorthand: 'foo'  -> { equals: 'foo' }
   */
  const makeFieldFilter = (value: zod.ZodTypeAny) => {
    const opsSchema = zod
      .object({
        equals: value.optional(),
        not: value.optional(),
        in: zod.array(value).min(1, 'in must contain at least one value').optional(),
        notIn: zod.array(value).min(1, 'notIn must contain at least one value').optional(),
        lt: value.optional(),
        lte: value.optional(),
        gt: value.optional(),
        gte: value.optional(),
        contains: zod.string().optional(),
        startsWith: zod.string().optional(),
        endsWith: zod.string().optional(),
        mode: zod.enum(['default', 'insensitive']).optional(),
      })
      .partial()
      .superRefine((operators, ctx) => {
        rejectEmptyQueryFilterOperators(operators, ctx);
      });

    return zod
      .preprocess((input) => {
        // let undefined through
        if (input === undefined) return input;

        // Plain records are likely operator objects ({ equals, in, ... })
        if (isPlainRecord(input)) {
          return input;
        }

        // Prisma-style shorthand: profileId: 'abc'  -> { equals: 'abc' }
        return { equals: input };
      }, opsSchema)
      .optional();
  };

  const fieldFilters = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, makeFieldFilter(value)]));

  if (normalizedDepth <= 0) {
    // Base case: no AND/OR/NOT
    return zod
      .object({
        ...fieldFilters,
      })
      .strict()
      .superRefine((where, ctx) => {
        rejectEmptyWhereObject(where, ctx);
      });
  }

  return zod
    .object({
      AND: zod.array(zod.lazy(() => createPrismaWhereSchema(modelSchema, normalizedDepth - 1))).min(1, 'AND must contain at least one condition').optional(),
      OR: zod.array(zod.lazy(() => createPrismaWhereSchema(modelSchema, normalizedDepth - 1))).min(1, 'OR must contain at least one condition').optional(),
      NOT: zod.array(zod.lazy(() => createPrismaWhereSchema(modelSchema, normalizedDepth - 1))).min(1, 'NOT must contain at least one condition').optional(),
      ...fieldFilters,
    })
    .strict()
    .superRefine((where, ctx) => {
      rejectEmptyWhereObject(where, ctx);
    });
};

export const getQueryOutput = <T extends zod.ZodTypeAny>(data: T) => {
  return z.object({ status: z.number(), data: data.optional(), error: z.string().optional() });
};

export const getQueryInput = <S extends zod.ZodTypeAny>(schema: S, options: { partialData?: boolean } = {}) => {
  const { partialData = true } = options;

  // Only object schemas get "where" support.
  const isObjectSchema = schema instanceof zod.ZodObject;

  const whereSchema = isObjectSchema
    ? createPrismaWhereSchema(schema as any) // keep your existing recursive builder
    : zod.never(); // not used; also prevents people from sending "where" for arrays

  const dataSchema = isObjectSchema
    ? partialData
      ? (schema as any).partial().optional()
      : (schema as any).optional()
    : schema.optional(); // arrays: allow full array

  const querySchema = zod
    .object({
      data: dataSchema,

      // keep your query envelope fields
      skip: zod.number().int().min(0).optional().default(0),
      take: zod.number().int().min(0).optional(),
      // legacy alias kept for backward compatibility across callers
      limit: zod.number().int().min(0).optional(),
      cursor: NonBlankCursorRecord.optional(),

      // only valid for object schemas
      where: isObjectSchema ? whereSchema.optional() : zod.undefined().optional(),

      orderBy: NonBlankOrderByRecord.optional(),
      include: NonBlankBooleanRecord.optional(),
      select: NonBlankBooleanRecord.optional(),
    })
    .superRefine((query, ctx) => {
      assertTakeLimitParity(query, ctx, ['limit']);
    })
    .transform((query) => applyTakeLimitDefaults(normalizeTakeLimitAliases(query)));

  return zod.union([querySchema, zod.undefined()]);
};

export type inferQuery<T extends zod.ZodRawShape> = zod.infer<ReturnType<typeof createPrismaWhereSchema<T>>>;

export type GetInferenceHelpers<
  TType extends 'input' | 'output',
  TRoot extends AnyTRPCClientTypes,
  TRecord extends TRPCRouterRecord
> = {
  [TKey in keyof TRecord]: TRecord[TKey] extends infer $Value
    ? $Value extends TRPCRouterRecord
      ? GetInferenceHelpers<TType, TRoot, $Value>
      : $Value extends AnyProcedure
      ? inferProcedureOutput<$Value> // inferTransformedProcedureOutput<TRoot, $Value>
      : never
    : never;
};

export type inferRouterOutputs<TRouter extends AnyRouter> = GetInferenceHelpers<
  'output',
  TRouter['_def']['_config']['$types'],
  TRouter['_def']['record']
>;

// type SpecificOutput = Router['_def']['record']['createInterfaceDraft']['_def']['$types']['output'];
// type TestOutput = RouterOutput['createInterfaceDraft'];
