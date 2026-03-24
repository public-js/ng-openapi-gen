import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Shared state lets the fixture prove that each hook phase ran in order.
const state = {
  openApiTitle: '',
  documentCounts: {
    models: 0,
    operations: 0,
    services: 0
  },
  lookups: {
    model: false,
    operation: false,
    service: false
  },
  models: [],
  operations: [],
  services: []
};

// Exporting multiple small hooks showcases the intended composition style.
// noinspection JSUnusedGlobalSymbols
export default [
  {
    transformOpenApi(openApi) {
      state.openApiTitle = openApi.info?.title ?? '';
      const existingTags = Array.isArray(openApi.tags) ? openApi.tags : [];
      const tags = existingTags.some((tag) => tag.name === 'pets')
        ? existingTags.map((tag) =>
            tag.name === 'pets'
              ? { ...tag, description: 'Pets operations observed by the hook fixture.' }
              : tag
          )
        : [...existingTags, { name: 'pets', description: 'Pets operations observed by the hook fixture.' }];
      return {
        ...openApi,
        tags
      };
    }
  },
  {
    transformModel(model) {
      state.models.push(model.name);
    }
  },
  {
    transformOperation(operation) {
      state.operations.push(operation.id);
    }
  },
  {
    transformService(service) {
      state.services.push(service.name);
    }
  },
  {
    transformDocument(document, context) {
      state.documentCounts = {
        models: document.models.length,
        operations: document.operations.length,
        services: document.services.length
      };
      state.lookups = {
        model: Boolean(context.getModel('#/components/schemas/Pet')),
        operation: Boolean(context.getOperation('listPets')),
        service: Boolean(context.getService('pets'))
      };
    }
  },
  {
    generateAdditionalFiles(context) {
      context.registerGeneratedFile({
        kind: 'ts',
        relativePath: 'hook-fixture.ts',
        content:
          `export const hookFixture = ${JSON.stringify(
            {
              openApiTitle: state.openApiTitle,
              documentCounts: state.documentCounts,
              lookups: state.lookups,
              models: [...state.models].sort(),
              operations: [...state.operations].sort(),
              services: [...state.services].sort(),
              hasProject: Boolean(context.project)
            },
            null,
            2
          )} as const;\n`
      });
    }
  },
  {
    transformSourceFile(sourceFile, metadata) {
      if (metadata.id === 'support:configuration') {
        sourceFile.addStatements(`export const HOOK_FIXTURE_MARKER = 'transformSourceFile';`);
      }
    }
  },
  {
    afterWrite(files, context) {
      const lines = ['afterWrite', ...files.map((file) => file.relativePath).sort()];
      writeFileSync(join(context.options.output, 'hook-after-write.txt'), `${lines.join('\n')}\n`, 'utf8');
    }
  }
];
