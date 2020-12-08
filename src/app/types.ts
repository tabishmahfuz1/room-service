const TYPES = {
    KeyStore: Symbol.for("KeyStore"),
    TokenHandler: Symbol.for("TokenHandler"),
    Config: Symbol.for("Config"),
    Database: Symbol.for("Database"),
    Logger: Symbol.for("Logger"),
    Schema: Symbol.for("Schema"),
    MetricCollector: Symbol.for("MetricCollector"),
    DateFormat: Symbol.for("DateFormat"),
    CodeGenerator: Symbol.for("CodeGenerator"),
    DocumentParser: Symbol.for("DocumentParser"),

    /**
     * Repositories
     */
    RoomRepository: Symbol.for("RoomRepository"),
    PostRepository: Symbol.for("PostRepository"),
    FileRepository: Symbol.for("FileRepository"),
    TaskRepository: Symbol.for("TaskRepository"),
    UserRepository: Symbol.for("UserRepository")

};

export { TYPES };