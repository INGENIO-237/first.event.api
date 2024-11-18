import "reflect-metadata";

import { NextFunction, Request, Response } from "express";
import Container from "typedi";
import { ISubscription } from "../models/subs/subscription.model";
import InfluencerServices from "../services/professionals/influencer.services";
import OrganizerServices from "../services/professionals/organizer.services";
import HTTP from "../utils/constants/http.responses";

const organizerService = Container.get(OrganizerServices);
const influencerService = Container.get(InfluencerServices);

export async function isValidOrganizer(
  req: Request,
  res: Response,
  next: NextFunction
) {
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

// TODO: Create a static method for validating subscription
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

export async function isInfluencer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = (req as any).user;

  // Ensure user is an influencer
  const influencer = await influencerService.getInfluencer(id as string);

  if (!influencer) {
    return res
      .status(HTTP.FORBIDDEN)
      .json([{ message: "Vous n'êtes pas un organisateur" }]);
  }

  (req as any).influencer = influencer;

  return next();
}

export async function isProfessional(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = (req as any).user;

  const organizer = await organizerService.getOrganizer(id as string, false);
  const influencer = await influencerService.getInfluencer(id as string, false);

  if (!organizer && !influencer) {
    return res
      .status(HTTP.FORBIDDEN)
      .json([{ message: "Vous n'êtes pas un professionel" }]);
  }
}
