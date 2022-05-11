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

import { RefObject } from '../models/ref-object';

@Injectable({
    providedIn: 'root',
})
export class NoTagService extends BaseService {
    constructor(config: ApiConfiguration, http: HttpClient) {
        super(config, http);
    }

    /**
     * Path part for operation path3Del
     */
    static readonly Path3DelPath = '/path3/{id}';

    /**
     * DELETE on path3.
     *
     *
     *
     * This method provides access to the full `HttpResponse`, allowing access to response headers.
     * To access only the response body, use `path3Del()` instead.
     *
     * This method doesn't expect any request body.
     */
    path3Del$Response(params: { id: number }): Observable<StrictHttpResponse<Array<string>>> {
        const rb = new RequestBuilder(this.rootUrl, NoTagService.Path3DelPath, 'delete');
        if (params) {
            rb.path('id', params.id, {});
        }

        return this.http
            .request(
                rb.build({
                    responseType: 'json',
                    accept: 'application/*+json',
                }),
            )
            .pipe(
                filter((r: any) => r instanceof HttpResponse),
                map((r: HttpResponse<any>) => {
                    return r as StrictHttpResponse<Array<string>>;
                }),
            );
    }

    /**
     * DELETE on path3.
     *
     *
     *
     * This method provides access to only to the response body.
     * To access the full response (for headers, for example), `path3Del$Response()` instead.
     *
     * This method doesn't expect any request body.
     */
    path3Del(params: { id: number }): Observable<Array<string>> {
        return this.path3Del$Response(params).pipe(
            map((r: StrictHttpResponse<Array<string>>) => r.body as Array<string>),
        );
    }

    /**
     * Path part for operation path4Put
     */
    static readonly Path4PutPath = '/path4';

    /**
     * This method provides access to the full `HttpResponse`, allowing access to response headers.
     * To access only the response body, use `path4Put$Json$Plain()` instead.
     *
     * This method sends `application/json` and handles request body of type `application/json`.
     */
    path4Put$Json$Plain$Response(params?: { body?: RefObject }): Observable<StrictHttpResponse<string>> {
        const rb = new RequestBuilder(this.rootUrl, NoTagService.Path4PutPath, 'put');
        if (params) {
            rb.body(params.body, 'application/json');
        }

        return this.http
            .request(
                rb.build({
                    responseType: 'text',
                    accept: 'text/plain',
                }),
            )
            .pipe(
                filter((r: any) => r instanceof HttpResponse),
                map((r: HttpResponse<any>) => {
                    return r as StrictHttpResponse<string>;
                }),
            );
    }

    /**
     * This method provides access to only to the response body.
     * To access the full response (for headers, for example), `path4Put$Json$Plain$Response()` instead.
     *
     * This method sends `application/json` and handles request body of type `application/json`.
     */
    path4Put$Json$Plain(params?: { body?: RefObject }): Observable<string> {
        return this.path4Put$Json$Plain$Response(params).pipe(map((r: StrictHttpResponse<string>) => r.body as string));
    }

    /**
     * This method provides access to the full `HttpResponse`, allowing access to response headers.
     * To access only the response body, use `path4Put$Json$Binary()` instead.
     *
     * This method sends `application/json` and handles request body of type `application/json`.
     */
    path4Put$Json$Binary$Response(params?: { body?: RefObject }): Observable<StrictHttpResponse<Blob>> {
        const rb = new RequestBuilder(this.rootUrl, NoTagService.Path4PutPath, 'put');
        if (params) {
            rb.body(params.body, 'application/json');
        }

        return this.http
            .request(
                rb.build({
                    responseType: 'blob',
                    accept: 'text/binary',
                }),
            )
            .pipe(
                filter((r: any) => r instanceof HttpResponse),
                map((r: HttpResponse<any>) => {
                    return r as StrictHttpResponse<Blob>;
                }),
            );
    }

