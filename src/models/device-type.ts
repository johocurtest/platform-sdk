import Joi from '@hapi/joi';
import { schema as fieldConfigurationSchema, FieldConfiguration } from './field-configuration';

const baseSchema = Joi.object().keys({
  hashId: Joi.string().required().example('wasd2'),
  name: Joi.string().required().example('Cathodic protection sensor'),
  fieldConfigurations: Joi.array().items(fieldConfigurationSchema).required()
    .description('See the chapter on open fields on how to use this'),
  pinGroupFieldConfigurations: Joi.array().items(fieldConfigurationSchema).required()
    .description('Defines deviceFields on the pinGroup the device is connected to. Can be used in report type functions. See the chapter on open fields on how to use this'),
  channels: Joi.array().items(Joi.object().keys({
    name: Joi.string().required().example('Red wire'),
    pinFieldConfigurations: Joi.array().items(fieldConfigurationSchema).required()
      .description('Defines deviceFields on the pin the channel is connected to. Can be used in report type functions. See the chapter on open fields on how to use this'),
    defaultPinName: Joi.string().example('Anode').description('If undefined, the channel cannot be linked to a pin'),
  })).required(),
  commandTypeHashIds: Joi.array().items(Joi.string().required().example('x18a92')).required().description('The hashIds of the command types a user can schedule for this device'),
});

const schema = baseSchema
  .tag('deviceType')
  .description('Information about the type of device');


interface DeviceType {
  hashId: string;
  name: string;
  fieldConfigurations: FieldConfiguration[];
  pinGroupFieldConfigurations: FieldConfiguration[];
  channels: {
    name: string;
    pinFieldConfigurations: FieldConfiguration[];
    defaultPinName?: string;
  }[];
  commandTypeHashIds: string[];
}

export {
  schema, baseSchema, DeviceType,
};
