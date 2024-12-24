import { Request, Response } from "express";
import { Service } from "typedi";
import { CreateEventBookmark } from "../../schemas/bookmarks/event.bookmar.schemas";
import EventBookmarkServices from "../../services/bookmarks/event.bookmark.services";
import HTTP from "../../utils/constants/http.responses";

@Service()
export default class EventBookmarkController {
  constructor(private readonly service: EventBookmarkServices) {}

  async create(
    req: Request<{}, {}, CreateEventBookmark["body"]>,
    res: Response
  ) {
    const { id } = (req as any).user;

    const bookmark = await this.service.create({
      ...req.body,
      user: id,
    });

    return res.status(HTTP.CREATED).json(bookmark);
  }

  async findAll(req: Request, res: Response) {
    const { id } = (req as any).user;

    const bookmarks = await this.service.findAll(id);

    return res.status(HTTP.OK).json(bookmarks);
  }

  async delete(req: Request, res: Response) {
    const { bookmark } = req.params;

    await this.service.delete(bookmark);

    return res.sendStatus(HTTP.OK);
  }
}
