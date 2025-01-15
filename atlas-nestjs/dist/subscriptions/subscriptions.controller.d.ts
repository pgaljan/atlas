import { SubscriptionsService } from './subscriptions.service';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    updateSubscriptionPlan(userId: string, planId: number): Promise<{
        id: string;
        userId: string;
        features: import("@prisma/client/runtime/library").JsonValue;
        planId: string;
        startDate: Date;
        endDate: Date;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
    }>;
}
