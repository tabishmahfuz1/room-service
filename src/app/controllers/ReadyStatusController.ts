import Controller, { ApiError } from "./Controller";
import { injectable } from "inversify";
import { ReadyStatusSubscriber, ServiceStatus, ReadyStatusObserver } from "../observers/ReadyStatusObserver";
import { Logger } from "../Log";

@injectable()
export class ReadyStatusController extends Controller implements ReadyStatusSubscriber {
    requiresAuthentication = false;
    logRequest = false;
    isAppReady = false;

    constructor(
        private _readyStatusObserver: ReadyStatusObserver
    ) {
        super();
        this.isAppReady = this._readyStatusObserver.isAppReady();
        this._readyStatusObserver.subscribe(this);
    }

    readyStatusChanged(currentChange: ServiceStatus, statusList?: ServiceStatus[]): void {
        this.logger.info("APP STATUS UPDATED", currentChange);
        this.isAppReady = this._readyStatusObserver.isAppReady();
    }

    async handle(req: any): Promise<any> {
        if ( this.isAppReady ) {
            return "OK";
        }

        throw new ApiError("NOT_READY", "The App is not ready yet");
    }

}