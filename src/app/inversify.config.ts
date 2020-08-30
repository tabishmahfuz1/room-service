import { Container } from "inversify";
import "reflect-metadata";
import { TYPES } from "./types";
import Config from "./providers/config/Config";
import DotEnvConfig from "./providers/config/DotEnvConfig";
import { KeyStore, LocalKeyStore } from "./providers/Keystore";
import { Logger, STDOutLogger } from "./Log";
import { TokenHandler, JWTHandler } from "./providers/TokenHandler";
import Schema from "./graphql/Schema";
import AppSchema from "./graphql/AppSchema";
import { Database } from "./database/Database";
import { MongooseDatabase } from "./database/Database";
import { MetricCollectorInterface, PrometheusMetricCollector } from "./providers/MetricsProvider";
import { RoomRepository, MongooseRoomRepository } from "./database/repositories/RoomRepository";
import { ReadyStatusObserver } from "./observers/ReadyStatusObserver";
import { PostRepository, MongoosePostRepository } from "./database/repositories/PostRepository";
import { UserRespository, MongooseUserRepository } from "./database/repositories/UserRepository";
import { ICodeGenerator, CryptoCodeGenerator } from "./providers/CodeGenrator";
import { toPairs } from "lodash";
import { IFileRepository, RemoteFileRepository } from "./providers/FileRepository";
import { TaskRepository, MongooseTaskRepository } from "./database/repositories/TaskRepository";

const container = new Container({ autoBindInjectable: true });

container.bind<Config>(TYPES.Config).to(DotEnvConfig).inSingletonScope();
container.bind<Database>(TYPES.Database).to(MongooseDatabase).inSingletonScope();
container.bind<KeyStore>(TYPES.KeyStore).to(LocalKeyStore).inRequestScope();
container.bind<Logger>(TYPES.Logger).to(STDOutLogger).inSingletonScope();
container.bind<TokenHandler>(TYPES.TokenHandler).to(JWTHandler).inRequestScope();
container.bind<Schema>(TYPES.Schema).to(AppSchema).inSingletonScope();
container.bind<MetricCollectorInterface>(TYPES.MetricCollector).to(PrometheusMetricCollector).inSingletonScope();
container.bind<ReadyStatusObserver>(ReadyStatusObserver).toSelf().inSingletonScope();
container.bind<ICodeGenerator>(TYPES.CodeGenerator).to(CryptoCodeGenerator).inSingletonScope();

/**
 * Repositories
 */
container.bind<RoomRepository>(TYPES.RoomRepository).to(MongooseRoomRepository);
container.bind<PostRepository>(TYPES.PostRepository).to(MongoosePostRepository);
container.bind<TaskRepository>(TYPES.TaskRepository).to(MongooseTaskRepository);
container.bind<UserRespository>(TYPES.UserRepository).to(MongooseUserRepository);

container.bind<IFileRepository>(TYPES.FileRepository).to(RemoteFileRepository).inSingletonScope();

export { container };