    /**
     * This method provides access to only to the response body.
     * To access the full response (for headers, for example), `path4Put$Json$Binary$Response()` instead.
     *
     * This method sends `application/json` and handles request body of type `application/json`.
     */
    path4Put$Json$Binary(params?: { body?: RefObject }): Observable<Blob> {
        return this.path4Put$Json$Binary$Response(params).pipe(map((r: StrictHttpResponse<Blob>) => r.body as Blob));
    }

    /**
     * This method provides access to the full `HttpResponse`, allowing access to response headers.
     * To access only the response body, use `path4Put$Json$Image()` instead.
     *
     * This method sends `application/json` and handles request body of type `application/json`.
     */
    path4Put$Json$Image$Response(params?: { body?: RefObject }): Observable<StrictHttpResponse<Blob>> {
        const rb = new RequestBuilder(this.rootUrl, NoTagService.Path4PutPath, 'put');
        if (params) {
            rb.body(params.body, 'application/json');
        }

        return this.http
            .request(
                rb.build({
                    responseType: 'blob',
                    accept: 'image/*',
                }),
            )
            .pipe(
                filter((r: any) => r instanceof HttpResponse),
                map((r: HttpResponse<any>) => {
                    return r as StrictHttpResponse<Blob>;
                }),
            );
    }

    /**
     * This method provides access to only to the response body.
     * To access the full response (for headers, for example), `path4Put$Json$Image$Response()` instead.
     *
     * This method sends `application/json` and handles request body of type `application/json`.
     */
    path4Put$Json$Image(params?: { body?: RefObject }): Observable<Blob> {
        return this.path4Put$Json$Image$Response(params).pipe(map((r: StrictHttpResponse<Blob>) => r.body as Blob));
    }

    /**
     * This method provides access to the full `HttpResponse`, allowing access to response headers.
     * To access only the response body, use `path4Put$Plain$Plain()` instead.
     *
     * This method sends `text/plain` and handles request body of type `text/plain`.
     */
    path4Put$Plain$Plain$Response(params?: { body?: string }): Observable<StrictHttpResponse<string>> {
        const rb = new RequestBuilder(this.rootUrl, NoTagService.Path4PutPath, 'put');
        if (params) {
            rb.body(params.body, 'text/plain');
        }

        return this.http
            .request(
                rb.build({
                    responseType: 'text',
                    accept: 'text/plain',
                }),
            )
            .pipe(
                filter((r: any) => r instanceof HttpResponse),
                map((r: HttpResponse<any>) => {
                    return r as StrictHttpResponse<string>;
                }),
            );
    }

    /**
     * This method provides access to only to the response body.
     * To access the full response (for headers, for example), `path4Put$Plain$Plain$Response()` instead.
     *
     * This method sends `text/plain` and handles request body of type `text/plain`.
     */
    path4Put$Plain$Plain(params?: { body?: string }): Observable<string> {
        return this.path4Put$Plain$Plain$Response(params).pipe(
            map((r: StrictHttpResponse<string>) => r.body as string),
        );
    }

    /**
     * This method provides access to the full `HttpResponse`, allowing access to response headers.
     * To access only the response body, use `path4Put$Plain$Binary()` instead.
     *
     * This method sends `text/plain` and handles request body of type `text/plain`.
     */
    path4Put$Plain$Binary$Response(params?: { body?: string }): Observable<StrictHttpResponse<Blob>> {
        const rb = new RequestBuilder(this.rootUrl, NoTagService.Path4PutPath, 'put');
        if (params) {
            rb.body(params.body, 'text/plain');
        }

        return this.http
            .request(
                rb.build({
                    responseType: 'blob',
                    accept: 'text/binary',
                }),
            )
            .pipe(
                filter((r: any) => r instanceof HttpResponse),
                map((r: HttpResponse<any>) => {
                    return r as StrictHttpResponse<Blob>;
                }),
            );
    }

