import { RestoreService } from './restore-backup.service';
export declare class RestoreController {
    private readonly restoreService;
    constructor(restoreService: RestoreService);
    restoreBackup(file: Express.Multer.File): Promise<{
        message: string;
    }>;
}
