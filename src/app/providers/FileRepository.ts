import { injectable, inject } from "inversify";
import { Readable } from "stream";
import FormData from 'form-data';
import { TYPES } from "../types";
import Config from "./config/Config";
import { Logger } from "../Log";
import got from 'got';
import { createReadStream, createWriteStream, exists, mkdir, unlink } from "fs";
import { promisify } from "util";
const dirExists = promisify(exists);
const mkDir = promisify(mkdir);

interface IFile {
    id?: string;
    name?: string;
    directory?: string;
    labels: string[];
    mimetype?: string;
    createReadStream?: () => Readable
}

interface FileFilters {
    name: string;
    directory: string;
    labels: string[];
    mimetype: string;
}

export interface IFileRepository {
    store(file: IFile): Promise<string>;
    getById(id: string): Promise<Readable>;
    find(filters: Partial<FileFilters>): Array<IFile>;
} 

@injectable()
export class RemoteFileRepository implements IFileRepository {
    fileRepoUrl: string;
    constructor(
        @inject(TYPES.Config) private _config: Config,
        @inject(TYPES.Logger) private _logger: Logger
    ){
        const fileRepoUrl = this._config.get('fileRepoUrl');
        if ( !fileRepoUrl ) throw new Error("FILE_REPO_URL not set in Config");

        dirExists('tmp').then(
            exts => !exts && mkDir('tmp').then(() => this._logger.info("tmp directory created"))
        )

        this.fileRepoUrl = fileRepoUrl;
    }

    async store(file: IFile): Promise<string> {
        // throw new Error("Method not implemented.");
        const postData = new FormData();
        postData.append('name', (file.name));
        postData.append('labels', (JSON.stringify(file.labels)));
        file.directory && postData.append('directory', (file.directory));
        file.mimetype && postData.append('mimetype', (file.mimetype));

        const tmpFileName = `tmp/${(new Date()).getTime()}-${file.name}`;

        file.createReadStream().pipe(createWriteStream(tmpFileName))
        postData.append('file', createReadStream(tmpFileName));
        console.log("POST DATA", postData);
        // console.log("STREAM",  file.createReadStream);
        // throw new Error();
        return got.post(`${this.fileRepoUrl}/upload`, {
            body: postData
        }).text().then(text => {
            unlink(tmpFileName, (err) => {
                if(err) this._logger.error("Coudn't delete tmp file", err);
                else this._logger.debug("Temp file deleted", tmpFileName);
            });
            return text;
        });

        /* return new Promise((resolve, reject) => {

            postData.submit(`${this.fileRepoUrl}/upload`, (err, res) => {
                if ( err ) return reject(err);

                res.on('data', data => {
                    this._logger.debug("Data from File Repo", data);
                    resolve(data);
                })
            })
        }) */
    }

    async getById(id: string): Promise<Readable> {
        return got.get(`${this.fileRepoUrl}/get/${id}`, {
            isStream: true
        });
    }
    
    find(filters: Partial<FileFilters>): IFile[] {
        throw new Error("Method not implemented.");
    }

} 