import Joi from 'joi';
import { ControllerGeneratorOptionsWithClient } from '../../comms/controller';

import { schema as pinSchema, Pin } from '../../models/pin';
import { schema as edgeSchema, Edge } from '../../models/edge';
import { schema as measurementThresholdSchema, MeasurementThreshold } from '../../models/measurement-threshold';
import { schema as quantitySchema, Quantity } from '../../models/quantity';

interface Request {
  params: {
    hashId: string;
  };
}

interface Response {
  pin: Pin;
  edges: Edge[];
  thresholds: {
    value: MeasurementThreshold;
    quantity: Quantity;
  }[];
}

const controllerGeneratorOptions: ControllerGeneratorOptionsWithClient = {
  method: 'get',
  path: '/pin/:hashId',
  params: Joi.object().keys({
    hashId: Joi.string().required().example('e13d57'),
  }).required(),
  right: { environment: 'READ' },
  response: (apiVersion: number): Joi.ObjectSchema => Joi.object().keys({
    pin: pinSchema.required(),
    edges: Joi.array().items(edgeSchema).required(),
    thresholds: Joi.array().items(Joi.object().keys({
      value: measurementThresholdSchema.required(),
      quantity: quantitySchema(apiVersion).required(),
    })).required(),
  }).required(),
  description: 'Get a specific pin identified by its hashId',
};

export {
  controllerGeneratorOptions,
  Request,
  Request as EffectiveRequest,
  Response,
};
