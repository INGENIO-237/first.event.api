import multer from "multer";
import { join } from "node:path";
import { unlink, readdir, mkdir } from "node:fs";
import logger from "../utils/logger";
import { Service } from "typedi";

@Service()
export default class MulterServices {
  private _baseDir = join(__dirname, "..", "tmp");
  private _storage: multer.StorageEngine;
  uploader: multer.Multer;

  constructor() {
    readdir(this._baseDir, (error, files) => {
      if (error) {
        mkdir(this._baseDir, (err) => {
          if (err) logger.error("Failed to create tmp dir: ", err);
        });
      }
    });
    this._storage = this.getStorage(this._baseDir);
    this.uploader = this.initializeUploader(this._storage);
  }

  getStorage(dirPath: string) {
    return multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, dirPath);
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix);
      },
    });
  }

  initializeUploader(storage: multer.StorageEngine) {
    return multer({ storage });
  }

  removeTmpImg(path: string) {
    unlink(path, (err) => {
      if (err) {
        logger.error("Failed to remove: ", path);
        logger.error(err);
      }
    });
  }
}
