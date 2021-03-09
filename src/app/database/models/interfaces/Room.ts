export interface IRoom {
    name: string;
    code: string;
    members: string[];
    blacklistedLabels: string[];
    createdBy: string;
    createdAt: Date;
}