const XLSX = require('xlsx');
const path = require('path');

// --- UTM to Lat/Lon Conversion Helper ---
// Based on Karney's algorithm (simplified for WGS84)
function utmToLatLon(easting, northing, zone, band) {
    // WGS84 Constants
    const a = 6378137.0;
    const f = 1 / 298.257223563;
    const k0 = 0.9996;
    const e = Math.sqrt(f * (2 - f));

    const x = easting - 500000;
    const y = (band >= 'N') ? northing : northing - 10000000;

    const m = y / k0;
    const mu = m / (a * (1 - Math.pow(e, 2) / 4 - 3 * Math.pow(e, 4) / 64 - 5 * Math.pow(e, 6) / 256));

    const e1 = (1 - Math.sqrt(1 - Math.pow(e, 2))) / (1 + Math.sqrt(1 - Math.pow(e, 2)));
    const J1 = (3 * e1 / 2 - 27 * Math.pow(e1, 3) / 32);
    const J2 = (21 * Math.pow(e1, 2) / 16 - 55 * Math.pow(e1, 4) / 32);
    const J3 = (151 * Math.pow(e1, 3) / 96);
    const J4 = (1097 * Math.pow(e1, 4) / 512);

    const fp = mu + J1 * Math.sin(2 * mu) + J2 * Math.sin(4 * mu) + J3 * Math.sin(6 * mu) + J4 * Math.sin(8 * mu);

    const e2 = Math.pow(e, 2);
    const C1 = e2 * Math.pow(Math.cos(fp), 2) / (1 - e2); 
    const T1 = Math.pow(Math.tan(fp), 2);
    const R1 = a * (1 - e2) / Math.pow(1 - e2 * Math.pow(Math.sin(fp), 2), 1.5);
    const N1 = a / Math.sqrt(1 - e2 * Math.pow(Math.sin(fp), 2));
    const D = x / (N1 * k0);

    const Q1 = N1 * Math.tan(fp) / R1;
    const Q2 = D * D / 2;
    const Q3 = (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * e2) * Math.pow(D, 4) / 24;
    const Q4 = (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * e2 - 3 * C1 * C1) * Math.pow(D, 6) / 720;
    
    let lat = fp - Q1 * (Q2 - Q3 + Q4);
    
    const Q5 = D;
    const Q6 = (1 + 2 * T1 + C1) * Math.pow(D, 3) / 6;
    const Q7 = (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * e2 + 24 * T1 * T1) * Math.pow(D, 5) / 120;
    
    let lng = (Q5 - Q6 + Q7) / Math.cos(fp);

    lat = lat * 180 / Math.PI;
    lng = lng * 180 / Math.PI;
    
    // Central Meridian of the zone
    const zoneNumber = parseInt(zone, 10);
    const centralMeridian = (zoneNumber - 1) * 6 - 180 + 3;
    lng = lng + centralMeridian;

    return { lat, lng };
}


const filePath = path.resolve(__dirname, 'tower_template.xlsx');

console.log(`Reading file: ${filePath}`);

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames.find(n => n.includes('Towers')) || workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const items = XLSX.utils.sheet_to_json(worksheet);

  let updatedCount = 0;
  const updatedItems = items.map(item => {
    // Check if UTM fields exist and lat/lng are missing or need update
    if (item.utm_easting && item.utm_northing && item.utm_zone && item.utm_band) {
      console.log(`Converting UTM for Tower ${item.tower_number || 'Unknown'}: ${item.utm_easting}, ${item.utm_northing} Zone ${item.utm_zone}${item.utm_band}`);
      
      const { lat, lng } = utmToLatLon(
        parseFloat(item.utm_easting),
        parseFloat(item.utm_northing),
        item.utm_zone,
        item.utm_band
      );

      item.lat = lat;
      item.lng = lng;
      updatedCount++;
    }
    return item;
  });

  if (updatedCount > 0) {
    const newWorksheet = XLSX.utils.json_to_sheet(updatedItems);
    // Replace the sheet
    workbook.Sheets[sheetName] = newWorksheet;
    
    XLSX.writeFile(workbook, filePath);
    console.log(`Successfully updated ${updatedCount} rows with converted coordinates.`);
  } else {
    console.log('No rows needed conversion (or UTM fields missing).');
  }

} catch (error) {
  console.error('Error processing file:', error.message);
}
