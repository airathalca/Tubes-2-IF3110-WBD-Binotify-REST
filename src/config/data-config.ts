import { DataSourceOptions } from "typeorm";

import { User } from "../models/user-model";
import { Song } from "../models/song-model";
import { UserSubscriber } from "../subscribers/user-subscriber";

const generatePostgreHost = () => {
    return process.env.POSTGRES_HOST
        ? process.env.POSTGRES_HOST
        : "db-binotify-rest-service";
};

const generatePostgrePort = () => {
    return process.env.POSTGRES_PORT ? +process.env.POSTGRES_PORT : 5432;
};

const generatePostgreUsername = () => {
    return process.env.POSTGRES_USER ? process.env.POSTGRES_USER : "postgres";
};

const generatePostgrePassword = () => {
    return process.env.POSTGRES_PASSWORD
        ? process.env.POSTGRES_PASSWORD
        : "password";
};

const generatePostgreDatabase = () => {
    return process.env.POSTGRES_DB ? process.env.POSTGRES_DB : "binotify_rest";
};

const generateRedisHost = () => {
    return process.env.REDIS_HOST
        ? process.env.REDIS_HOST
        : "cache-binotify-rest-service";
};

const generateRedisPort = () => {
    return process.env.REDIS_PORT ? +process.env.REDIS_PORT : 6379;
};

export const dataConfig: DataSourceOptions = {
    type: "postgres",
    host: generatePostgreHost(),
    port: generatePostgrePort(),
    username: generatePostgreUsername(),
    password: generatePostgrePassword(),
    database: generatePostgreDatabase(),
    cache: {
        type: "redis",
        options: {
            socket: {
                host: generateRedisHost(),
                port: generateRedisPort(),
            },
        },
    },
    synchronize: true,
    logging: true,
    entities: [User, Song],
    subscribers: [UserSubscriber],
    migrations: [],
};
