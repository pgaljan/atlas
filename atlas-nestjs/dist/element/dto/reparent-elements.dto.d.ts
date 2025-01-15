export declare class ReparentingRequestDto {
    sourceElementId: number;
    targetElementId: number;
    attributes?: Record<string, any>;
}
export declare class ReparentElementsDto {
    reparentingRequests: ReparentingRequestDto[];
}
