import Joi from 'joi';
import { ControllerGeneratorOptionsWithSupplier } from '../../comms/controller';

import { TableQuery, EffectiveTableQuery, tableQuerySchemaGenerator } from '../../comms/table-controller';

type Query = TableQuery;

type Request = {
  query?: Query;
} | undefined;

type EffectiveQuery = EffectiveTableQuery;

interface EffectiveRequest {
  query: EffectiveQuery;
}

interface ResponseRow {
  certificate: {
    hashId: string;
    name: string;
    createdAt: Date;
  };
}

interface Response {
  nextPageOffset: string | null;
  rows: ResponseRow[];
}

const controllerGeneratorOptions: ControllerGeneratorOptionsWithSupplier = {
  method: 'get',
  path: '/',
  query: tableQuerySchemaGenerator(Joi.string().valid('hashId', 'name').default('hashId')),
  right: { supplier: 'ENVIRONMENT_ADMIN' },
  response: Joi.object().keys({
    nextPageOffset: Joi.string().allow(null).example(null).required()
      .description('This is the last page if nextPageOffset is null'),
    rows: Joi.array().items(Joi.object().keys({
      certificate: Joi.object().keys({
        hashId: Joi.string().required().example('v19a12'),
        name: Joi.string().required().example('My certificate'),
        createdAt: Joi.date().required().example('2019-12-31T15:23Z'),
      }).required(),
    })).required(),
  }),
  description: 'Search through certificates',
};

export {
  controllerGeneratorOptions,
  Request,
  EffectiveRequest,
  Response,
  Query,
  ResponseRow,
};
