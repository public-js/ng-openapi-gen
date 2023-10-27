# @public-js/ng-openapi-gen

[![Build](https://github.com/public-js/ng-openapi-gen/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/public-js/ng-openapi-gen/actions/workflows/build.yml)
[![Version](https://img.shields.io/npm/v/@public-js/ng-openapi-gen?style=flat)](https://www.npmjs.com/package/@public-js/ng-openapi-gen)
[![Downloads](https://img.shields.io/npm/dw/@public-js/ng-openapi-gen?style=flat)](https://www.npmjs.com/package/@public-js/ng-openapi-gen)
[![Size](https://packagephobia.com/badge?p=@public-js/ng-openapi-gen)](https://packagephobia.com/result?p=@public-js/ng-openapi-gen)

[![CodeQL](https://github.com/public-js/ng-openapi-gen/actions/workflows/codeql-analyze.yml/badge.svg?branch=main)](https://github.com/public-js/ng-openapi-gen/actions/workflows/codeql-analyze.yml)
[![Codacy](https://app.codacy.com/project/badge/Grade/bf3812369c7146d285b05b539fcf913f)](https://app.codacy.com/gh/public-js/ng-openapi-gen/dashboard)
[![Codecov](https://codecov.io/gh/public-js/ng-openapi-gen/branch/main/graph/badge.svg?token=DXGP8I126q)](https://codecov.io/gh/public-js/ng-openapi-gen)
[![Code Climate](https://api.codeclimate.com/v1/badges/1200908a0ede980d61dc/maintainability)](https://codeclimate.com/github/public-js/ng-openapi-gen/maintainability)

An OpenAPI 3 code generator for Angular

---

## Overview

This package generates interfaces and services from an [OpenApi 3 specification](https://www.openapis.org/).
The generated artifacts follow the [Angular style guide](https://angular.io/guide/styleguide) and are compatible with Angular 12+.

This project is built on top of [ng-openapi-gen](https://github.com/cyclosproject/ng-openapi-gen) and features a lot of improvements listed below.

### Features

- Easy to use the generated code with nearly any Angular app
- Support for OpenAPI specifications in both JSON and YAML formats
- Support for OpenAPI specifications with 3.0 and 3.1 versions
- OpenAPI supports combinations of request body and response content types. A separate method is generated for each combination
- Each tag in the OpenAPI specification is generated as a separate Angular Injectable service
- An Angular NgModule is generated (optionally) providing all services
- Both the body and the original HttpResponse are easily accessible
- It should be pretty easy to integrate the process with Angular ALI
- A list of tags to be generated is easily configurable
- Unused models will not be generated (optionally)

### Differences

- Improved logics which slightly reduces generation time
- Optimized cross-model references for shorter paths
- Altered barrel exports for shorter model names
- API URL is provided with injection token instead of additional class

## Installing

Add the package to your project by running:

```shell
npm i -D @public-js/ng-openapi-gen
```

Execute it from your root `package.json` file like this:

```
"scripts": {
  "api-gen": "ng-openapi-gen --config tools/api.config.json"
}
```

## Resources

- [Changelog](CHANGELOG.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)

## License

MIT, [full license text](LICENSE).
Read more about it on [TLDRLegal](https://www.tldrlegal.com/license/mit-license).
