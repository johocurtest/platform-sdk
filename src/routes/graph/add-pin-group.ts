import Joi from '@hapi/joi';
import { ControllerGeneratorOptions } from '../../comms/controller';


interface Request {
  body: {
    symbolKey: string;
    geometry: {
      type: 'Point';
      coordinates: [number, number];
    };
    fields: Record<string, string>;
    mapLayer?: string;
    gridHashId?: string | null;
    gridName?: string | null;
    photo?: string;
  };
}

interface Response {
  hashId: string;
}

const controllerGeneratorOptions: ControllerGeneratorOptions = {
  method: 'post',
  path: '/pin-group',
  body: Joi.object().keys({
    symbolKey: Joi.string().required().example('cp-pole'),
    geometry: Joi.object().keys({
      type: Joi.string().valid('Point').required().example('Point'),
      coordinates: Joi.array().length(2).items(Joi.number())
        .description('[lon, lat] in WGS84')
        .example([4.884707950517225, 52.37502141913572]),
    }).required(),
    fields: Joi.object().required().example({ id: 'My measurement location' }),
    mapLayer: Joi.string().invalid('nodes').description('If not provided, the first available one is chosen'),
    gridHashId: Joi.string().allow(null),
    gridName: Joi.string().allow(null).description('If multiple grids exist with the same name, one is chosen at random'),
    photo: Joi.string().description('Should be a dataurl'),
  }).required().nand('gridHashId', 'gridName'),
  right: 'STATIC',
  response: Joi.object().keys({
    hashId: Joi.string().required().example('dao97'),
  }).required(),
  description: 'Create a pin group',
};

export {
  controllerGeneratorOptions,
  Request,
  Request as EffectiveRequest,
  Response,
};
