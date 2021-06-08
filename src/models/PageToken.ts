export class PageToken {
    pageIndex: number;
    pageSize: number;

    constructor(pageIndex: number, pageSize: number){
        this.pageIndex = pageIndex;
        this.pageSize = pageSize;
    }

    toJSON() {
        return Buffer.from(JSON.stringify({pageIndex:this.pageIndex,pageSize:this.pageSize})).toString('base64');
    }

    static parse(tokenString?: string): PageToken | undefined {
        if (tokenString == undefined) return undefined;

        try {
            const pageToken:PageToken = JSON.parse(Buffer.from(tokenString, 'base64').toString('ascii'));
            return pageToken;
        }
        catch (error){
            console.error(error);
        }

        return undefined;
    }

    

}