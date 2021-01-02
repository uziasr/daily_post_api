import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";

import { MikroORM } from "@mikro-orm/core"
import path from "path"

export default {
    migrations: {
        path: path.join(__dirname, '/migrations'), // path to folder with migration files
        pattern: /^[\w-]+\d+\.[tj]s$/, // how to match migration files
    },
    entities: [Post, User],
    dbName: "lireddit",
    user: 'postgres',
    password: '1234',
    debug: !__prod__,
    type: "postgresql",
    port: 5433,
} as Parameters<typeof MikroORM.init>[0]