import { Request } from "express";
/**
 * 
 */
export type GetDefaultQueries<dbTables extends {} = {}> = {
    [Property in keyof dbTables]?: dbTables[Property]
} & {
    page?: number
    /**The name of the Column and order(ASC | DESC) Ascendent | descending.
     * ex:
     * ```js
     * "sort=name_asc" //sort using name in ascending order
     * ```
     */
    sort?: string
}
/**
 * Default pattern to resource request
 */
export type GetRequest<attrs,params=null> = Request<params,null,GetDefaultQueries<attrs>,GetDefaultQueries<attrs>>
/**
 * Default pattern to resource request
 */
export type PostRequest<attrs> = Request<null,null,attrs>
/**
 * Default request for object using id
 * ```js
 * var idString =Number(req.params.id)
 * 
 * ```
 */
export type GetRequestById<attrs = null> = Request<{"userId":number},null,attrs>