    /**
     * This method provides access to only to the response body.
     * To access the full response (for headers, for example), `path4Put$Plain$Binary$Response()` instead.
     *
     * This method sends `text/plain` and handles request body of type `text/plain`.
     */
    path4Put$Plain$Binary(params?: { body?: string }): Observable<Blob> {
        return this.path4Put$Plain$Binary$Response(params).pipe(map((r: StrictHttpResponse<Blob>) => r.body as Blob));
    }

    /**
     * This method provides access to the full `HttpResponse`, allowing access to response headers.
     * To access only the response body, use `path4Put$Plain$Image()` instead.
     *
     * This method sends `text/plain` and handles request body of type `text/plain`.
     */
    path4Put$Plain$Image$Response(params?: { body?: string }): Observable<StrictHttpResponse<Blob>> {
        const rb = new RequestBuilder(this.rootUrl, NoTagService.Path4PutPath, 'put');
        if (params) {
            rb.body(params.body, 'text/plain');
        }

        return this.http
            .request(
                rb.build({
                    responseType: 'blob',
                    accept: 'image/*',
                }),
            )
            .pipe(
                filter((r: any) => r instanceof HttpResponse),
                map((r: HttpResponse<any>) => {
                    return r as StrictHttpResponse<Blob>;
                }),
            );
    }

    /**
     * This method provides access to only to the response body.
     * To access the full response (for headers, for example), `path4Put$Plain$Image$Response()` instead.
     *
     * This method sends `text/plain` and handles request body of type `text/plain`.
     */
    path4Put$Plain$Image(params?: { body?: string }): Observable<Blob> {
        return this.path4Put$Plain$Image$Response(params).pipe(map((r: StrictHttpResponse<Blob>) => r.body as Blob));
    }

    /**
     * This method provides access to the full `HttpResponse`, allowing access to response headers.
     * To access only the response body, use `path4Put$Any$Plain()` instead.
     *
     * This method sends `* / *` and handles request body of type `* / *`.
     */
    path4Put$Any$Plain$Response(params?: { body?: Blob }): Observable<StrictHttpResponse<string>> {
        const rb = new RequestBuilder(this.rootUrl, NoTagService.Path4PutPath, 'put');
        if (params) {
            rb.body(params.body, '*/*');
        }

        return this.http
            .request(
                rb.build({
                    responseType: 'text',
                    accept: 'text/plain',
                }),
            )
            .pipe(
                filter((r: any) => r instanceof HttpResponse),
                map((r: HttpResponse<any>) => {
                    return r as StrictHttpResponse<string>;
                }),
            );
    }

    /**
     * This method provides access to only to the response body.
     * To access the full response (for headers, for example), `path4Put$Any$Plain$Response()` instead.
     *
     * This method sends `* / *` and handles request body of type `* / *`.
     */
    path4Put$Any$Plain(params?: { body?: Blob }): Observable<string> {
        return this.path4Put$Any$Plain$Response(params).pipe(map((r: StrictHttpResponse<string>) => r.body as string));
    }

    /**
     * This method provides access to the full `HttpResponse`, allowing access to response headers.
     * To access only the response body, use `path4Put$Any$Binary()` instead.
     *
     * This method sends `* / *` and handles request body of type `* / *`.
     */
    path4Put$Any$Binary$Response(params?: { body?: Blob }): Observable<StrictHttpResponse<Blob>> {
        const rb = new RequestBuilder(this.rootUrl, NoTagService.Path4PutPath, 'put');
        if (params) {
            rb.body(params.body, '*/*');
        }

        return this.http
            .request(
                rb.build({
                    responseType: 'blob',
                    accept: 'text/binary',
                }),
            )
            .pipe(
                filter((r: any) => r instanceof HttpResponse),
                map((r: HttpResponse<any>) => {
                    return r as StrictHttpResponse<Blob>;
                }),
            );
    }

    /**
     * This method provides access to only to the response body.
     * To access the full response (for headers, for example), `path4Put$Any$Binary$Response()` instead.
     *
     * This method sends `* / *` and handles request body of type `* / *`.
     */
    path4Put$Any$Binary(params?: { body?: Blob }): Observable<Blob> {
        return this.path4Put$Any$Binary$Response(params).pipe(map((r: StrictHttpResponse<Blob>) => r.body as Blob));
    }

