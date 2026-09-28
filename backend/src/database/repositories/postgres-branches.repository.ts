import { Injectable, NotFoundException } from '@nestjs/common';
import { BranchesRepository } from '../../modules/branches/domain/branches.repository.interface.js';
import { BranchEntity } from '../../modules/branches/domain/branch.entity.js';
import { DepartamentoBolivia } from '../../common/constants/bolivia-regions.constant.js';
import { DatabaseService } from '../database.service.js';

@Injectable()
export class PostgresBranchesRepository implements BranchesRepository {
  constructor(private readonly db: DatabaseService) {}

  findAll(soloActivas: boolean = false): BranchEntity[] {
    if (soloActivas) {
      return this.db.branches.filter((b) => b.activa);
    }
    return this.db.branches;
  }

  findById(id: string): BranchEntity | null {
    return this.db.branches.find((b) => b.id === id || b.codigo === id) || null;
  }

  findByDepartment(depto: DepartamentoBolivia): BranchEntity[] {
    return this.db.branches.filter((b) => b.departamento === depto && b.activa);
  }

  create(branch: BranchEntity): BranchEntity {
    this.db.branches.push(branch);
    this.db.save();
    return branch;
  }

  update(id: string, updates: Partial<BranchEntity>): BranchEntity {
    const idx = this.db.branches.findIndex((b) => b.id === id);
    if (idx === -1) {
      throw new NotFoundException(`Sucursal con ID '${id}' no encontrada`);
    }
    this.db.branches[idx] = { ...this.db.branches[idx], ...updates };
    this.db.save();
    return this.db.branches[idx];
  }
}
