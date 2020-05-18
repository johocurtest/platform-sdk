import Joi from '@hapi/joi';

import { schemaConstructor as supplierActivityConstructor, SupplierActivity } from './base';
import { schema as commandSchema, Command } from '../command';

import { schema as deviceTypeHandlerActivity, DeviceTypeHandlerActivity } from './device-type-handler-activity';

interface HandleNewCommand extends SupplierActivity<'handleNewCommand'> {
  triggerData: {
    command?: Command;
  };
  activities: DeviceTypeHandlerActivity[];
}

const schema = (apiVersion: number): Joi.AnySchema => supplierActivityConstructor(
  'handleNewCommand',
  Joi.object().keys({
    command: commandSchema,
  }).required(),
  deviceTypeHandlerActivity(apiVersion),
)
  .tag('supplierActivityHandleNewCommand')
  .description('Supplier defined device type event handler handled a new command for a specific device type. Useful if the command should be shared with a 3rd party by issuing an HTTP request.');


export { schema, HandleNewCommand };