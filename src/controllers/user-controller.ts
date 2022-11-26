import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import {
    AuthToken,
    AuthRequest,
} from "../middlewares/authentication-middleware";
import { cacheConfig } from "../config/cache-config";
import { jwtConfig } from "../config/jwt-config";
import { User } from "../models/user-model";

interface TokenRequest {
    username: string;
    password: string;
}

interface StoreRequest {
    email: string;
    username: string;
    name: string;
    password: string;
}

export class UserController {
    token() {
        return async (req: Request, res: Response) => {
            const { username, password }: TokenRequest = req.body;
            if (!username || !password) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: ReasonPhrases.BAD_REQUEST,
                });
                return;
            }

            const user = await User.createQueryBuilder("user")
                .select(["user.userID", "user.password", "user.isAdmin"])
                .where("user.username = :username", { username })
                .getOne();
            if (!user) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    message: "Invalid credentials",
                });
                return;
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    message: "Invalid credentials",
                });
                return;
            }

            const { userID, isAdmin } = user;
            const payload: AuthToken = {
                userID,
                isAdmin,
            };
            const token = jwt.sign(payload, jwtConfig.secret, {
                expiresIn: jwtConfig.expiresIn,
            });

            res.status(StatusCodes.OK).json({
                message: ReasonPhrases.OK,
                token,
            });
        };
    }

    store() {
        return async (req: Request, res: Response) => {
            const { email, username, name, password }: StoreRequest = req.body;
            if (!email || !username || !name || !password) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: ReasonPhrases.BAD_REQUEST,
                });
                return;
            }

            const user = new User();
            user.email = email;
            user.username = username;
            user.name = name;
            user.password = password;
            user.isAdmin = false;

            // Cek apakah data sudah ada ...
            const existingUserWithUsername = await User.findOneBy({
                username
            })
            if (existingUserWithUsername) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Username already taken!"
                });
                return;
            }

            const existingUserWithEmail = await User.findOneBy({
                email
            })
            if (existingUserWithEmail) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Email already taken!"
                });
                return;
            }

            const newUser = await user.save();
            if (!newUser) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: ReasonPhrases.BAD_REQUEST,
                });
                return;
            }

            const { userID, isAdmin } = newUser;
            const payload: AuthToken = {
                userID,
                isAdmin,
            };
            const token = jwt.sign(payload, jwtConfig.secret, {
                expiresIn: jwtConfig.expiresIn,
            });

            res.status(StatusCodes.CREATED).json({
                message: ReasonPhrases.CREATED,
                token,
            });
        };
    }

    index() {
        return async (req: Request, res: Response) => {
            const { token } = req as AuthRequest;
            if (!token || !token.isAdmin) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    message: ReasonPhrases.UNAUTHORIZED,
                });
                return;
            }

            const users = await User.createQueryBuilder("user")
                .select(["user.userID", "user.name"])
                .where("user.isAdmin = :isAdmin", { isAdmin: false })
                .cache("list_penyanyi", cacheConfig.cacheExpirationTime)
                .getMany();
            if (!users) {
                res.status(StatusCodes.NOT_FOUND).json({
                    message: ReasonPhrases.NOT_FOUND,
                });
                return;
            }

            res.status(StatusCodes.OK).json({
                message: ReasonPhrases.OK,
                data: users,
            });
        };
    }
}
