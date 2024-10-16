import "reflect-metadata";

import { NextFunction, Request, Response } from "express";
import HTTP from "../utils/constants/http.responses";
import Container from "typedi";
import OrganizerServices from "../services/professionals/organizer.services";
import { ISubscription } from "../models/subs/subscription.model";

export async function isValidOrganizer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const organizerService = Container.get(OrganizerServices);

  const { id } = (req as any).user;

  // Ensure user is an organizer
  const organizer = await organizerService.getOrganizer(id as string);

  if (!organizer) {
    return res
      .status(HTTP.FORBIDDEN)
      .json([{ message: "Vous n'êtes pas un organisateur" }]);
  }

  (req as any).organizer = organizer;

  return next();
}

export async function validateSubscription(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!(req as any).organizer.subscription) {
    return res
      .status(HTTP.BAD_REQUEST)
      .json([{ message: "Vous n'avez pas de souscription valide en cours" }]);
  }

  // Ensure user has an ongoing subscription and that it's still valid
  const { hasBeenCancelled, endsOn } = (req as any).organizer
    .subscription as ISubscription;

  const presentTime = new Date().getTime();
  const subscriptionEndTime = endsOn.getTime();

  if (hasBeenCancelled || presentTime > subscriptionEndTime)
    return res
      .status(HTTP.BAD_REQUEST)
      .json([{ message: "Vous n'avez pas de souscription valide en cours" }]);

  // delete (req as any).organizer;

  return next();
}
