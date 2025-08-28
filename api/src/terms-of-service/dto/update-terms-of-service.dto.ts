import { PartialType } from '@nestjs/mapped-types';
import { CreateTermsOfConditions } from './create-terms-of-service.dto';

export class UpdateTermsOfServiceDto extends PartialType(CreateTermsOfConditions) {}
