import {
    BaseEntity,
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";

import { Song } from "./song-model";

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    user_id: number;

    @Column({
        unique: true,
    })
    email: string;

    @Column({
        unique: true,
    })
    username: string;

    @Column()
    name: string;

    @Column()
    password: string;

    @Column()
    isAdmin: boolean;

    @OneToMany(() => Song, (song) => song.user)
    songs: Song[];
}
