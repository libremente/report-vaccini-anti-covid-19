import { sumDoseX, filterByAreaITA, replaceArea, aggrBy } from "./utils";
import _ from 'lodash';
const baseURL =
  "https://raw.githubusercontent.com/italia/covid19-opendata-vaccini/master/dati";

const sommVaxSummaryURL = `${baseURL}/somministrazioni-vaccini-summary-latest.json`;
const sommVaxDetailURL = `${baseURL}/somministrazioni-vaccini-latest.json`;
const deliveryVaxDetailURL = `${baseURL}/consegne-vaccini-latest.json`;
const vaxSummaryURL = `${baseURL}/vaccini-summary-latest.json`;
const vaxLocationsURL = `${baseURL}/punti-somministrazione-latest.json`;

const anagraficaSummaryURL = `${baseURL}/anagrafica-vaccini-summary-latest.json`;
const puntiSommSummaryURL = `${baseURL}/punti-somministrazione-latest.json`;
const lastUpdateURL = `${baseURL}/last-update-dataset.json`;

const elaborate = (data) => {
  
  const tot = data.dataSommVaxSummary.data
    .filter(filterByAreaITA)
    .reduce(sumDoseX("totale"), 0);
  // datatable and map
  const dataSomeVaxDetail = data.dataSommVaxDetail.data.map(replaceArea);

  const deliverySummary = data.dataVaxSummary.data.map(replaceArea);

  // categories and ages summary
  const categoriesAndAges = data.dataProfileSummary.data;
  const categories = [
    {
      name: "Operatori Sanitari e Sociosanitari",
      code: "categoria_operatori_sanitari_sociosanitari",
      total: categoriesAndAges.reduce(
        sumDoseX("categoria_operatori_sanitari_sociosanitari"),
        0
      ),
    },
    {
      name: "Personale non sanitario",
      code: "categoria_personale_non_sanitario",
      total: categoriesAndAges.reduce(
        sumDoseX("categoria_personale_non_sanitario"),
        0
      ),
    },
    {
      name: "Ospiti Strutture Residenziali",
      code: "categoria_ospiti_rsa",
      total: categoriesAndAges.reduce(sumDoseX("categoria_ospiti_rsa"), 0),
    }
  ];
  const categoriesByRegionRAW = data.dataSommVaxSummary.data.reduce(
    aggrBy("area"),
    {}
  );

  let categoriesByRegions = {};
  Object.keys(categoriesByRegionRAW).map((x) => {
    categoriesByRegions[x] = [
      {
        name: "Operatori Sanitari e Sociosanitari",
        code: "categoria_operatori_sanitari_sociosanitari",
        total: categoriesByRegionRAW[x].reduce(
          sumDoseX("categoria_operatori_sanitari_sociosanitari"),
          0
        ),
      },
      {
        name: "Personale non sanitario",
        code: "categoria_personale_non_sanitario",
        total: categoriesByRegionRAW[x].reduce(
          sumDoseX("categoria_personale_non_sanitario"),
          0
        ),
      },
      {
        name: "Ospiti Strutture Residenziali",
        code: "categoria_ospiti_rsa",
        total: categoriesByRegionRAW[x].reduce(
          sumDoseX("categoria_ospiti_rsa"),
          0
        ),
      }
    ];
    return categoriesByRegions;
  });

  deliverySummary.forEach(ds => {
    ds['byCategory'] = categoriesByRegions[ds.code].reduce(
      aggrBy("code"),
      {}
    )
  })

  const deliveredByArea = _.groupBy(deliverySummary, 'code');

  const locations = data.dataVaxLocations.data.map(replaceArea);

  let maxNumberOfLocations = 0

  const locationsByRegion = _(data.dataVaxLocations.data.map(replaceArea))
  .groupBy('area')
  .map((items, area)=>{
    maxNumberOfLocations = maxNumberOfLocations > items.length ? maxNumberOfLocations : items.length;
    return {area: area, locations: items.length}
  }).value();

  const totalDeliverySummary = _(data.dataSommVaxDetail.data.map(replaceArea))
  .groupBy('code')
  .map((items, code)=>{
    const details = _.head(deliveredByArea[code])
    return ({
      code: code,
      area: _.head(items)?.area, 
      categoria_operatori_sanitari_sociosanitari: _.sumBy(items, 'categoria_operatori_sanitari_sociosanitari'),
      categoria_ospiti_rsa: _.sumBy(items, 'categoria_ospiti_rsa'),
      categoria_personale_non_sanitario: _.sumBy(items, 'categoria_personale_non_sanitario'),
      byAge: _(items)
                .groupBy('fascia_anagrafica')
                .map((rows, age)=>{
                  const dosi_somministrate = _.sumBy(rows, (r)=>r.sesso_maschile + r.sesso_femminile);
                  const percentage = dosi_somministrate/(details.dosi_consegnate || 1);
                  return {
                    age: age,
                    fascia_anagrafica: age,
                    dosi_somministrate,
                    dosi_consegnate: details.dosi_consegnate || 0,
                    percentuale_somministrazione: +(percentage*100).toFixed(1),
                    area: _.head(items)?.area,
                    totale: dosi_somministrate
                }}).value(),
      sesso_femminile: _.sumBy(items, 'sesso_femminile'),
      sesso_maschile: _.sumBy(items, 'sesso_maschile'),
      dosi_consegnate: details.dosi_consegnate || 0,
      dosi_somministrate: details.dosi_somministrate || 0,
      percentuale_somministrazione: details.percentuale_somministrazione || 0
    })}).value();

    const totalDeliverySummaryByAge = _(data.dataSommVaxDetail.data.map(replaceArea))
      .groupBy(i => i['fascia_anagrafica'].toString().trim())
      .map((rows, age)=>{
        const details = _(rows).groupBy('code').map((rowsData, code)=>{
          const dosi_somministrate = _.sumBy(rowsData, (r)=>r.sesso_maschile + r.sesso_femminile);
          const percentage = dosi_somministrate/(_.head(deliveredByArea[code]).dosi_consegnate || 1);
          return {
            age: age,
            dosi_somministrate,
            sesso_maschile: _.sumBy(rowsData, 'sesso_maschile'),
            sesso_femminile: _.sumBy(rowsData, 'sesso_femminile'),
            code: code,
            dosi_consegnate: _.head(deliveredByArea[code]).dosi_consegnate || 0,
            percentuale_somministrazione: +(percentage*100).toFixed(1),
            area: _.head(rowsData).area,
            //details: rows
          }
        })
        .value()
        return {
          age: age,
          details: details
      }})
      .groupBy('age')
      .value()
      
 
  const gender = {
    gen_m: categoriesAndAges.reduce(sumDoseX("sesso_maschile"), 0),
    gen_f: categoriesAndAges.reduce(sumDoseX("sesso_femminile"), 0),
  };

  const timestamp = data.dataLastUpdate.ultimo_aggiornamento;
  const aggr = {
    totalDeliverySummaryByAge,
    timestamp,
    tot,
    deliverySummary,
    categoriesAndAges,
    categories,
    categoriesByRegions,
    locations,
    gender,
    locationsByRegion,
    maxNumberOfLocations,
    totalDeliverySummary
  };
  console.log(aggr)
  return aggr;
};

export const loadData = async () => {
  const [
    resSommVaxSummary, 
    resSommVaxDetail, 
    resVaxSummary,
    resProfileSummaryURL,
    resVaxLocations,
    resLastUpdate
  ] = await Promise.all([
    fetch(sommVaxSummaryURL), 
    fetch(sommVaxDetailURL), 
    fetch(vaxSummaryURL),
    fetch(anagraficaSummaryURL),
    fetch(vaxLocationsURL),
    fetch(lastUpdateURL)
  ])

  const [
    dataSommVaxSummary,
    dataSommVaxDetail,
    dataVaxSummary,
    dataProfileSummary,
    dataVaxLocations,
    dataLastUpdate
  ] = await Promise.all([
    resSommVaxSummary.json(),
    resSommVaxDetail.json(),
    resVaxSummary.json(),
    resProfileSummaryURL.json(),
    resVaxLocations.json(),
    resLastUpdate.json()
  ])
  
  return {
    ...elaborate({
      dataSommVaxSummary,
      dataSommVaxDetail,
      dataVaxSummary,
      dataProfileSummary,
      dataLastUpdate,
      dataVaxLocations,
    }),
  };
};
