/* tslint:disable */
/* eslint-disable */
import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiConfiguration, ApiConfigurationParams } from './api-configuration';

import { Tag1Service } from './services/tag-1.service';
import { Tag2Service } from './services/tag-2.service';
import { NoTagService } from './services/no-tag.service';
import { TagTag2Tag3Tag4Tag5Service } from './services/tag/tag2/tag3/tag4/tag-tag-2-tag-3-tag-4-tag-5.service';

/**
 * Module that provides all services and configuration.
 */
@NgModule({
    imports: [],
    exports: [],
    declarations: [],
    providers: [Tag1Service, Tag2Service, NoTagService, TagTag2Tag3Tag4Tag5Service, ApiConfiguration],
})
export class ApiModule {
    static forRoot(params: ApiConfigurationParams): ModuleWithProviders<ApiModule> {
        return {
            ngModule: ApiModule,
            providers: [
                {
                    provide: ApiConfiguration,
                    useValue: params,
                },
            ],
        };
    }

    constructor(@Optional() @SkipSelf() parentModule: ApiModule, @Optional() http: HttpClient) {
        if (parentModule) {
            throw new Error('ApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error(
                'You need to import the HttpClientModule in your AppModule! \n' +
                    'See also https://github.com/angular/angular/issues/20575',
            );
        }
    }
}
