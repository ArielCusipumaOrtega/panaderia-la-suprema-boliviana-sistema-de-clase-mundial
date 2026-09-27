import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService, BranchEntity } from '../../database/database.service.js';
import { CreateBranchDto } from './dto/create-branch.dto.js';
import { DepartamentoBolivia } from '../../common/constants/bolivia-regions.constant.js';

@Injectable()
export class BranchesService {
  constructor(private readonly db: DatabaseService) {}

  findAll(departamento?: DepartamentoBolivia) {
    let result = this.db.branches.filter((b) => b.activa);
    if (departamento) {
      result = result.filter((b) => b.departamento === departamento);
    }
    return result;
  }

  findById(id: string): BranchEntity {
    const branch = this.db.branches.find((b) => b.id === id || b.codigo === id);
    if (!branch) {
      throw new NotFoundException(`Sucursal con ID o código '${id}' no encontrada`);
    }
    return branch;
  }

  create(dto: CreateBranchDto): BranchEntity {
    const existing = this.db.branches.find(
      (b) => b.codigo.toUpperCase() === dto.codigo.toUpperCase(),
    );
    if (existing) {
      throw new ConflictException(`Ya existe una sucursal con el código ${dto.codigo}`);
    }

    const newBranch: BranchEntity = {
      id: `suc-${dto.codigo.toLowerCase()}-${uuidv4().substring(0, 4)}`,
      codigo: dto.codigo.toUpperCase(),
      nombre: dto.nombre,
      departamento: dto.departamento,
      ciudad: dto.ciudad,
      direccion: dto.direccion,
      telefono: dto.telefono,
      horarioAtencion: dto.horarioAtencion,
      esMatriz: dto.esMatriz || false,
      capacidadProduccionDiaria: dto.capacidadProduccionDiaria,
      activa: true,
    };

    this.db.branches.push(newBranch);

    // Inicializar stock de productos para la nueva sucursal
    for (const p of this.db.products) {
      this.db.stock.push({
        id: `stk-${newBranch.id}-${p.id}`,
        productoId: p.id,
        sucursalId: newBranch.id,
        cantidadDisponible: 50,
        cantidadMinimaAlerta: 10,
        ultimaActualizacion: new Date().toISOString(),
      });
    }

    this.db.save();
    return newBranch;
  }

  toggleActive(id: string): BranchEntity {
    const branch = this.findById(id);
    branch.activa = !branch.activa;
    this.db.save();
    return branch;
  }
}
