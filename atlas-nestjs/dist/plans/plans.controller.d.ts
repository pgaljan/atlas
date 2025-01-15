import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PlanService } from './plans.service';
export declare class PlanController {
    private readonly planService;
    constructor(planService: PlanService);
    getAllPlans(): Promise<{
        id: string;
        name: string;
        description: string;
        price: import("@prisma/client/runtime/library").Decimal;
        features: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    getPlanById(id: string): Promise<{
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
    updatePlan(id: string, updatePlanDto: UpdatePlanDto): Promise<{
        id: string;
        name: string;
        description: string;
        price: import("@prisma/client/runtime/library").Decimal;
        features: import("@prisma/client/runtime/library").JsonValue;
    }>;
    deletePlan(id: string): Promise<{
        id: string;
        name: string;
        description: string;
        price: import("@prisma/client/runtime/library").Decimal;
        features: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
