import { Request } from "express";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";
import multer from "multer";

export class UploadMiddleware {
    upload(filename: string) {
        const storage = multer.diskStorage({
            destination: (
                req: Request,
                file: Express.Multer.File,
                callback: (error: Error | null, destination: string) => void
            ) => {
                callback(null, path.join(__dirname, "..", "..", "uploads"));
            },
            filename: (
                req: Request,
                file: Express.Multer.File,
                callback: (error: Error | null, destination: string) => void
            ) => {
                const uniqueSuffix = uuidv4();
                callback(null, `${uniqueSuffix}.mp3`);
            },
        });
        const upload = multer({ storage: storage });

        return upload.single(filename);
    }
}
