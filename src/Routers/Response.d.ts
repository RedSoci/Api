export interface defaultResponse<DATA = null> {
    status:number,
    errorMessage?:string,
    data:DATA
}