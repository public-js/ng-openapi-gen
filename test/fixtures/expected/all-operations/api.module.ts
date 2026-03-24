/* tslint:disable */
/* eslint-disable */

/**
 * This file was generated automatically from API specification.
 * Manual changes to this file may cause incorrect behavior and will be lost when the code is regenerated.
 * To update this file run the generation tool.
 */

import { HttpClient } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';

import { Tag1Service } from './services/tag-1.service';
import { Tag2Service } from './services/tag-2.service';
import { NoTagService } from './services/no-tag.service';
import { TagTag2Tag3Tag4Tag5Service } from './services/tag/tag2/tag3/tag4/tag-tag-2-tag-3-tag-4-tag-5.service';

@NgModule({
  providers: [
    Tag1Service,
    Tag2Service,
    NoTagService,
    TagTag2Tag3Tag4Tag5Service,
  ],
})
export class ApiModule {
  constructor(
    @Optional() @SkipSelf() parentModule: ApiModule,
    @Optional() http: HttpClient,
  ) {
    if (parentModule) {
      throw new Error('ApiModule is already loaded. Import in your base AppModule only.');
    }
    if (!http) {
      throw new Error('You need to import the HttpClientModule in your AppModule.');
    }
  }
}
