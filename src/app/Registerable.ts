import { Application } from "express";

export interface Registerable {
    register(app: Application): Application;
}