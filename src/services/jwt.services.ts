import { Service } from "typedi";
import config from "../config";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";

@Service()
export default class JwtServices {
  private _accessTtl: string;
  private _refreshTtl: string;
  private _privateAccessToken: string;
  private _publicAccessToken: string;
  private _privateRefreshToken: string;
  private _publicRefreshToken: string;

  constructor() {
    const {
      ACCESS_TTL,
      REFRESH_TTL,
      PRIVATE_ACCESS_TOKEN,
      PUBLIC_ACCESS_TOKEN,
      PRIVATE_REFRESH_TOKEN,
      PUBLIC_REFRESH_TOKEN,
    } = config;

    this._accessTtl = ACCESS_TTL;
    this._refreshTtl = REFRESH_TTL;
    this._privateAccessToken = PRIVATE_ACCESS_TOKEN;
    this._publicAccessToken = PUBLIC_ACCESS_TOKEN;
    this._privateRefreshToken = PRIVATE_REFRESH_TOKEN;
    this._publicRefreshToken = PUBLIC_REFRESH_TOKEN;
  }

  // TODO: Change refresh private token
  signJwt(payload: object, isRefreshToken = false) {
    return jwt.sign(payload, this._privateAccessToken, {
      expiresIn: isRefreshToken ? this._refreshTtl : this._accessTtl,
      algorithm: "RS256",
    });
  }

  verifyJwt(token: string, isRefreshToken = false) {
    try {
      const decoded = jwt.verify(token, this._publicAccessToken);

      return { decoded, isValid: true, expired: false };
    } catch (error: any) {
      logger.error("JWT verification error: ", error.toString());
      return { decoded: null, isValid: false, expired: true };
    }
  }

  reIssueAccesstoken(payload: object) {
    return this.signJwt(payload);
  }
}
