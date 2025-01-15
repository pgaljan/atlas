import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
export declare class PlanService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAllPlans(): Promise<{
        id: string;
        name: string;
        description: string;
        price: import("@prisma/client/runtime/library").Decimal;
        features: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    getPlanById(id: number): Promise<{
        id: string;
        name: string;
        description: string;
        price: import("@prisma/client/runtime/library").Decimal;
        features: import("@prisma/client/runtime/library").JsonValue;
    }>;
    createPlan(createPlanDto: CreatePlanDto): Promise<{
        id: string;
        name: string;
        description: string;
        price: import("@prisma/client/runtime/library").Decimal;
        features: import("@prisma/client/runtime/library").JsonValue;
    }>;
    updatePlan(id: number, updatePlanDto: UpdatePlanDto): Promise<{
        id: string;
        name: string;
        description: string;
        price: import("@prisma/client/runtime/library").Decimal;
        features: import("@prisma/client/runtime/library").JsonValue;
    }>;
    deletePlan(id: number): Promise<{
        id: string;
        name: string;
        description: string;
        price: import("@prisma/client/runtime/library").Decimal;
        features: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
