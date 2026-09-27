export enum DepartamentoBolivia {
  LA_PAZ = 'La Paz',
  SANTA_CRUZ = 'Santa Cruz',
  COCHABAMBA = 'Cochabamba',
  CHUQUISACA = 'Chuquisaca',
  ORURO = 'Oruro',
  POTOSI = 'Potosí',
  TARIJA = 'Tarija',
  BENI = 'Beni',
  PANDO = 'Pando',
}

export interface RegionShippingInfo {
  departamento: DepartamentoBolivia;
  ciudadesPrincipales: string[];
  costoEnvioExpressBs: number;
  costoEnvioNacionalBs: number;
  tiempoEstimadoExpressMin: number;
  tiempoEstimadoNacionalHoras: number;
  tieneSucursalFisica: boolean;
}

export const REGIONES_BOLIVIA: Record<DepartamentoBolivia, RegionShippingInfo> = {
  [DepartamentoBolivia.SANTA_CRUZ]: {
    departamento: DepartamentoBolivia.SANTA_CRUZ,
    ciudadesPrincipales: ['Santa Cruz de la Sierra', 'Montero', 'Warnes', 'Cotoca', 'La Guardia', 'Camiri'],
    costoEnvioExpressBs: 10,
    costoEnvioNacionalBs: 25,
    tiempoEstimadoExpressMin: 35,
    tiempoEstimadoNacionalHoras: 24,
    tieneSucursalFisica: true,
  },
  [DepartamentoBolivia.LA_PAZ]: {
    departamento: DepartamentoBolivia.LA_PAZ,
    ciudadesPrincipales: ['La Paz', 'El Alto', 'Viacha', 'Achocalla', 'Caranavi'],
    costoEnvioExpressBs: 12,
    costoEnvioNacionalBs: 25,
    tiempoEstimadoExpressMin: 40,
    tiempoEstimadoNacionalHoras: 24,
    tieneSucursalFisica: true,
  },
  [DepartamentoBolivia.COCHABAMBA]: {
    departamento: DepartamentoBolivia.COCHABAMBA,
    ciudadesPrincipales: ['Cochabamba', 'Quillacollo', 'Sacaba', 'Tiquipaya', 'Colcapirhua', 'Punata'],
    costoEnvioExpressBs: 10,
    costoEnvioNacionalBs: 20,
    tiempoEstimadoExpressMin: 30,
    tiempoEstimadoNacionalHoras: 24,
    tieneSucursalFisica: true,
  },
  [DepartamentoBolivia.CHUQUISACA]: {
    departamento: DepartamentoBolivia.CHUQUISACA,
    ciudadesPrincipales: ['Sucre', 'Monteagudo', 'Camargo', 'Tarabuco'],
    costoEnvioExpressBs: 12,
    costoEnvioNacionalBs: 30,
    tiempoEstimadoExpressMin: 35,
    tiempoEstimadoNacionalHoras: 24,
    tieneSucursalFisica: true,
  },
  [DepartamentoBolivia.ORURO]: {
    departamento: DepartamentoBolivia.ORURO,
    ciudadesPrincipales: ['Oruro', 'Huanuni', 'Challapata'],
    costoEnvioExpressBs: 10,
    costoEnvioNacionalBs: 25,
    tiempoEstimadoExpressMin: 30,
    tiempoEstimadoNacionalHoras: 24,
    tieneSucursalFisica: true,
  },
  [DepartamentoBolivia.POTOSI]: {
    departamento: DepartamentoBolivia.POTOSI,
    ciudadesPrincipales: ['Potosí', 'Uyuni', 'Tupiza', 'Villazón', 'Llallagua'],
    costoEnvioExpressBs: 12,
    costoEnvioNacionalBs: 30,
    tiempoEstimadoExpressMin: 40,
    tiempoEstimadoNacionalHoras: 36,
    tieneSucursalFisica: true,
  },
  [DepartamentoBolivia.TARIJA]: {
    departamento: DepartamentoBolivia.TARIJA,
    ciudadesPrincipales: ['Tarija', 'Yacuiba', 'Bermejo', 'Villa Montes'],
    costoEnvioExpressBs: 10,
    costoEnvioNacionalBs: 30,
    tiempoEstimadoExpressMin: 35,
    tiempoEstimadoNacionalHoras: 24,
    tieneSucursalFisica: true,
  },
  [DepartamentoBolivia.BENI]: {
    departamento: DepartamentoBolivia.BENI,
    ciudadesPrincipales: ['Trinidad', 'Riberalta', 'Guayaramerín', 'Rurrenabaque', 'San Borja'],
    costoEnvioExpressBs: 15,
    costoEnvioNacionalBs: 40,
    tiempoEstimadoExpressMin: 45,
    tiempoEstimadoNacionalHoras: 48,
    tieneSucursalFisica: true,
  },
  [DepartamentoBolivia.PANDO]: {
    departamento: DepartamentoBolivia.PANDO,
    ciudadesPrincipales: ['Cobija', 'Porvenir', 'Puerto Rico'],
    costoEnvioExpressBs: 15,
    costoEnvioNacionalBs: 45,
    tiempoEstimadoExpressMin: 45,
    tiempoEstimadoNacionalHoras: 48,
    tieneSucursalFisica: true,
  },
};
