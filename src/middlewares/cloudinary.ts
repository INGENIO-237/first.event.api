import "reflect-metadata";
import { NextFunction, Request, Response } from "express";
import Container from "typedi";
import CloudinaryServices from "../services/utils/cloudinary.services";
import HTTP from "../utils/constants/http.responses";
import logger from "../utils/logger";
import MulterServices from "../services/utils/multer.services";

// TODO: Look how to reduce upload time
const cloudinary = Container.get(CloudinaryServices);
const multer = Container.get(MulterServices);

export async function imageUploader(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.file) {
    const file = req.file as Express.Multer.File;

    await uploadToCloudinary(req, res, file);

    return next();
  } else if (req.files) {
    const keys = Object.keys(req.files);

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    keys.forEach(async (key) => {
      const filesList = files[key];

      await Promise.all(
        filesList.map(async (file) => {
          await uploadToCloudinary(req, res, file);
        })
      ).finally(() =>
        filesList.forEach((file) => multer.removeTmpImg(file.path))
      );
    });

    return next();
  } else {
    return next();
  }
}

async function uploadToCloudinary(
  req: Request,
  res: Response,
  file: Express.Multer.File
) {
  const response = await cloudinary
    .uploadImage(file.path)
    .catch((error) => {
      logger.error("Image upload failed: ", error);
      return res.status(HTTP.INTERNAL_SERVER_ERROR).json([
        {
          message:
            "Un problème s'est produit avec l'upload de l'image. Veuillez réessayer plus tard svp. Si le problème persiste, veuillez contacter le service d'assistance.",
        },
      ]);
    })
    .finally(() => multer.removeTmpImg(file.path));

  const { url, publicId } = response as {
    url: string;
    publicId: string;
  };

  if (url && publicId) {
    req.body[file.fieldname] = {
      url,
      publicId,
    };
  }
}
