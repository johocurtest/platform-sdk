import Joi from 'joi';
import { ControllerGeneratorOptionsWithClient } from '../../comms/controller';

import { schema as deviceSchema, Device } from '../../models/device';
import { schema as deviceTypeSchema, DeviceType } from '../../models/device-type';
import { schema as fieldsToServerUpdateSchema, FieldsToServerUpdate } from '../../models/fields/fields-to-server-update';

interface Request {
  params: {
    hashId: string;
  };
  body: {
    pinGroupHashId: string;
    channelMapping: {
      channel: number;
      pinHashId: string;
      deviceFields?: FieldsToServerUpdate;
    }[];
  };
}

interface Response {
  device: Device;
  deviceType: DeviceType;
  nextReportBefore: Date | null;
}

const controllerGeneratorOptions: ControllerGeneratorOptionsWithClient = {
  method: 'post',
  path: '/:hashId/link',
  params: Joi.object().keys({
    hashId: Joi.string().required().example('j1iha9'),
  }).required(),
  body: Joi.object().keys({
    pinGroupHashId: Joi.string().required().example('dao97'),
    channelMapping: Joi.array().items(Joi.object().keys({
      channel: Joi.number().integer().required().example(0),
      pinHashId: Joi.string().required().example('e13d57'),
      deviceFields: fieldsToServerUpdateSchema,
    })).required(),
  }).required(),
  response: (apiVersion: number): Joi.ObjectSchema => Joi.object().keys({
    device: deviceSchema.required(),
    deviceType: deviceTypeSchema(apiVersion).required(),
    measurementCycle: Joi.valid(null).default(null), // for legacy purposes only
    nextReportBefore: Joi.date().allow(null).example('2019-12-31T15:25Z').required(),
  }).required(),
  right: { environment: 'SENSORS' },
  description: 'Connect a device to a pin group (and its channels to the pin group\'s pins. Future condition reports from this device will also be available on this pin group. A claim token for this device will be invalidated',
};

export {
  controllerGeneratorOptions,
  Request,
  Request as EffectiveRequest,
  Response,
};
