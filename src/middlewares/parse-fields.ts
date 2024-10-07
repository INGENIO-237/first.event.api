import { NextFunction, Request, Response } from "express";
import qs from "qs";

export function parseTickets(req: Request, res: Response, next: NextFunction) {
  const parsedBody = qs.parse(req.body);
  const transformedBody = { ...parsedBody };
  const tickets: Array<{ cat: string; price: number; quantity: number }> = [];

  Object.keys(parsedBody).forEach((key) => {
    if (
      key === "tickets" &&
      Array.isArray(parsedBody[key]) &&
      parsedBody[key].length > 0 &&
      typeof parsedBody[key][0] === "string"
    ) {
      const ticketsCount =
        ((parsedBody[key] as Array<string>).length as number) / 3;

      for (let i = 0; i < ticketsCount; i++) {
        const cat = (parsedBody[key] as string[])[i * 3];
        const price = parseInt((parsedBody[key] as string[])[i * 3 + 1]);
        const quantity = parseInt((parsedBody[key] as string[])[i * 3 + 2]);
        tickets.push({ cat, price, quantity });
      }
    }
  });

  // Add the transformed tickets array to the body
  (transformedBody.tickets as any) = tickets;

  req.body = transformedBody;

  return next();
}

export function parseLocation(req: Request, res: Response, next: NextFunction) {
  const parsedBody = qs.parse(req.body);
  const transformedBody = { ...parsedBody };

  const location: Record<string, any> = {};

  Object.keys(parsedBody).forEach((key) => {
    if (key.startsWith("location")) {
      const [, lKey, lsKey] = key.split(".");
      if (lKey && !lsKey) {
        location[lKey] = parsedBody[key];
      }

      if (lsKey) {
        location[lKey] = {
          ...location[lKey],
          [lsKey]:
            lsKey == "lat" || lsKey == "lng"
              ? Number(parsedBody[key])
              : parsedBody[key],
        };
      }

      delete transformedBody[key];
    }
  });

  transformedBody.location =
    Object.keys(location).length > 0 ? location : undefined;

  req.body = transformedBody;

  console.log({ location });

  return next();
}
