import Controller from "./Controller";
import { injectable } from "inversify";

@injectable()
export class HealthStatusController extends Controller {
    requiresAuthentication = false;
    logRequest = false;
    async handle(req: any): Promise<any> {
        return "OK";
    }

}