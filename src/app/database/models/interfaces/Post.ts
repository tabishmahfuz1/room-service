export interface IPost {
    type: string;
    attachments: FileType[];
    text: string;
    labels: string[];
    parentPost: string;
    room: string;
    createdAt: Date;
    createdBy: string;
}

export interface FileType {
    fileId?: string;
    name: string;
    type: string;
}

