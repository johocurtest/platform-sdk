import j2s, { ComponentsSchema } from 'joi-to-swagger';
import { AnySchema, ObjectSchema, Schema } from 'joi';
import path from 'path';
import fs from 'fs';
import * as widdershins from 'widdershins';
import SwaggerParser from '@apidevtools/swagger-parser';
import {
  apiVersion,
  ControllerGeneratorOptions,
  ControllerGeneratorOptionsWithClient,
  ControllerGeneratorOptionsWithClientAndSupplier,
  ControllerGeneratorOptionsWithoutClientOrSupplier,
  ControllerGeneratorOptionsWithSupplier, IndividualRoutes, routes,
} from '../src';
import createGeneralInformationMd from './general-information-markdown';

type ControllerGeneratorOptionTypes =
  ControllerGeneratorOptionsWithClientAndSupplier
  | ControllerGeneratorOptionsWithSupplier
  | ControllerGeneratorOptionsWithClient
  | ControllerGeneratorOptionsWithoutClientOrSupplier
  | ControllerGeneratorOptions;

type withTagAndSummary = { tag: string, summary: string };
type RouteToDocument = ControllerGeneratorOptionTypes & withTagAndSummary;

const componentsForSchema: (ComponentsSchema | undefined)[] = [];
const tags: Set<string> = new Set<string>();

function determineRequestBodyContent(
  controllerGeneratorOptions: ControllerGeneratorOptionTypes,
): string {
  if (controllerGeneratorOptions.body !== undefined) {
    if (typeof controllerGeneratorOptions.body === 'function') {
      const { swagger, components } = j2s(
        controllerGeneratorOptions.body(apiVersion) as Schema,
      );
      componentsForSchema.push(components);
      return `,
        "requestBody" : {
          "content" : {
            "text/json" : {
              "schema": ${JSON.stringify(swagger)}
            }
          }
        }`;
    }
    const { swagger, components } = j2s(controllerGeneratorOptions.body as Schema);
    componentsForSchema.push(components);
    return `,
    "requestBody" : {
      "content" : {
        "text/json" : {
          "schema": ${JSON.stringify(swagger)}
        }
      }
    }`;
  }
  return '';
}

function determineResponseContent(
  controllerGeneratorOptions: ControllerGeneratorOptionTypes,
): string {
  if (controllerGeneratorOptions.response !== undefined) {
    if (typeof controllerGeneratorOptions.response === 'function') {
      const { swagger, components } = j2s(
        controllerGeneratorOptions.response(apiVersion) as Schema,
      );
      componentsForSchema.push(components);
      return `
        "200": {
          "description": "Success",
          "content": {
            "text/json": {
               "schema": ${JSON.stringify(swagger)}
            }
          }
        }`;
    }
    const { swagger, components } = j2s(controllerGeneratorOptions.response as Schema);
    componentsForSchema.push(components);
    return `
        "200": {
          "description": "Success",
          "content": {
            "text/json": {
               "schema": ${JSON.stringify(swagger)}
            }
          }
        }`;
  }
  return `
      "204": {
        "description": "No Content"
      }`;
}

function determineParameters(
  query?: AnySchema,
  params?: ObjectSchema,
  right?: { supplier?: string, environment?: string },
): string {
  const paramStrings: string[] = [];

  if (right !== undefined && (right.supplier !== undefined || right.environment !== undefined)) {
    paramStrings.push(`
    {
      "name": "Environment-Hash-Id",
      "required": true,
      "in": "header",
      "schema": { "type": "string", "example": "yourAssetEnvironmentHashId" }
    }
  `);
  }
  paramStrings.push(`
    {
      "name": "Api-Version",
      "required": true,
      "in": "header",
      "schema": { "type": "integer", "example": 5 }
    }
  `);

  if (query !== undefined) {
    const swagger = j2s(query).swagger;
    paramStrings.push(`
      {
        "name": "query",
        "schema": ${JSON.stringify(swagger)},
        "required":false,
        "in": "query"
      }`);
  }

  if (params !== undefined) {
    const swagger = j2s(params).swagger;
    Object.getOwnPropertyNames(swagger.properties).sort().forEach((name) => {
      paramStrings.push(`
      {
        "name": "${name}",
        "schema": ${JSON.stringify(swagger.properties[name])},
        "required":${swagger.required.includes(name)},
        "in": "path"
      }`);
    });
  }

  return `"parameters": [${paramStrings.join(',')}],`;
}

