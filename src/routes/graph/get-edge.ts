import Joi from 'joi';
import { ControllerGeneratorOptionsWithClient } from '../../comms/controller';

import { schema as edgeSchema, Edge } from '../../models/edge';
import { schema as pinSchema, Pin } from '../../models/pin';
import { schema as pinGroupSchema, PinGroup } from '../../models/pin-group';
import { schema as measurementThresholdSchema, MeasurementThreshold } from '../../models/measurement-threshold';
import { schema as quantitySchema, Quantity } from '../../models/quantity';

interface Request {
  params: {
    hashId: string;
  };
}

interface Response {
  edge: Edge;
  pins: Pin[];
  pinGroups: PinGroup[];
  nextReportBefore: Array<Date | null>;
  thresholds: {
    value: MeasurementThreshold;
    quantity: Quantity;
  }[];
  photo: string | null;
}

const controllerGeneratorOptions: ControllerGeneratorOptionsWithClient = {
  method: 'get',
  path: '/edge/:hashId',
  params: Joi.object().keys({
    hashId: Joi.string().required().example('ka08d'),
  }).required(),
  right: { environment: 'READ' },
  response: (apiVersion: number): Joi.ObjectSchema => Joi.object().keys({
    edge: edgeSchema.required(),
    pins: Joi.array().items(pinSchema).required(),
    pinGroups: Joi.array().items(pinGroupSchema).required(),
    measurementCycles: Joi.array().items(Joi.valid(null)).default([]), // for legacy purposes only
    nextReportBefore: Joi.array().items(Joi.date().allow(null).example('2019-12-31T15:25Z')).required(),
    thresholds: Joi.array().items(Joi.object().keys({
      value: measurementThresholdSchema.required(),
      quantity: quantitySchema(apiVersion).required(),
    })).required(),
    photo: Joi.string().allow(null).required().description('download link for photo.')
      .example('https://api.withthegrid.com/file/yr969d...'),
  }).required(),
  description: 'Get a specific edge identified by its hashId',
};

export {
  controllerGeneratorOptions,
  Request,
  Request as EffectiveRequest,
  Response,
};
