import { __Schema, DocumentNode } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import Resolver from './resolvers/Resolver';
import { merge } from 'lodash';
import { gql } from 'apollo-server-express';
import { injectable } from 'inversify';

@injectable()
export default abstract class Schema {
    private _typeDefs: string
    private _resolvers: Resolver[]
    
    constructor() {
        
    }

    /**
     * Returns the TypeDefs
     */
    abstract typeDefs(): string

    /**
     * Returns Resolvers
     */
    abstract resolvers(): Resolver[]

    customResolvers() {
        return [];
    }

    prepareTypeDefs(): DocumentNode {
        this._typeDefs = this.typeDefs();

        console.log("TypeDefs:", this._typeDefs);

        return gql`${this._typeDefs}`;
    }

    prepareResolvers(): any {
        this._resolvers = this.resolvers();
        return merge.apply(
            this, 
            this.resolvers()
            .map(_r => _r.get())
            .concat(this.customResolvers())
        );
    }

    build() {
        // console.log(this.prepareResolvers());
        return makeExecutableSchema({
            typeDefs: this.prepareTypeDefs(),
            resolvers: this.prepareResolvers()
        })
    }
    
}