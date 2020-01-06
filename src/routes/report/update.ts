import Joi from '@hapi/joi';
import { ControllerGeneratorOptions } from '../../comms/controller';

interface NewMeasurement {
  pinHashId: string;
  quantityHashId: string;
  generatedAt: Date;
  orderOfMagnitude: number;
  significand: number;
}

interface UpdatedMeasurement {
  measurementHashId: string;
  generatedAt: Date;
  orderOfMagnitude: number;
  significand: number;
}

type ReportUpdate = UpdatedMeasurement | NewMeasurement;

interface Request {
  params: {
    hashId: string;
  };
  body: {
    fields?: Record<string, string>;
    measurements: ReportUpdate[];
  };
}

type Response = void;

const controllerGeneratorOptions: ControllerGeneratorOptions = {
  method: 'post',
  path: '/:hashId',
  params: Joi.object().keys({
    hashId: Joi.string().required().example('qoa978'),
  }).required(),
  body: Joi.object().keys({
    measurements: Joi.array().items(Joi.alternatives().try(
      Joi.object().keys({
        measurementHashId: Joi.string().required().example('po177'),
        generatedAt: Joi.date().required().example('2019-12-31T15:23Z'),
        orderOfMagnitude: Joi.number().integer().min(-128).max(127)
          .required()
          .example(-3)
          .description('The measured value is significand * 10 ^ orderOfMagnitude. It has as many significant figures as the significand has (except when the significand is 0, then the number of significant figures is not defined)'),
        significand: Joi.number().integer().min(-2147483648).max(2147483647)
          .required()
          .example(-1400)
          .description('The measured value is significand * 10 ^ orderOfMagnitude. It has as many significant figures as the significand has (except when the significand is 0, then the number of significant figures is not defined)'),
      }),
      Joi.object().keys({
        pinHashId: Joi.string().required().example('e13d57'),
        quantityHashId: Joi.string().required(),
        generatedAt: Joi.date().required(),
        orderOfMagnitude: Joi.number().integer().min(-128).max(127)
          .required()
          .description('The measured value is significand * 10 ^ orderOfMagnitude. It has as many significant figures as the significand has (except when the significand is 0, then the number of significant figures is not defined)'),
        significand: Joi.number().integer().min(-2147483648).max(2147483647)
          .required()
          .description('The measured value is significand * 10 ^ orderOfMagnitude. It has as many significant figures as the significand has (except when the significand is 0, then the number of significant figures is not defined)'),
      }),
    )).required(),
    fields: Joi.object(),
  }).required(),
  right: 'REPORTS',
};

export {
  controllerGeneratorOptions,
  Request,
  Request as EffectiveRequest,
  Response,
  NewMeasurement,
  UpdatedMeasurement,
};
