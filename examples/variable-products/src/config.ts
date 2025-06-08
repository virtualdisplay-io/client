export interface ConfigOption {
  id: string;
  name: string;
}

export const tops: ConfigOption[] = [
  { id: 'Deens_ovaal_Bol_220x110_4cm', name: 'Deens Ovaal' },
  { id: 'Deens_Oval_Recht_220x110_4cm', name: 'Deens Ovaal Recht' },
  { id: 'Deens_Oval_Verjongd_220x110_4cm', name: 'Deens Ovaal Verjongd' },
  { id: 'Kiezel_220_125_4cm_Bol', name: 'Kiezel' },
  { id: 'Kiezel_220_125_4cm_Recht', name: 'Kiezel Recht' },
  { id: 'Kiezel_220_125_4cm_Verjongd', name: 'Kiezel Verjongd' },
  { id: 'Oval_220x110_Bol_4cm', name: 'Oval' },
  { id: 'Oval_220x110_Recht_4cm', name: 'Oval Recht' },
  { id: 'Oval_220x110_Verjongd_4cm', name: 'Oval Verjongd' },
  { id: 'Rechthoekig_220x100_Bol_4cm', name: 'Rechthoekig' },
  { id: 'Rechthoekig_220x100_Boomschors_4cm', name: 'Rechthoekig Boomschors' },
  { id: 'Rechthoekig_220x100_Recht_4cm', name: 'Rechthoekig Recht' },
  { id: 'Rechthoekig_220x100_Verjongd_4cm', name: 'Rechthoekig Verjongd' },
];

export const topVariants: string[] = [
  'Oak-Micegrey',
  'Oak',
  'Nature-White',
  'Oak-Black',
];

export const legs: ConfigOption[] = [
  { id: 'Crosse001', name: 'Cross' },
  { id: 'North001', name: 'North' },
  { id: 'U_poot001', name: 'U' },
  { id: 'Westfield001', name: 'West' },
  { id: 'X_poot_dun001', name: 'X' },
];

export const legVariants: string[] = ['White powdercoat', 'Black powdercoat'];
