import * as fs from 'fs';
import * as path from 'path';
import Config from './config/Config';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { container } from '../inversify.config';

@injectable()
export class LocalKeyStore implements KeyStore {
    privateKeyPath: string;
    publicKeyPath: string;

    constructor(@inject(TYPES.Config) private config: Config) {
        // this.privateKeyPath = config.get('privateKeyPath');
        this.publicKeyPath = config.get('publicKeyPath');

        if ( !this.publicKeyPath ) 
            throw new KeyPathNotDefinedError('Key path not defined in Config');
    }

    public getPublicKey(): string | Buffer {
        // console.trace("PUBLIC_KEY_PATH", path.join(__dirname, `../../../${this.publicKeyPath}`));
        return fs.readFileSync(path.join(__dirname, `../../../${this.publicKeyPath}`));
    }
}

class KeyPathNotDefinedError extends Error {
    constructor(messsage: string) {
        super(messsage);
    }
}

export interface KeyStore {
    // constructor(config: Config)
    // getPrivateKey(): string | Buffer
    getPublicKey(): string | Buffer
}

// export default container.get(TYPES.KeyStore);