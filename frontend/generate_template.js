const XLSX = require('xlsx');
const path = require('path');

// --- Towers ---
const towerHeaders = [
  'code',
  'tower_number',
  'type',
  'utm_easting',
  'utm_northing',
  'utm_zone',
  'utm_band',
  'lat',
  'lng',
  'altitude',
  'distance',
  'height',
  'weight',
  'embargo',
  'deflection',
  'structureType',
  'color',
  'isHidden'
];

const towerData = [
  {
    code: 1,
    tower_number: 'T-01',
    type: 'Suspension',
    utm_easting: 333675,
    utm_northing: 7394520,
    utm_zone: 23,
    utm_band: 'K',
    lat: null, // Will be calculated
    lng: null, // Will be calculated
    altitude: 760,
    distance: 300,
    height: 45,
    weight: 2500,
    embargo: 'None',
    deflection: 0.5,
    structureType: 'Lattice',
    color: 'Gray',
    isHidden: false
  }
];

// --- Foundations ---
const foundationHeaders = [
  'project',
  'revision',
  'description',
  'excavation_volume',
  'concrete_volume',
  'backfill_volume',
  'steel_volume'
];

const foundationData = [
  {
    project: 'LT-230kV',
    revision: 'Rev.0',
    description: 'F-TYPE-A',
    excavation_volume: 15.5,
    concrete_volume: 8.2,
    backfill_volume: 12.0,
    steel_volume: 0.45
  }
];

// --- Activities (Tasks) ---
const activityHeaders = [
  'code',
  'stage',
  'group',
  'name',
  'unit'
];

const activityData = [
  {
    code: 101,
    stage: 'Civil',
    group: 'Foundations',
    name: 'Excavation',
    unit: 'm3'
  }
];

function createTemplate(name, headers, data) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data, { header: headers });
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    const outputPath = path.resolve(__dirname, `${name}_template.xlsx`);
    XLSX.writeFile(wb, outputPath);
    console.log(`Template created at: ${outputPath}`);
}

createTemplate('tower', towerHeaders, towerData);
createTemplate('foundation', foundationHeaders, foundationData);
createTemplate('activity', activityHeaders, activityData);
