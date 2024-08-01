import { Service } from "typedi";
import JwtServices from "./jwt.services";

@Service()
export default class AuthServices{
    constructor(private jwt: JwtServices){}

    async login(){
        
    }
}