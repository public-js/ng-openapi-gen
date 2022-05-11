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

import { PetstorePetsModel } from '../models/petstore-pets-model';

@Injectable({
    providedIn: 'root',
})
export class PetsService extends BaseService {
    constructor(config: ApiConfiguration, http: HttpClient) {
        super(config, http);
    }

    /**
     * Path part for operation listPets
     */
    static readonly ListPetsPath = '/pets';

    /**
     * List all pets.
     *
     *
     *
     * This method provides access to the full `HttpResponse`, allowing access to response headers.
     * To access only the response body, use `listPets()` instead.
     *
     * This method doesn't expect any request body.
     */
    listPets$Response(params?: {
        /**
         * How many items to return at one time (max 100)
         */
        limit?: number;
    }): Observable<StrictHttpResponse<PetstorePetsModel>> {
        const rb = new RequestBuilder(this.rootUrl, PetsService.ListPetsPath, 'get');
        if (params) {
            rb.query('limit', params.limit, {});
        }

        return this.http
            .request(
                rb.build({
                    responseType: 'json',
                    accept: 'application/json',
                }),
            )
            .pipe(
                filter((r: any) => r instanceof HttpResponse),
                map((r: HttpResponse<any>) => {
                    return r as StrictHttpResponse<PetstorePetsModel>;
                }),
            );
    }

    /**
     * List all pets.
     *
     *
     *
     * This method provides access to only to the response body.
     * To access the full response (for headers, for example), `listPets$Response()` instead.
     *
     * This method doesn't expect any request body.
     */
    listPets(params?: {
        /**
         * How many items to return at one time (max 100)
         */
        limit?: number;
    }): Observable<PetstorePetsModel> {
        return this.listPets$Response(params).pipe(
            map((r: StrictHttpResponse<PetstorePetsModel>) => r.body as PetstorePetsModel),
        );
    }

    /**
     * Path part for operation createPets
     */
    static readonly CreatePetsPath = '/pets';

    /**
     * Create a pet.
     *
     *
     *
     * This method provides access to the full `HttpResponse`, allowing access to response headers.
     * To access only the response body, use `createPets()` instead.
     *
     * This method doesn't expect any request body.
     */
    createPets$Response(params?: {}): Observable<StrictHttpResponse<void>> {
        const rb = new RequestBuilder(this.rootUrl, PetsService.CreatePetsPath, 'post');
        if (params) {
        }

        return this.http
            .request(
                rb.build({
                    responseType: 'text',
                    accept: '*/*',
                }),
            )
            .pipe(
                filter((r: any) => r instanceof HttpResponse),
                map((r: HttpResponse<any>) => {
                    return (r as HttpResponse<any>).clone({ body: undefined }) as StrictHttpResponse<void>;
                }),
            );
    }

    /**
     * Create a pet.
     *
     *
     *
     * This method provides access to only to the response body.
     * To access the full response (for headers, for example), `createPets$Response()` instead.
     *
     * This method doesn't expect any request body.
     */
    createPets(params?: {}): Observable<void> {
        return this.createPets$Response(params).pipe(map((r: StrictHttpResponse<void>) => r.body as void));
    }

    /**
     * Path part for operation showPetById
     */
    static readonly ShowPetByIdPath = '/pets/{petId}';

    /**
     * Info for a specific pet.
     *
     *
     *
     * This method provides access to the full `HttpResponse`, allowing access to response headers.
     * To access only the response body, use `showPetById()` instead.
     *
     * This method doesn't expect any request body.
     */
    showPetById$Response(params: {
        /**
         * The id of the pet to retrieve
         */
        petId: string;
    }): Observable<StrictHttpResponse<PetstorePetsModel>> {
        const rb = new RequestBuilder(this.rootUrl, PetsService.ShowPetByIdPath, 'get');
        if (params) {
            rb.path('petId', params.petId, {});
        }

        return this.http
            .request(
                rb.build({
                    responseType: 'json',
                    accept: 'application/json',
                }),
            )
            .pipe(
                filter((r: any) => r instanceof HttpResponse),
                map((r: HttpResponse<any>) => {
                    return r as StrictHttpResponse<PetstorePetsModel>;
                }),
            );
    }

    /**
     * Info for a specific pet.
     *
     *
     *
     * This method provides access to only to the response body.
     * To access the full response (for headers, for example), `showPetById$Response()` instead.
     *
     * This method doesn't expect any request body.
     */
    showPetById(params: {
        /**
         * The id of the pet to retrieve
         */
        petId: string;
    }): Observable<PetstorePetsModel> {
        return this.showPetById$Response(params).pipe(
            map((r: StrictHttpResponse<PetstorePetsModel>) => r.body as PetstorePetsModel),
        );
    }
}
