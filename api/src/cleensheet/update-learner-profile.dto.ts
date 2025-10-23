import { PartialType } from '@nestjs/mapped-types';
import { CreateLearnerProfileDto } from './create-learner-profile.dto';

export class UpdateLearnerProfileDto extends PartialType(CreateLearnerProfileDto) {}
