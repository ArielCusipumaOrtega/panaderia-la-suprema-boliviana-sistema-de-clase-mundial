/**
 * Excepciones de Dominio (Clean Architecture)
 * Independientes de frameworks HTTP o capas de infraestructura.
 */
export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InsufficientStockDomainException extends DomainException {
  constructor(
    public readonly productName: string,
    public readonly requested: number,
    public readonly available: number,
  ) {
    super(
      `Stock insuficiente para el producto '${productName}'. Solicitado: ${requested}, Disponible: ${available}`,
    );
  }
}

export class EntityNotFoundDomainException extends DomainException {
  constructor(entityName: string, identifier: string) {
    super(`${entityName} con identificador '${identifier}' no fue encontrado.`);
  }
}

export class BusinessRuleViolationDomainException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
