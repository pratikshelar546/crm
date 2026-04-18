import type {  Router } from "express";

export class Route{
    path: string;
    router: Router;
    constructor(path: string, router: Router){
        this.path = path;
        this.router = router;
    }
}