import { BranchEntity } from './branch.entity.js';
import { DepartamentoBolivia } from '../../../common/constants/bolivia-regions.constant.js';

export abstract class BranchesRepository {
  abstract findAll(soloActivas?: boolean): BranchEntity[];
  abstract findById(id: string): BranchEntity | null;
  abstract findByDepartment(depto: DepartamentoBolivia): BranchEntity[];
  abstract create(branch: BranchEntity): BranchEntity;
  abstract update(id: string, updates: Partial<BranchEntity>): BranchEntity;
}
