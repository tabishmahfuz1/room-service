import { readFileSync } from "fs";
import path = require("path");
import { container } from "../inversify.config";
import { TYPES } from "../types";
import Config from "../providers/config/Config";

export default readFileSync(path.join(__dirname, '../../../graphql/typeDefs.graphql'), 'utf8');
const typeDefs = readFileSync(path.join(__dirname, '../../../graphql/typeDefs.graphql'), 'utf8');

// const _config = container.get<Config>(TYPES.Config);

// const _additionalTypes = `\nenum PostType {\n\t${_config.get('postTypes').reduce(type => `${type}\t\n`, '')}\n}`;

// export default `${typeDefs}${_additionalTypes}`;

export const decorateTypeDefs = (typeDefs: string, additionalTypes: Array<string>) => `${typeDefs}\nenum PostType {\n\t${additionalTypes.reduce((str, type) => `${str}\n\t${type}`, '')}\n}`;