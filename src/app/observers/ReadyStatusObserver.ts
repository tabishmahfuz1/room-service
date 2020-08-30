import { injectable, inject } from "inversify";
import { TYPES } from "../types";
import { Logger } from "../Log";

export interface ServiceStatus {
    name: string;
    isReady: boolean;
}

export interface ReadyStatusSubscriber {
    readyStatusChanged(currentChange: ServiceStatus, statusList?: Array<ServiceStatus>): void;
}

@injectable()
export class ReadyStatusObserver {
    
    constructor(
        @inject(TYPES.Logger) private _logger: Logger
    ) {
        this.subscribe.bind(this);
        this.registerService.bind(this);
        this.isAppReady.bind(this);
        this.notifyStatusChange.bind(this);
        this.updateStatus.bind(this);
        this.serviceList = new Map<string, ServiceStatus>();
        this.subscribers = new Array<ReadyStatusSubscriber>();
    }

    private subscribers: Array<ReadyStatusSubscriber>;
    private serviceList: Map<string, ServiceStatus>;

    registerService(name: string) {
        this._logger.debug("New Service Registered to Observer", name);
        this.serviceList.set(name, { name, isReady: false });
    }

    subscribe(subscriber: ReadyStatusSubscriber) {
        this._logger.debug("New Service Subscribed to Observer", subscriber.constructor?.name);
        this.subscribers.push(subscriber);
    }

    updateStatus(name: string, status: boolean) {
        const service = this.serviceList.get(name);
        service.isReady = status;
        this.serviceList.set(name, service);
        
        this.notifyStatusChange(service);
    }

    private notifyStatusChange(currentService: ServiceStatus) {
        this._logger.debug("Notifying Status Update to Subscribers", currentService);
        this.subscribers
            .forEach(subscriber => subscriber
                .readyStatusChanged(
                    currentService, 
                    Array.from(this.serviceList.values())
                )
            );
    }

    isAppReady() {
        return Array
            .from(this.serviceList.values())
            .every(entry => entry.isReady);
    }
}