
export class ResponseHandler {
    data: any;
    error: any;
    constructor(data: any, error: any = null) {        
        this.data = data;
        this.error = error;
    }
    
}