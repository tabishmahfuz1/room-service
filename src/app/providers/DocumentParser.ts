import { Readable } from "stream";
import FormData from 'form-data';
import { createWriteStream } from "fs";
import { createReadStream } from "fs";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import Config from "./config/Config";

export interface IDocumentParser {
    labels(name: string, stream: Readable): Promise<string[]>;
}

@injectable()
export class DocumentParser implements IDocumentParser {
    serviceURL: string;

    constructor(
        @inject(TYPES.Config) private _config: Config
    ) {
        this.serviceURL = this._config.get('DOCUMENT_PARSER_URL');

        if ( !this.serviceURL )
            throw new Error("DOCUMENT_PARSER_URL not set in config");
    }

    labels(name: string, stream: Readable): Promise<string[]> {
        const tmpFileName = `tmp/${(new Date()).getTime()}-${name}`;
        const postData = new FormData();
        return new Promise((resolve, reject) => {
            stream.pipe(createWriteStream(tmpFileName)).on('finish', () => {
                postData.append('file', createReadStream(tmpFileName));

                postData.submit(`${this.serviceURL}/`, (err, res) => {
                    if ( err ) return reject(err);

                    res.on('data', data => {
                        const d = JSON.parse(data.toString());
                        // console.log("data", d); 
                        if ( d.status == 'error' ) {
                            reject(d.error);
                            return;
                        }
                        // this._logger.debug("Data from File Repo", data);
                        resolve(d);
                    })
                })
            })
        });
    }
}