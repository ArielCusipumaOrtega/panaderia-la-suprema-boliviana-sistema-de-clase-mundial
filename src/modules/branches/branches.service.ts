import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { BranchesRepository } from './domain/branches.repository.interface.js';
import { BranchEntity } from './domain/branch.entity.js';
import { ProductsRepository } from '../products/domain/products.repository.interface.js';
import { CreateBranchDto } from './dto/create-branch.dto.js';
import { DepartamentoBolivia } from '../../common/constants/bolivia-regions.constant.js';

@Injectable()
export class BranchesService {
  constructor(
    private readonly branchesRepo: BranchesRepository,
    private readonly productsRepo: ProductsRepository,
  ) {}

  findAll(departamento?: DepartamentoBolivia): BranchEntity[] {
    const list = this.branchesRepo.findAll(true);
    if (departamento) {
      return list.filter((b) => b.departamento === departamento);
    }
    return list;
  }

  findById(id: string): BranchEntity {
    const branch = this.branchesRepo.findById(id);
    if (!branch) {
      throw new NotFoundException(
        `Sucursal con ID o código '${id}' no encontrada`,
      );
    }
    return branch;
  }

  create(dto: CreateBranchDto): BranchEntity {
    const existing = this.branchesRepo.findById(dto.codigo);
    if (existing) {
      throw new ConflictException(
        `Ya existe una sucursal con el código ${dto.codigo}`,
      );
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

    const created = this.branchesRepo.create(newBranch);

    // Inicializar stock de productos para la nueva sucursal
    const allProducts = this.productsRepo.findAll();
    for (const p of allProducts) {
      this.productsRepo.updateStock(created.id, p.id, 50);
    }

    return created;
  }

  toggleActive(id: string): BranchEntity {
    const branch = this.findById(id);
    return this.branchesRepo.update(id, { activa: !branch.activa });
  }
}