    /**
     * This method provides access to the full `HttpResponse`, allowing access to response headers.
     * To access only the response body, use `path4Put$Any$Image()` instead.
     *
     * This method sends `* / *` and handles request body of type `* / *`.
     */
    path4Put$Any$Image$Response(params?: { body?: Blob }): Observable<StrictHttpResponse<Blob>> {
        const rb = new RequestBuilder(this.rootUrl, NoTagService.Path4PutPath, 'put');
        if (params) {
            rb.body(params.body, '*/*');
        }

        return this.http
            .request(
                rb.build({
                    responseType: 'blob',
                    accept: 'image/*',
                }),
            )
            .pipe(
                filter((r: any) => r instanceof HttpResponse),
                map((r: HttpResponse<any>) => {
                    return r as StrictHttpResponse<Blob>;
                }),
            );
    }

    /**
     * This method provides access to only to the response body.
     * To access the full response (for headers, for example), `path4Put$Any$Image$Response()` instead.
     *
     * This method sends `* / *` and handles request body of type `* / *`.
     */
    path4Put$Any$Image(params?: { body?: Blob }): Observable<Blob> {
        return this.path4Put$Any$Image$Response(params).pipe(map((r: StrictHttpResponse<Blob>) => r.body as Blob));
    }

    /**
     * Path part for operation pathWithQuotesGet
     */
    static readonly PathWithQuotesGetPath = "/path'with'quotes";

    /**
     * This method provides access to the full `HttpResponse`, allowing access to response headers.
     * To access only the response body, use `withQuotes()` instead.
     *
     * This method doesn't expect any request body.
     */
    withQuotes$Response(params?: {}): Observable<StrictHttpResponse<string>> {
        const rb = new RequestBuilder(this.rootUrl, NoTagService.PathWithQuotesGetPath, 'get');
        if (params) {
        }

        return this.http
            .request(
                rb.build({
                    responseType: 'text',
                    accept: 'text/plain',
                }),
            )
            .pipe(
                filter((r: any) => r instanceof HttpResponse),
                map((r: HttpResponse<any>) => {
                    return r as StrictHttpResponse<string>;
                }),
            );
    }

    /**
     * This method provides access to only to the response body.
     * To access the full response (for headers, for example), `withQuotes$Response()` instead.
     *
     * This method doesn't expect any request body.
     */
    withQuotes(params?: {}): Observable<string> {
        return this.withQuotes$Response(params).pipe(map((r: StrictHttpResponse<string>) => r.body as string));
    }

    /**
     * Path part for operation path6Get
     */
    static readonly Path6GetPath = '/path6';

    /**
     * This path will return binary by using responseType:"arraybuffer" in generated service.
     *
     *
     *
     * This method provides access to the full `HttpResponse`, allowing access to response headers.
     * To access only the response body, use `path6Get()` instead.
     *
     * This method doesn't expect any request body.
     */
    path6Get$Response(params?: {}): Observable<StrictHttpResponse<Blob>> {
        const rb = new RequestBuilder(this.rootUrl, NoTagService.Path6GetPath, 'get');
        if (params) {
        }

        return this.http
            .request(
                rb.build({
                    responseType: 'blob',
                    accept: '*/*',
                }),
            )
            .pipe(
                filter((r: any) => r instanceof HttpResponse),
                map((r: HttpResponse<any>) => {
                    return r as StrictHttpResponse<Blob>;
                }),
            );
    }

    /**
     * This path will return binary by using responseType:"arraybuffer" in generated service.
     *
     *
     *
     * This method provides access to only to the response body.
     * To access the full response (for headers, for example), `path6Get$Response()` instead.
     *
     * This method doesn't expect any request body.
     */
    path6Get(params?: {}): Observable<Blob> {
        return this.path6Get$Response(params).pipe(map((r: StrictHttpResponse<Blob>) => r.body as Blob));
    }
}
