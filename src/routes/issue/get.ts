import Joi from 'joi';
import { ControllerGeneratorOptionsWithClient } from '../../comms/controller';

import { schema as issueSchema, Issue } from '../../models/issue';
import { schema as issueCommentSchema, IssueComment } from '../../models/issue-comment';
import { schema as quantitySchema, Quantity } from '../../models/quantity';
import { schema as labelSchema, Label } from '../../models/label';
import { schema as pinGroupSchema, PinGroup } from '../../models/pin-group';
import { schema as pinSchema, Pin } from '../../models/pin';

interface Request {
  params: {
    hashId: string;
  };
}

interface Response {
  issue: Issue;
  userName: string | null;
  assignedUserName: string | null;
  quantities: Quantity[]; // TODO withthegrid/platform#1586 Rob: deprecated
  mentionedUsers: { hashId: string; name: string }[];
  pinGroup: PinGroup;
  pins: Pin[];
  automation: {
    type: 'missing'
  } | {
    type: 'thresholds'
    quantities: Quantity[];
  } | null;
  labels: Label[];
  comments: {
    comment: IssueComment;
    userName: string | null;
  }[];
  subscribed: boolean;
  links: { // TODO withthegrid/platform#1586 Rob: deprecated
    pinGroup: PinGroup;
    pin: Pin | null;
  }[];
}

const controllerGeneratorOptions: ControllerGeneratorOptionsWithClient = {
  method: 'get',
  path: '/:hashId',
  params: Joi.object().keys({
    hashId: Joi.string().required().example('c19aid'),
  }).required(),
  right: { environment: 'READ' },
  response: (apiVersion: number): Joi.ObjectSchema => Joi.object().keys({
    issue: issueSchema.required(),
    userName: Joi.string().max(255).allow(null).required()
      .example('John Doe'),
    assignedUserName: Joi.string().allow(null).required().example(null),
    quantities: Joi.array().items(quantitySchema(apiVersion))
      .required(), // TODO withthegrid/platform#1586 Rob: deprecated
    mentionedUsers: Joi.array().items(Joi.object().keys({
      hashId: Joi.string().required().example('ba5qq1'),
      name: Joi.string().max(255).required().example('Jane Doe'),
    })).required(),
    pinGroup: pinGroupSchema.required(),
    pins: Joi.array().items(pinSchema).required().description('When empty, all pins are affected'),
    automation: Joi.alternatives().try(
      Joi.object({
        type: Joi.string().valid('missing').required(),
      }).required(),
      Joi.object({
        type: Joi.string().valid('thresholds').required(),
        quantities: Joi.array().items(quantitySchema(apiVersion)).required(),
      }).required(),
    ).allow(null),

    labels: Joi.array().items(labelSchema).required(),
    comments: Joi.array().items(Joi.object().keys({
      comment: issueCommentSchema.required(),
      userName: Joi.string().max(255).allow(null).required()
        .example('John Doe'),
    })).required(),
    subscribed: Joi.boolean().required().example(false),
    links: Joi.array().items(Joi.object().keys({ // TODO withthegrid/platform#1586 Rob: deprecated
      pinGroup: pinGroupSchema.required(),
      pin: pinSchema.allow(null).required(),
    })).required(),
  }),
  description: 'Get a specific issue identified by its hashId',
};

export {
  controllerGeneratorOptions,
  Request,
  Request as EffectiveRequest,
  Response,
};
