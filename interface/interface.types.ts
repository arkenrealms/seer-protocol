import { z, Model, Document } from '../util/mongo';
import * as schema from './interface.schema';

export type * from './interface.router';
export type { RouterContext } from '../types';

export type Interface = z.infer<typeof schema.Interface>;
export type InterfaceDocument = Interface & Document;

export type InterfaceGroup = z.infer<typeof schema.InterfaceGroup>;
export type InterfaceGroupDocument = InterfaceGroup & Document;

export type InterfaceComponent = z.infer<typeof schema.InterfaceComponent>;
export type InterfaceComponentDocument = InterfaceComponent & Document;

export type InterfaceSubmission = z.infer<typeof schema.InterfaceSubmission>;
export type InterfaceSubmissionDocument = InterfaceSubmission & Document;

export type Mappings = {
  Interface: Model<InterfaceDocument>;
  InterfaceGroup: Model<InterfaceGroupDocument>;
  InterfaceComponent: Model<InterfaceComponentDocument>;
  InterfaceSubmission: Model<InterfaceSubmissionDocument>;
};
