import { PartialType } from '@nestjs/mapped-types';
import { CreateStructureCatalogDto } from './create-structure-catalog.dto';

export class UpdateStructureCatalogDto extends PartialType(CreateStructureCatalogDto) {}
