/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';
import { RequestBuilder } from '../request-builder';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class TagTag2Tag3Tag4Tag5Service extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation path5Get
   */
  static readonly Path5GetPath = '/path5';

  /**
   * A path that contains a reference to response objects.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `path5Get()` instead.
   *
   * This method doesn't expect any request body.
   */
  path5Get$Response(params?: {
  }): Observable<StrictHttpResponse<{
}>> {

    const rb = new RequestBuilder(this.rootUrl, TagTag2Tag3Tag4Tag5Service.Path5GetPath, 'get');
    if (params) {
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<{
        }>;
      })
    );
  }

  /**
   * A path that contains a reference to response objects.
   *
   *
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `path5Get$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  path5Get(params?: {
  }): Observable<{
}> {

    return this.path5Get$Response(params).pipe(
      map((r: StrictHttpResponse<{
}>) => r.body as {
})
    );
  }

}
