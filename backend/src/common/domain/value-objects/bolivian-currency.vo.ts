/**
 * Value Object para operaciones monetarias en Bolivianos (BOB - Bs.)
 * Garantiza redondeo exacto a 2 decimales para cumplimiento tributario SIAT / SIN
 * y previene errores de imprecisión en aritmética de punto flotante en JavaScript.
 */
export class BolivianCurrency {
  private readonly amount: number;

  constructor(amount: number) {
    this.amount = BolivianCurrency.round(amount);
  }

  public static of(amount: number): BolivianCurrency {
    return new BolivianCurrency(amount);
  }

  public static round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  public get value(): number {
    return this.amount;
  }

  public plus(other: number | BolivianCurrency): BolivianCurrency {
    const val = other instanceof BolivianCurrency ? other.value : other;
    return new BolivianCurrency(this.amount + val);
  }

  public minus(other: number | BolivianCurrency): BolivianCurrency {
    const val = other instanceof BolivianCurrency ? other.value : other;
    return new BolivianCurrency(this.amount - val);
  }

  public times(multiplier: number): BolivianCurrency {
    return new BolivianCurrency(this.amount * multiplier);
  }

  public format(): string {
    return `Bs. ${this.amount.toFixed(2)}`;
  }
}
