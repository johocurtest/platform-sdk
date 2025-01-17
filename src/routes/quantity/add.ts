import Joi from 'joi';
import { ControllerGeneratorOptionsWithClientAndSupplier } from '../../comms/controller';
import { schema as siNumberSchema, SiNumber } from '../../models/si-number';
import { schema as stringOrTranslationsSchema, StringOrTranslations } from '../../models/string-or-translations';

interface Request {
  body: {
    name: StringOrTranslations;
    color: string;
    unit: string | null;
    defaultOrderOfMagnitude: number;
    defaultCriticallyLowThreshold: SiNumber | null;
    defaultLowThreshold: SiNumber | null;
    defaultHighThreshold: SiNumber | null;
    defaultCriticallyHighThreshold: SiNumber | null;
    disableSiPrefixes: boolean;
    deviceQuantityHashIds?: string[];
  };
}

interface Response {
  hashId: string;
}

const controllerGeneratorOptions: ControllerGeneratorOptionsWithClientAndSupplier = {
  method: 'post',
  path: '/',
  body: Joi.object().keys({
    name: stringOrTranslationsSchema(255).required().example('Temperature'),
    color: Joi.string().default('#ff00ff').example('#ff00ff'),
    unit: Joi.string().allow(null).default(null).example('K')
      .description('Will be displayed with an SI-prefix (eg. k or M) if relevant'),
    defaultOrderOfMagnitude: Joi.number().integer().min(-128).max(127)
      .default(0)
      .example(3)
      .description('Defines default order of magnitude to be selected at manual report form'),
    defaultCriticallyLowThreshold: siNumberSchema.allow(null).default(null),
    defaultLowThreshold: siNumberSchema.allow(null).default(null),
    defaultHighThreshold: siNumberSchema.allow(null).default(null),
    defaultCriticallyHighThreshold: siNumberSchema.allow(null).default(null),
    disableSiPrefixes: Joi.boolean().default(false).example(true).description('Will disable SI-prefixes for this quantity if true'),
    deviceQuantityHashIds: Joi.array().items(Joi.string().example('x18a92')).description('Device quantities, linked to this quantity'),
  }).required(),
  right: { environment: 'ENVIRONMENT_ADMIN', supplier: 'ENVIRONMENT_ADMIN' },
  response: Joi.object().keys({
    hashId: Joi.string().required().example('sajia1'),
  }).required(),
  description: 'Add a quantity',
};

export {
  controllerGeneratorOptions,
  Request,
  Request as EffectiveRequest,
  Response,
};
