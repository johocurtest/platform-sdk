import Joi from '@hapi/joi';
import { ControllerGeneratorOptions } from '../../comms/controller';


interface Request {
  body: {
    nodeHashIds: [string | null] | [string | null, string | null];
    geometry: { type: 'LineString'; coordinates: [number, number][] };
    fields: Record<string, string>;
    properties?: Record<string, string | number>;
    mapLayer?: string;
    photo?: string;
  } | {
    geometry: { type: 'MultiLineString'; coordinates: [number, number][][] };
    fields: Record<string, string>;
    properties?: Record<string, string | number>;
    mapLayer?: string;
    photo?: string;
  };
}

interface EffectiveLineStringBody {
  nodeHashIds: [string | null] | [string | null, string | null];
  geometry: { type: 'LineString'; coordinates: [number, number][] };
  fields: Record<string, string>;
  properties: Record<string, string | number>;
  mapLayer?: string;
  photo?: string;
}

interface EffectiveMultiLineStringBody {
  geometry: { type: 'MultiLineString'; coordinates: [number, number][][] };
  fields: Record<string, string>;
  properties: Record<string, string | number>;
  mapLayer?: string;
  photo?: string;
}

interface EffectiveRequest {
  body: EffectiveLineStringBody | EffectiveMultiLineStringBody;
}

interface Response {
  hashId: string;
}

const controllerGeneratorOptions: ControllerGeneratorOptions = {
  method: 'post',
  path: '/edge',
  body: Joi.alternatives().try(
    Joi.object().keys({
      nodeHashIds: Joi.array().min(1).max(2).items(Joi.string().allow(null).required())
        .required()
        .example(['qp111a'])
        .description('The first node is assumed to correspond with the first coordinate in the geometry of the edge, and the second one to the last. If null, a node is created. If only one node is supplied, it is assumed to be both start and end point.'),
      geometry: Joi.object().keys({
        type: Joi.string().valid('LineString').required().example('LineString'),
        coordinates: Joi.array().min(2).max(5000)
          .items(Joi.array().length(2).items(Joi.number()).description('[lon, lat] in WGS84'))
          .required()
          .example([
            [4.884707950517225, 52.37502141913572],
            [4.882654974236971, 52.355321958806485],
            [4.924301064507517, 52.364277347881085],
          ]),
      }).required(),
      fields: Joi.object().required().example({ id: 'My segment' }),
      properties: Joi.object().default({}),
      mapLayer: Joi.string().invalid('nodes').example('myLayer'),
      photo: Joi.string().description('Should be a dataurl'),
    }).required(),
    Joi.object().keys({
      geometry: Joi.object().keys({
        type: Joi.string().valid('MultiLineString').required(),
        coordinates: Joi.array().min(1).max(500)
          .items(Joi.array().min(2).max(5000)
            .items(Joi.array().length(2).items(Joi.number()).description('[lon, lat] in WGS84')))
          .required(),
      }).required(),
      fields: Joi.object().required().example({ id: 'My segment' }),
      properties: Joi.object().default({}),
      mapLayer: Joi.string().invalid('nodes'),
      photo: Joi.string().description('Should be a dataurl'),
    }).required(),
  ),
  right: 'STATIC',
  response: Joi.object().keys({
    hashId: Joi.string().required().example('ka08d'),
  }).required(),
  description: 'Create an edge',
};

export {
  controllerGeneratorOptions,
  Request,
  EffectiveRequest,
  Response,
  EffectiveLineStringBody,
  EffectiveMultiLineStringBody,
};
