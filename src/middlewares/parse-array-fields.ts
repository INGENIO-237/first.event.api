import { NextFunction, Request, Response } from "express";
import qs from "qs";

export function parseTickets(req: Request, res: Response, next: NextFunction) {
  const parsedBody = qs.parse(req.body);
  const transformedBody = { ...parsedBody };
  const tickets: Array<{ cat: string; price: number; quantity: number }> = [];

  Object.keys(parsedBody).forEach((key) => {
    if (key === "tickets") {
      const ticketsCount = (parsedBody[key]?.length as number) / 3;
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
