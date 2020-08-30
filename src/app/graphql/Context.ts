export interface Context {
    auth: {
        userId: string;
        permissions: string[];
    }
}