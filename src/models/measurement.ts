import Joi from '@hapi/joi';

const schema = (apiVersion: number): Joi.ObjectSchema => {
  const model = Joi.object().keys({
    hashId: Joi.string().required().example('po177'),
    generatedAt: Joi.date().required().example('2019-12-31T15:23Z'),
    channelIndex: Joi.number().integer().allow(null).required()
      .description('The channel of the installed sensor. When null, the measurement is not taken by a sensor but manually entered')
      .example(0),
  })
    .tag('measurement')
    .description('A value representing a measurement of a certain quantity at a certain pin by a device or human at a specific point in time.');

  if (apiVersion <= 1) {
    return model.keys({
      nodeGroupHashId: Joi.string().allow(null).required().example('dao97'),
      quantity: Joi.string().required().example('voltage'),
      slotId: Joi.number().integer().allow(null).required()
        .example(null),
      nodeHashId: Joi.string().allow(null).required().example('qp111a'),
      value: Joi.number().required().example(-1.500),
    });
  }

  return model.keys({
    channelMeasurementIndex: Joi.number().integer().allow(null).default(null)
      .example(0)
      .description('Not null for device measurements. Represents the device channel this measurement is taken from, see the channels key in the device type object.'),
    pinHashId: Joi.string().allow(null).required().example('e13d57'),
    orderOfMagnitude: Joi.number().integer().min(-128).max(127)
      .required()
      .example(-3)
      .description('The measured value is significand * 10 ^ orderOfMagnitude. It has as many significant figures as the significand has (except when the significand is 0, then the number of significant figures is not defined)'),
    significand: Joi.number().integer().min(-2147483648).max(2147483647)
      .required()
      .example(-1500)
      .description('The measured value is significand * 10 ^ orderOfMagnitude. It has as many significant figures as the significand has (except when the significand is 0, then the number of significant figures is not defined)'),
  });
};


interface Measurement {
  hashId: string;
  generatedAt: Date;
  channelIndex: number | null;
  channelMeasurementIndex: number | null;
  pinHashId: string | null;
  orderOfMagnitude: number;
  significand: number;
}

interface MeasurementV1 {
  hashId: string;
  generatedAt: Date;
  channelIndex: number | null;
  nodeGroupHashId: string | null;
  quantity: string;
  slotId: number | null;
  nodeHashId: string | null;
  value: number;
}

export { schema, Measurement, MeasurementV1 };