function determineMethodsContent(routesToDocument: RouteToDocument[], tag: string) {
  function determineDescription(
    description?: string,
    right?: { supplier?: string, environment?: string },
  ) {
    if ((description === undefined) && (right === undefined)) {
      return '';
    }
    let rightsString = '';
    if (right !== undefined && (right.supplier !== undefined || right.environment !== undefined)) {
      rightsString += '\\n\\nRights\\n\\n';
      if (right.supplier !== undefined) {
        rightsString += `- *Connectivity environment*: ${right.supplier}\\n\\n`;
      }
      if (right.environment !== undefined) {
        rightsString += `- *Monitoring environment*: ${right.environment}\\n\\n`;
      }
    }
    return `"description": "${description !== undefined ? description : ''}${right !== undefined ? ` ${rightsString}` : ''}",`;
  }

  const methodContentParts: string[] = [];
  tags.add(tag);
  routesToDocument.forEach((route) => {
    methodContentParts.push(`"${route.method}": {
    ${route.summary !== undefined ? `"summary": "${route.summary}",` : ''}
    ${determineDescription(route.description, route.right)}
    ${tag === 'authentication' ? '"security":[],' : ''}
    ${determineParameters(route.query, route.params, route.right)}
    "responses": {
      ${determineResponseContent(route)}
    }
    ${determineRequestBodyContent(route)},
    "tags": ["${tag}"]
  }`);
  });
  return methodContentParts.join(',');
}

function determinePathSpecification(
  controllerGeneratorOptions: RouteToDocument[],
): string {
  const pathSpecificationParts: string[] = [];
  const groupedRoutes: Record<string, RouteToDocument[]> = {};
  controllerGeneratorOptions.forEach((controllerGeneratorOption) => {
    const key = controllerGeneratorOption.path;
    if (groupedRoutes[key] === undefined) {
      groupedRoutes[key] = [];
    }
    groupedRoutes[key].push(controllerGeneratorOption);
  });
  Object.entries(groupedRoutes).forEach((record) => {
    const routeWithReplacedHashId = record[0].replace(/:(.*?)(\/|$)/g, '{$1}$2');
    pathSpecificationParts.push(
      `"/${record[1][0].tag}${routeWithReplacedHashId}": {
      ${determineMethodsContent(record[1], record[1][0].tag)}
    }`,
    );
  });

  return pathSpecificationParts.join(',');
}

function determineWiddershinsOptions() {
  return {
    codeSamples: true,
    httpSnippet: false,
    templateCallback(templateName: any, stage: any, data: any) { return data; },
    theme: 'darkula',
    search: true,
    sample: true, // set false by --raw,
    discovery: false,
    includes: [],
    shallowSchemas: false,
    tocSummary: false,
    headings: 2,
    yaml: false,
    user_templates: 'documentation/templates',
  };
}

function determineSchemaSpecifications(schemaSpecifications: (ComponentsSchema | undefined)[]) {
  const setOfSchemas: Set<string> = new Set<string>();
  const convertedSchemaSpecifications: string[] = [];
  schemaSpecifications.forEach((schemaSpecification) => {
    const schemas = schemaSpecification?.schemas;
    if (schemas !== undefined) {
      const schemaNames = Object.getOwnPropertyNames(schemas);
      schemaNames.forEach((schemaName: string) => {
        if (!setOfSchemas.has(schemaName)) {
          setOfSchemas.add(schemaName);
          const schema = schemas[schemaName];
          convertedSchemaSpecifications.push(`"${schemaName}": ${JSON.stringify(schema)}`);
        }
      });
    }
  });
  return convertedSchemaSpecifications;
}

