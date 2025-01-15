import { PrismaService } from '../prisma/prisma.service';
export declare class SubscriptionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    updatePlan(userId: number, planId: number): Promise<{
        id: string;
        userId: string;
        features: import("@prisma/client/runtime/library").JsonValue;
        planId: string;
        startDate: Date;
        endDate: Date;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
    }>;
}
