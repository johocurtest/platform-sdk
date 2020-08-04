import Joi from '@hapi/joi';
import { ControllerGeneratorOptions } from '../../comms/controller';
import { schema as fieldConfigurationsToServerSchema, FieldConfigurationsToServer } from '../../models/fields/field-configurations-to-server';

interface Request {
  body: {
    name: string;
    fieldConfigurations: {
      pinGroup: FieldConfigurationsToServer;
      pin: FieldConfigurationsToServer;
      measurement: FieldConfigurationsToServer;
    };
    parser: string;
  };
}

interface Response {
  hashId: string;
}

const controllerGeneratorOptions: ControllerGeneratorOptions = {
  method: 'post',
  path: '/',
  body: Joi.object().keys({
    name: Joi.string().required().example('Temperature'),
    fieldConfigurations: Joi.object().keys({
      pinGroup: fieldConfigurationsToServerSchema.required(),
      pin: fieldConfigurationsToServerSchema.required(),
      measurement: fieldConfigurationsToServerSchema.required(),
    }).required()
      .description('See the chapter on open fields on how to use this'),
    parser: Joi.string().required().example('[omitted]').description('A javascript function that parses an incoming report. See the chapter "User defined code"'),
  }).required(),
  right: { supplier: 'ENVIRONMENT_ADMIN' },
  response: Joi.object().keys({
    hashId: Joi.string().required().example('y124as'),
  }).required(),
  description: 'Create a report type that devices can send in',
};

export {
  controllerGeneratorOptions,
  Request,
  Request as EffectiveRequest,
  Response,
};
