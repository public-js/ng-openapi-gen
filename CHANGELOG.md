## [0.2.1](https://github.com/public-js/ng-openapi-gen/compare/0.1.1...0.2.1) (2026-11-05)

### ⚠ BREAKING CHANGES

* `null` in an `enum` is no longer generated as the string `'null'`.
* `runEslint` and `runPrettier` are on by default, and the output gains a `prettier.config.mjs`.
* Handlebars templates can no longer be overridden.
* Most CLI flags moved to the config file.
* Node 18 or later is required.
* Node 22.19 or later is required.
* Non-ASCII text is transliterated differently, which renames generated models, services, methods, enum members and files.
* Package paths moved: the CLI entry from `src/ng-openapi-gen.js` to `dist/cli.js`, and the JSON schema from `src/schema.json` to `dist/schema.json`.

### Features

* add hook modules ([df76f6c](https://github.com/public-js/ng-openapi-gen/commit/df76f6c7c6536cb134e9d48387abcded79b2ab07))
* fully support OpenAPI 3.1 schemas ([76cd6c9](https://github.com/public-js/ng-openapi-gen/commit/76cd6c9c9f4af591bfe61405ab9a12b80b033301))
* load specs from localhost and internal hosts ([6e50b3d](https://github.com/public-js/ng-openapi-gen/commit/6e50b3d48076220b371d30fc58327fc59a2bdac4))
* run eslint and prettier on the generated output ([807992c](https://github.com/public-js/ng-openapi-gen/commit/807992cc80dd74dba51b512bb5d89768a246d19a))
* support enum members as discriminator values ([ac7e794](https://github.com/public-js/ng-openapi-gen/commit/ac7e794ad8df9636606339a079f94a6d2641475b))
* swap Handlebars for ts-morph ([6292a5c](https://github.com/public-js/ng-openapi-gen/commit/6292a5cea3170adf5c549898f11423a5108a43be))

### Bug Fixes

* apply transformDocument changes to the document lists ([69d544f](https://github.com/public-js/ng-openapi-gen/commit/69d544f1066e8bd0018edd171e7a68d0b66aecd6))
* escape quotes in inline object types ([a11fdbf](https://github.com/public-js/ng-openapi-gen/commit/a11fdbff4d70bbe90679e8ff1f63dfef6e1fdedc))
* generate a valid $id for the JSON schema ([f74f113](https://github.com/public-js/ng-openapi-gen/commit/f74f113f28c7cbb054d77a229d3679b9c32cb835))
* generate correct import paths for services in a namespace ([7b31ceb](https://github.com/public-js/ng-openapi-gen/commit/7b31ceb2c52314f420f95bdbff2415ded15faad9))
* keep models only used through contentSchema ([52b69e2](https://github.com/public-js/ng-openapi-gen/commit/52b69e24c2f40766344bbd261aba31195958bfd8))
* keep ts files registered during transformSourceFile ([c13cadc](https://github.com/public-js/ng-openapi-gen/commit/c13cadceaf9debb7e49e28f4758b492410146641))
* let includeTags override excludeTags ([2cba633](https://github.com/public-js/ng-openapi-gen/commit/2cba6339fcfd40cac807b10278e2dd50999335d7))
* stop duplicating methods for operations with several tags ([e8e3028](https://github.com/public-js/ng-openapi-gen/commit/e8e30283fa5e5bcb973eeae10fbd433958e4008d))
* support files added by the hooks ([aedda3f](https://github.com/public-js/ng-openapi-gen/commit/aedda3f020019122ed0065bacf39deb2e6848ff8))
* use the system line ending for endOfLineStyle auto ([51cd239](https://github.com/public-js/ng-openapi-gen/commit/51cd239786e97b7724b752de31fce2fb75cbaab3))

### Performance Improvements

* batch ts-morph import and export additions ([5387062](https://github.com/public-js/ng-openapi-gen/commit/5387062a4ac3ddb8a4290e037632cb3b59d7f8c2))
* skip transliteration for names it cannot change ([844911d](https://github.com/public-js/ng-openapi-gen/commit/844911d43c0144f7381978ae8dffb6a3f405f6a9))

### Miscellaneous Chores

* upgrade json-schema-ref-parser to 16 ([e26d2e4](https://github.com/public-js/ng-openapi-gen/commit/e26d2e4b9fcad77b2837684d857229b946d46f7a))

### Code Refactoring

* replace the lodash helpers with change-case ([fde7762](https://github.com/public-js/ng-openapi-gen/commit/fde77628f1ccc68f4eb029c9cf89a667970d67e4))

### Build System

* replace the Nx workspace with a single package ([79f5802](https://github.com/public-js/ng-openapi-gen/commit/79f580270e54ea3f8c00a673f25a86af98d6be64))

## [0.1.1](https://github.com/public-js/ng-openapi-gen/compare/0.1.0...0.1.1) (2026-03-21)

### Features

* add carrier type detection ([223cf69](https://github.com/public-js/ng-openapi-gen/commit/223cf69b870035e9301bfaa665f4ec9f7350a402))

## [0.1.0](https://github.com/public-js/ng-openapi-gen/compare/0.0.7...0.1.0) (2025-10-15)

### Features

* eliminate TS1205 type re-exports ([16bdeaa](https://github.com/public-js/ng-openapi-gen/commit/16bdeaa2e42b89acce92c1eb60b984fd0c55e2b7))

## [0.0.7](https://github.com/public-js/ng-openapi-gen/compare/0.0.6...0.0.7) (2023-10-27)

### Features

* add "ignorecase" enumStyle option ([273c6ff](https://github.com/public-js/ng-openapi-gen/commit/273c6ff070e2b5ea2d42b2539ea71caef2c3736a))
* add EOL config ([8c30ce1](https://github.com/public-js/ng-openapi-gen/commit/8c30ce1a8c87508df16b89aef95f5a3696839336))
* add HttpContext support for Angular 12+ ([9c2041f](https://github.com/public-js/ng-openapi-gen/commit/9c2041f09f0154bf0628efabe7429c5c1632aa9c))
* add support for explicit discriminators ([0da326f](https://github.com/public-js/ng-openapi-gen/commit/0da326f5d457b1096e5dcc07a0cd994a4c1c1008))
* more compact templates ([797b9ee](https://github.com/public-js/ng-openapi-gen/commit/797b9ee8fc23925e6af3fa114acce1d60a35bb61))

### Bug Fixes

* escaped single letter ids generation ([aa1fe18](https://github.com/public-js/ng-openapi-gen/commit/aa1fe181a1daaecb5a62f262598f3dbf5bb93815))
* nullable array elements ([fa02a49](https://github.com/public-js/ng-openapi-gen/commit/fa02a4970c1e828c3f3deacf9ec9d2af67322776))
* oneOf keyword behavior ([ea44ea8](https://github.com/public-js/ng-openapi-gen/commit/ea44ea8f9400c39a3006fe0e9fa4dcc7a1c2541b))
* replace all occurrences in path parameter sanitization ([75af9ca](https://github.com/public-js/ng-openapi-gen/commit/75af9ca7272540379434eda75b91369c62f3a5a8))

## [0.0.6](https://github.com/public-js/ng-openapi-gen/compare/0.0.5...0.0.6) (2023-02-26)

### Features

* add bigint config parameter ([4dfe048](https://github.com/public-js/ng-openapi-gen/commit/4dfe04897499738fe0d303cb4ce643aa8335d582))

## [0.0.5](https://github.com/public-js/ng-openapi-gen/compare/0.0.4...0.0.5) (2022-11-04)

### Features

* bigint support ([73117b8](https://github.com/public-js/ng-openapi-gen/commit/73117b86cb151ee0cb99bcc0b85be843d441265b))

## [0.0.4](https://github.com/public-js/ng-openapi-gen/compare/0.0.3...0.0.4) (2022-07-21)

### Features

* add ability to override lineSeparator ([fde1f64](https://github.com/public-js/ng-openapi-gen/commit/fde1f64aec4650c3d796c10cb3226cd35507aca6))

## [0.0.3](https://github.com/public-js/ng-openapi-gen/compare/0.0.2...0.0.3) (2022-06-22)

### Features

* custom validation (test version) ([f768805](https://github.com/public-js/ng-openapi-gen/commit/f7688059a76a1696b162b9c7ab89794183ef29b7))
* runtime hooks ([3c98682](https://github.com/public-js/ng-openapi-gen/commit/3c9868283427b4e0048d0d5edd77fcbf9d755cf7))

### Bug Fixes

* append comma for each enum value ([885658d](https://github.com/public-js/ng-openapi-gen/commit/885658d90f3b6905cb78478988e701067b68059d))
* handlebars helpers import ([6d8d69d](https://github.com/public-js/ng-openapi-gen/commit/6d8d69ddf25e6a50944f77102da9f4700ab7e49f))

## [0.0.2](https://github.com/public-js/ng-openapi-gen/compare/0.0.1...0.0.2) (2022-05-11)

### Bug Fixes

* execution, templates, dependencies ([a92c18a](https://github.com/public-js/ng-openapi-gen/commit/a92c18acb1be337f8459d148be0a2a36c4881363))

## [0.0.1](https://github.com/public-js/ng-openapi-gen/compare/2126a92751b830e5f21916eb18f965ce55883782...0.0.1) (2022-05-10)

### Features

* optimize imports ([2126a92](https://github.com/public-js/ng-openapi-gen/commit/2126a92751b830e5f21916eb18f965ce55883782))
* optimize templates ([e1eafae](https://github.com/public-js/ng-openapi-gen/commit/e1eafae5b8534c0f06f8906481f75f8465fe0acf))
