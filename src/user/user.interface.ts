import { ObjectID } from "typeorm";

export interface UserI{
    id: ObjectID; 
    name:string;
    email:string;
    password?:string;
}