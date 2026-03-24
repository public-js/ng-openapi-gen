/* tslint:disable */
/* eslint-disable */

/**
 * This file was generated automatically from API specification.
 * Manual changes to this file may cause incorrect behavior and will be lost when the code is regenerated.
 * To update this file run the generation tool.
 */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { API_ROOT_URL_TOKEN } from '../api-configuration';
import { RequestBuilder, StrictHttpResponse } from '../request-builder';


@Injectable()
export class TagTag2Tag3Tag4Tag5Service {
  constructor(
    @Inject(API_ROOT_URL_TOKEN) private rootUrl: string,
    @Inject(HttpClient) private http: HttpClient,
  ) {}

  /** Path part for operation `path5Get` */
  private static readonly Path5GetPath = '/path5';

  /**
   * A path that contains a reference to response objects.
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `path5Get()` instead.
   *
   * This method doesn't expect any request body.
   */
  public path5Get$Response(params?: {
  },
  context?: HttpContext): Observable<StrictHttpResponse<{
}>> {

    const rb = new RequestBuilder(this.rootUrl, TagTag2Tag3Tag4Tag5Service.Path5GetPath, 'get');
    if (params) {
    }

    return this.http.request(
      rb.build({ responseType: 'json', accept: 'application/json', context: context })
    ).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) =>
        r as StrictHttpResponse<{
        }>,
      ),
    );
  }

  /**
   * A path that contains a reference to response objects.
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), use `path5Get$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  public path5Get(params?: {
  },
  context?: HttpContext): Observable<{
}> {
    return this.path5Get$Response(params, context).pipe(
      map((r: StrictHttpResponse<{
}>) => r.body as {
}),
    );
  }

}