async function go() {
  console.log('starting documentation generation');
  const controllerGeneratorOptionsArray: RouteToDocument[][] = [];
  Object.entries(routes).forEach(([routerName, routeGroup]) => {
    const className = `${routerName.charAt(0).toUpperCase()}${routerName.substring(1)}Route`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const router = (IndividualRoutes as any)[className] as { auth: boolean; routerPath: string };
    const { routerPath } = router;
    const groupedRoutes: (RouteToDocument)[] = [];
    Object.entries(routeGroup).forEach(([controllerName, controller]) => {
      const route = controller.controllerGeneratorOptions as ControllerGeneratorOptions;
      const routeIdentifier = `${controllerName} (${route.method.toUpperCase()} ${routerPath}${route.path})`;
      console.log(`adding route ${routeIdentifier}`);
      groupedRoutes.push(Object.assign(route, { tag: routerPath, summary: controllerName }));
    });
    controllerGeneratorOptionsArray.push(groupedRoutes);
  });

  const pathSwaggerDefinitions = controllerGeneratorOptionsArray.map(determinePathSpecification);
  const schemaDefinitions = determineSchemaSpecifications(componentsForSchema);
  const openApi = `
  {
    "openapi": "3.0.1",
    "info": {
        "title": "platform-sdk",
        "description": "This document provides information on how to access the withthegrid application programmatically.",
        "contact": {
          "name": "API support",
          "email": "info@withthegrid.com",
          "url": "https://withthegrid.com/"
        },
        "version": "${apiVersion}"
    },
    "servers": [
      {
        "url": "https://api.withthegrid.com"
      }
    ],
    "tags": [{"name":"${Array.from(tags).join('"},{"name":"')}"}],
    "paths": {
      ${pathSwaggerDefinitions.join(',')}
    },
    "components": {
      "schemas": {
        ${schemaDefinitions.join(',')}
      },
      "securitySchemes": {
        "jwt-token": {
          "description": "On login you get a token to access all other url's",
          "type": "http",
          "scheme": "bearer",
          "bearerFormat": "JWT"
        }
      }
    },
    "security": [
      {
        "jwt-token": []
      }
    ]
  }`;

  // Write the specification to file
  const filePath = path.resolve(__dirname, 'open-api.json');
  fs.writeFileSync(filePath, JSON.stringify(JSON.parse(openApi), null, 2));

  // Postprocess open api for redoc
  console.log('postprocess api specification for Redoc');
  const widdershinsApiObj = JSON.parse(openApi);
  const openApiObject = JSON.parse(openApi);
  await widdershins.convert(
    widdershinsApiObj,
    determineWiddershinsOptions(),
  ).then((str: string) => {
    const matches = str.matchAll(/## (get|post|delete|put)__(.*_?)+/g);
    let match = matches.next();
    do {
      const method = match.value[1];
      const url = `/${match.value[2].replaceAll('_', '/')}`;
      const codeSamples: { lang: string, label: string, source: string }[] = [];
      const index = match.value.index;
      const substr = str.substring(index);
      const codeStringMatches = substr.matchAll(/(```)(shell|http|javascript|ruby|python|php|java|go)((.*(\n|\r\n))+?)(```)/g);
      let codeStringMatch = codeStringMatches.next();
      let i = 0;
      do {
        if (codeStringMatch.value[2] === 'shell' || codeStringMatch.value[2] === 'javascript') {
          codeSamples.push(
            {
              lang: codeStringMatch.value[2],
              label: codeStringMatch.value[2],
              source: codeStringMatch.value[3],
            },
          );
        }

        i += 1;
        codeStringMatch = codeStringMatches.next();
      } while (i < 8);
      openApiObject.paths[url][method]['x-code-samples'] = codeSamples;
      match = matches.next();
    } while (match !== undefined && match.done === false);
  });

  openApiObject.info['x-logo'] = {
    url: 'https://github.com/withthegrid/platform-sdk/raw/main/docs/wtg-logo.png',
    altText: 'withthegrid',
  };

  const descriptionArray: string[] = [];
  schemaDefinitions.sort();
  schemaDefinitions.forEach((schemaDefinition) => {
    const match = schemaDefinition.match(/"([a-z,A-Z]+?)"/);
    if (match !== null) {
      descriptionArray.push(`##  ${match[1]}\n\n<SchemaDefinition schemaRef="#/components/schemas/${match[1]}"/>`);
    }
  });
  openApiObject.tags = openApiObject.tags.map((tag: { name: string }) => (
    {
      name: tag.name,
      'x-displayName': `${tag.name === 'authentication' ? 'Login' : tag.name[0].toUpperCase() + tag.name.slice(1)}`,
    }));
  openApiObject.tags.push({
    name: 'models',
    'x-displayName': 'Schemas',
    description: descriptionArray.join('\n\n'),
  });

  openApiObject.info.description = createGeneralInformationMd();

  // Write the result
  const filePathRedoc = path.resolve(__dirname, 'redoc.json');
  fs.writeFileSync(filePathRedoc, JSON.stringify(openApiObject, null, 2));

  // Validate the result.
  const api = await SwaggerParser.validate(filePathRedoc);
  console.log('API name: %s, Version: %s', api.info.title, api.info.version);
}

go()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error(e.stack);
    process.exit(1);
  });
