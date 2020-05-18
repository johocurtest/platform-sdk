import Joi from '@hapi/joi';
import { ControllerGeneratorOptions } from '../../comms/controller';
import { schema as fieldConfigurationSchema, FieldConfiguration } from '../../models/field-configuration';
import { eventHandlerExample } from '../../models/supplier-device-type';

interface Request {
  body: {
    name: string;
    eventHandler: string;
    fieldConfigurations: FieldConfiguration[];
    pinGroupFieldConfigurations: FieldConfiguration[];
    channels: {
      name: string;
      pinFieldConfigurations: FieldConfiguration[];
      defaultPinName?: string;
    }[];
    commandTypeHashIds: string[];
  };
}

interface Response {
  hashId: string;
}

const controllerGeneratorOptions: ControllerGeneratorOptions = {
  method: 'post',
  path: '/',
  body: Joi.object().keys({
    name: Joi.string().required().example('Cathodic protection sensor').description('This name is also visible in environments. To get a uniform user experience, please provide the name in English'),
    eventHandler: Joi.string().required().example(eventHandlerExample).description('A javascript function that handles events. See [add link]'),
    fieldConfigurations: Joi.array().items(fieldConfigurationSchema).required()
      .description('See the chapter on open fields on how to use this'),
    pinGroupFieldConfigurations: Joi.array().items(fieldConfigurationSchema).required()
      .description('Defines deviceFields on the pinGroup the device is connected to. Can be used in report type functions. See the chapter on open fields on how to use this'),
    channels: Joi.array().items(Joi.object().keys({
      name: Joi.string().required().example('Red wire').description('This name is also visible in environments. To get a uniform user experience, please provide the name in English'),
      pinFieldConfigurations: Joi.array().items(fieldConfigurationSchema).required()
        .description('Defines deviceFields on the pin the channel is connected to. Can be used in report type functions. See the chapter on open fields on how to use this'),
      defaultPinName: Joi.string().example('Anode').description('If undefined, the channel cannot be linked to a pin'),
    }).required()).required().description('All measurements are registered on a channel. When a device is installed at a pinGroup, its channels are connected to the pins of the pinGroup.'),
    commandTypeHashIds: Joi.array().items(Joi.string().required().example('x18a92')).required().description('The hashIds of the command types a user can schedule for this device'),
  }).required(),
  right: { supplier: 'ENVIRONMENT_ADMIN' },
  response: Joi.object().keys({
    hashId: Joi.string().required().example('wasd2'),
  }).required(),
  description: 'Add a new device type.',
};

export {
  controllerGeneratorOptions,
  Request,
  Request as EffectiveRequest,
  Response,
};