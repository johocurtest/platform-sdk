import Joi from '@hapi/joi';
import { ControllerGeneratorOptions } from '../../comms/controller';

import { schema as supplierCertificateSchema, SupplierCertificate, identifierExample } from '../../models/supplier-certificate';

interface Request {
  params: {
    hashId: string;
  };
}

interface Response {
  certificate: SupplierCertificate;
  identifier: string;
}

const controllerGeneratorOptions: ControllerGeneratorOptions = {
  method: 'get',
  path: '/:hashId',
  params: Joi.object().keys({
    hashId: Joi.string().required().example('f1a4w1'),
  }).required(),
  right: {}, // supplierHashId in header is irrelevant
  response: Joi.object().keys({
    certificate: supplierCertificateSchema.required(),
    identifier: Joi.string().required().example(identifierExample).description('A javascript function that parses the incoming request into a device identifier and report type hashId. See the chapter "User defined code"'),
  }).required(),
  description: 'Get a specific supplier certificate identified by its hashId',
};

export {
  controllerGeneratorOptions,
  Request,
  Request as EffectiveRequest,
  Response,
};
