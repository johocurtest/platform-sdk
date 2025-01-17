import Joi from 'joi';
import { ControllerGeneratorOptionsWithClientAndSupplier } from '../../comms/controller';

import { schema as logSchema, Log } from '../../models/log';

import { TableQuery, EffectiveTableQuery, tableQuerySchemaGenerator } from '../../comms/table-controller';

interface Query extends TableQuery {
  objectType?: string;
  objectHashId?: string;
}

interface Request {
  query: Query;
}

interface EffectiveQuery extends EffectiveTableQuery {
  objectType: string;
  objectHashId: string;
}

interface EffectiveRequest {
  query: EffectiveQuery;
}

interface ResponseRow {
  log: Log;
  userName: string | null;
}

interface Response {
  nextPageOffset: string | null;
  rows: ResponseRow[];
}

const controllerGeneratorOptions: ControllerGeneratorOptionsWithClientAndSupplier = {
  method: 'get',
  path: '/log',
  query: tableQuerySchemaGenerator(Joi.string().valid('hashId').default('hashId'))
    .keys({
      objectType: Joi.string().example('command'),
      objectHashId: Joi.string().example('ga9741s'),
    }),
  right: { environment: 'AUDIT_TRAIL', supplier: 'ENVIRONMENT_ADMIN' },
  response: Joi.object().keys({
    nextPageOffset: Joi.string().allow(null).example(null).required()
      .description('This is the last page if nextPageOffset is null'),
    rows: Joi.array().items(Joi.object().keys({
      log: logSchema.required(),
      userName: Joi.string().max(255).allow(null).required()
        .example('John Doe'),
    })).required(),
  }).required(),
  description: 'Search the audit log',
};

export {
  controllerGeneratorOptions,
  Request,
  EffectiveRequest,
  Response,
  Query,
  ResponseRow,
};
