export { generate } from './core/generate.js';
export { defaultOptions, resolveOptions, type Options, type OptionsInput } from './config/options.js';
export {
    defineHook,
    type GeneratorHook,
    type HookContext,
    type HookGeneratedFile,
    type SourceFileMetadata,
    type WrittenFile,
} from './core/hooks/types.js';
