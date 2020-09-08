import Joi from 'joi';
import { ControllerGeneratorOptions } from '../../comms/controller';

import { schema as reportTypeSchema, ReportType } from '../../models/report-type';

interface Request {
  params: {
    hashId: string;
  };
}

interface Response {
  reportType: ReportType;
  parser: string;
  subscriptionHashId?: string;
}

const controllerGeneratorOptions: ControllerGeneratorOptions = {
  method: 'get',
  path: '/:hashId',
  params: Joi.object().keys({
    hashId: Joi.string().required().example('y124as'),
  }).required(),
  right: { supplier: 'ENVIRONMENT_ADMIN' },
  response: Joi.object().keys({
    reportType: reportTypeSchema.required(),
    parser: Joi.string().required().example('[omitted]').description('A javascript function that parses an incoming report. See the chapter "User defined code"'),
    subscriptionHashId: Joi.string().description('If the user is subscribed to (email) alerts on this object, this key is present'),
  }).required(),
  description: 'Get a specific device report type identified by its hashId',
};

export {
  controllerGeneratorOptions,
  Request,
  Request as EffectiveRequest,
  Response,
};
