import { useState, useEffect } from 'react';
import { HeaderBar } from "./components/HeaderBar";
import { FooterBar } from "./components/FooterBar";
import { MapArea } from "./components/MapArea";
import { MapAreaByDeliveryLocation } from "./components/MapAreaByDeliveryLocation";
import { StaticBlock } from "./components/StaticBlock";
import { LocationsTable } from "./components/LocationsTable";
import { Table } from "./components/Table";
import { Total } from "./components/Total";
import { loadData } from "./loadData";
import { BarChart } from "./components/BarChart";
import { HBarChart } from "./components/HBarChart";
import { hideLoader } from "./utils";
import "./App.css";
import { find, head, max } from "lodash";


function App() {
  const [summary, setSummary] = useState({});
  const [deliveryTableData, setDeliveryTableData] = useState([]);
  const [deliverySelectedRegion, setDeliverySelectedRegion] = useState(null);
  const [categorySelectedRegion, setCategorySelectedRegion] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [categoryMapData, setCategoryMapData] = useState([]);
  const [totalDelivery, setTotalDelivery] = useState(0);
  const [totalAgeByGender, setTotalAgeByGender] = useState({});
  const [deliveryBarChartData, setdeliveryBarChartDataData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedAge, setSelectedAge] = useState(null);
  const [selectedCodeCategory, setSelectedCodeCategory] = useState(null);
  const [totalByCategory, setTotalByCategory] = useState(0);
  const [locationTableRef, setLocationTableRef] = useState(0);
  const [locationRegionSelect, setLocationRegionSelect] = useState(null);
  const [categoryMapField, setCategoryMapField] = useState('dosi_somministrate');

  useEffect(() => {
    loadData().then((d) => {
      hideLoader();
      setSummary(d);
      setdeliveryBarChartDataData(d.categoriesAndAges);
      setTotalAgeByGender(d.gender);
      setDeliveryTableData(d.totalDeliverySummary);
      setTotalDelivery(d.tot);
      setCategoryData(d.categories);
      setTotalByCategory(d.tot);
      setCategoryMapData(d?.totalDeliverySummary)
    });
  }, []);

  const resetFilter = () => {
    setDeliverySelectedRegion(null);
    setDeliveryTableData(summary.totalDeliverySummary);
    setTotalDelivery(summary.tot);
    setTotalAgeByGender(summary.gender)
    setdeliveryBarChartDataData(summary.categoriesAndAges)
    setSelectedCodeCategory(null);
    setSelectedLocation(null);
    setLocationRegionSelect(null);
  }

  const handleCountryClickLocations = (countryIndex) => {
    setSelectedLocation(countryIndex);
  };

  const fillMapDeliveryArea = ({region, maxValue, field}) => {
    let scaleOp = 0
    if(region.code === deliverySelectedRegion){
       scaleOp = 1 
    }else if(!deliverySelectedRegion){
      scaleOp = max([region[field]/maxValue,0.1])
    }else{
      const valueToFill = region[field] / 2
      scaleOp = max([valueToFill, 0.1])
    }
    return `rgba(0,102,204,${scaleOp}) `
  }

  const handleMapDeliveryClick = (region) => {

    if(deliverySelectedRegion === region.code){
      setDeliverySelectedRegion(null);
      setDeliveryTableData(summary.totalDeliverySummary);
      setTotalDelivery(summary.tot);
      setTotalAgeByGender(summary.gender)
      setdeliveryBarChartDataData(summary.categoriesAndAges)
    }else{
      const deliveryTableFilteredData = find(deliveryTableData, d => d.code === region.code);

      setDeliveryTableData([deliveryTableFilteredData])
      setdeliveryBarChartDataData(deliveryTableFilteredData.byAge)
      setDeliverySelectedRegion(region.code)
      setTotalDelivery(region.dosi_somministrate)
      setTotalAgeByGender({ gen_m: deliveryTableFilteredData.sesso_maschile, gen_f: deliveryTableFilteredData.sesso_femminile });
    }
  }

  const handleDeliveryBarChartClick = (data) => {
    setDeliverySelectedRegion(null);

    if(data.fascia_anagrafica === selectedAge){
      setSelectedAge(null);
      setDeliveryTableData(summary.totalDeliverySummary);
      setTotalAgeByGender(summary.gender)
      setTotalDelivery(summary.tot)
    }else{
      setTotalDelivery(data.totale)
      setSelectedAge(data.fascia_anagrafica);
      setDeliveryTableData(head(summary.totalDeliverySummaryByAge[data.fascia_anagrafica]).details);
      setTotalAgeByGender({ gen_m: data.sesso_maschile, gen_f: data.sesso_femminile });
    }    

  }

  const resetCategoryFilter = () => {
    setCategorySelectedRegion(null)
    setCategoryData(summary.categories);
    setTotalByCategory(summary.tot)
    setSelectedCodeCategory(null)
    setCategoryMapField('dosi_somministrate')
  }

  const handleMapCategoryClick = (region) => {
    
    if(categorySelectedRegion === region.code){
      resetCategoryFilter()
    }else{
      setCategorySelectedRegion(region.code)
      setCategoryData(summary.categoriesByRegions[region.code]);
      setTotalByCategory(region.dosi_somministrate)
    }
  }

  const fillMapCategoryArea = ({region, maxValue, field}) => {
    let scaleOp = 0
    if(region.code === categorySelectedRegion){
       scaleOp = 1 
    }else if(!categorySelectedRegion){
      scaleOp = max([region[field]/maxValue,0.1])
    }else{
      const valueToFill = region[field] / (2*maxValue)
      scaleOp = max([valueToFill, 0.1])
    }
    return `rgba(0,102,204,${scaleOp}) `
  }

  const handleCategoryBarChartClick = (cat) => {

    if (cat) {
      setSelectedCodeCategory(cat.code)
      setCategoryMapField(cat.code)
      setTotalByCategory(cat.total)
    } else {
      resetCategoryFilter()
    }
  }

  return (
    <div>
      <HeaderBar />
      <div className="container">
        <div className="row">
          <div className="col-12 d-flex justify-content-center">
            <Total className="mb-3" summary={{ ...summary }} />
          </div>
        </div>
        <div className="row">
          <div className="col-12 col-md-6 font-25">
            <StaticBlock
              classes="bg-primary text-white"
              text="Il 27 dicembre sono state consegnate 9.750 dosi di vaccino, interamente somministrate."
            />
          </div>
          <div className="col-12 col-md-6 font-25">
            <StaticBlock
              classes="bg-primary text-white" 
              text="Dal 30 dicembre al 07 gennaio sono state consegnate 908.700 dosi di vaccino. L'11 gennaio sono state consegnate 75.075 dosi di vaccino."
            />
          </div>
          <div className="col-12">
            <div
              className="text-center font-22"
            >
              <StaticBlock
                classes="text-black text-uppercase font-weight-bold"
                text="Le somministrazioni delle 983.775 dosi di vaccino su tutto il territorio sono iniziate il 31 dicembre."
              />
            </div>
          </div>
        </div>


        <div className="row">
          <div className="col-12 d-flex justify-content-end">
            <img alt="reset" src="reset.png" onClick={resetFilter} />
          </div>

        </div>
        <div className="row" style={{ backgroundColor: '#F8FBFE' }}>
          <div className="col-12 col-lg-5 h-100 order-md-2 order-lg-1 ">
            <div className="container-info d-none d-sm-none d-md-flex d-lg-flex" >
              <span data-toggle="tooltip" title="% somministrazioni su dosi consegnate" className="circle-info">i</span>
            </div>
            <Table
              deliveryTableData={deliveryTableData}
              className="mr-5 h-100"
            />
          </div>
          <div className="col-12 col-lg-7 order-md-1 order-lg-2">
            <div className="p-4 position-relative d-lg-none">
              <div className="w-100 h-100 d-flex justify-content-start pr-5">
                <img src="logo.png" width="35" height="35" alt="Logo" />
                <h5 className="pl-3 pl-sm-1">Distribuzione vaccinazioni<br /> rispetto alle consegne</h5>
              </div>
            </div>
            <div className="p-4 position-relative d-none d-lg-block" style={{ left: '300px', top: '190px' }}>
              <div className="w-100 h-100 d-flex justify-content-start pr-5">
                <img src="logo.png" width="35" height="35" alt="Logo" />
                <h5 className="pl-3 pl-sm-1">Distribuzione vaccinazioni<br /> rispetto alle consegne</h5>
              </div>
            </div>
            <MapArea
              fillMapDeliveryArea={fillMapDeliveryArea}
              summary={deliveryTableData}
              handleMapDeliveryClick={handleMapDeliveryClick}
              tooltip={(r)=>r.area + " " + (r.percentuale_somministrazione && r.percentuale_somministrazione.toLocaleString('it')) + "%"}
              fillBy="percentuale_somministrazione"
              className="ml-5 w-100 h-100"
            />
            <div className="p-4 position-relative">
              <div className="text-black w-100">
                <div className="w-100 h-100 d-flex justify-content-start ">
                  <img src="logo.png" width="45" height="45" alt="Logo" className="mt-3" />
                  <span className="font-50 pl-3" >{totalDelivery.toLocaleString('it')}</span>
                </div>
                <div className="w-100  h-100 d-flex justify-content-start">
                  <h5>Totale vaccinazioni</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row position-powerbi" style={{ backgroundColor: '#F8FBFE' }}>
          <div className="col-12 col-md-6 d-flex align-items-end testo-info-campania">
          Le quantità consegnate sono calcolate considerando, al momento, cinque dosi per fiala. Pertanto, eventuali valori percentuali superiori a 100 evidenziano l'utilizzo della sesta dose.
          </div>
          <div className="col-12 col-md-6  position-relative" >
            <div className="bg-gradient-bar"></div>
            <div className="row">
              <div className="col-6 d-flex align-items-baseline">
                <img src="user_f.png" alt="users" width="75px" />
                <span className="text-center font-weight-light text-white">
                  <h3 className="total_gender">{totalAgeByGender?.gen_f?.toLocaleString('it')}</h3>
                </span>
              </div>
              <div className="col-6  d-flex align-items-baseline">
                <img src="user_m.png" alt="users" width="75px" />
                <span className="text-center font-weight-light text-white">
                  <h3 className="total_gender">{totalAgeByGender?.gen_m?.toLocaleString('it')}</h3>
                </span>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-5" style={{ backgroundColor: '#17324D' }}>
            <div className="p-4 position-relative">
              <div style={{ height: 100 }}>
                <img src="group_person.svg" alt="Logo" className="img-fluid" />
              </div>
              <div className="text-white w-100">
                <div className="w-100 h-100 d-flex justify-content-end">
                  <img src="logo.png" width="40" height="40" alt="Logo" />
                </div>
                <div className="w-100  h-100 d-flex justify-content-end text-right">
                  <h3>Vaccinazioni<br></br> per fasce di età</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12  col-md-7" style={{
            backgroundColor: '#17324D'
          }}>
            <BarChart
              title=""
              xtitle="Fascia d'età"
              ytitle=""
              width={800}
              handleDeliveryBarChartClick={handleDeliveryBarChartClick}
              height={300}
              selected={selectedAge}
              property={{ xprop: "fascia_anagrafica", yprop: "totale" }}
              data={[...deliveryBarChartData]}
            />
          </div>
        </div>
        <div className="row ">
          <div
            className="col-12  d-flex justify-content-center align-items-center p-5"
            style={{ backgroundColor: '#F4F9FD' }}
          >
            <img src="logo.png" width="86" height="86" alt="Logo" className="img-fluid" style={{ zIndex: 10 }} />
            <h3 className="text-center">Vaccinazioni per categoria</h3>
          </div>
          <div className="col-12 col-md-12 h-100  ">
            <div className="mb-5  d-lg-none " style={{
              position: 'relative',
              background: '#013366',
            }}>
              <div className="text-white w-100">
                <div className="w-100  h-100 d-flex justify-content-start pt-5 pl-4">
                  <h5>Totale<br></br>vaccinazioni</h5>
                </div>
                <div className="w-100  h-100 d-flex justify-content-start pl-4">
                <p className="numeri_box">{totalByCategory && totalByCategory.toLocaleString('it')}
                  </p>
                </div>
                <div className="col-12 d-flex justify-content-end  pb-2">
                  <img alt="reset-plot2" src="reset_white.png" onClick={resetCategoryFilter} height={35} />
                </div>
              </div>
            </div>

            <div className="col-3 col-md-3 h-100 d-none d-lg-block">
              <div style={{
                position: 'relative',
                // width: 300,
                // height: 180,
                background: '#17324D',
                top: -90,
                left: 105
              }}>
                <div className="text-white w-100">
                  <div className="w-100  h-100 d-flex justify-content-start pt-3 pl-4">
                    <h5>Totale<br></br>vaccinazioni</h5>
                  </div>
                  <div className="w-100  h-100 d-flex justify-content-start pl-4">
                  <p className="numeri_box">{totalByCategory && totalByCategory.toLocaleString('it')}
                    </p>
                  </div>
                  <div className="col-12 d-flex justify-content-end  pb-2">
                    <img alt="Reset" src="reset_white.png" onClick={resetCategoryFilter} height={35} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 h-100">
            <HBarChart
              title=""
              xtitle="Vaccinazioni per categoria"
              handleRectClick={handleCategoryBarChartClick}
              ytitle=""
              width="220"
              height="260"
              property={{ xprop: "name", yprop: "total" }}
              data={categoryData}
              selectedCodeCategory={selectedCodeCategory}
            />
          </div>
          <div className="col-12 col-md-6 h-100">
            <div className="p-4 position-relative d-lg-none">
              <div className="w-100 h-100 d-flex justify-content-start pr-5">
                <img src="logo.png" width="35" height="35" alt="Logo" />
                <h5 className="pl-3 pl-sm-1">Vaccinazioni<br /> per regione</h5>
              </div>
            </div>
            <div className="p-4 position-relative d-none d-lg-block" style={{ left: '300px', top: '190px' }}>
              <div className="w-100 h-100 d-flex justify-content-start pr-5">
                <img src="logo.png" width="35" height="35" alt="Logo" />
                <h5 className="pl-3 pl-sm-1">Vaccinazioni<br /> per regione</h5>
              </div>
            </div>
            <MapArea
              fillMapDeliveryArea={fillMapCategoryArea}
              summary={categoryMapData}
              handleMapDeliveryClick={handleMapCategoryClick}
              fillBy={categoryMapField}
              tooltip={(r)=>r.area + " " + (r[categoryMapField] && r[categoryMapField].toLocaleString('it'))}
              className="ml-5 w-100 h-100"
            />
          </div>
        </div>
        <div className="row ">
          <div
            className="col-12 d-flex justify-content-center align-items-center p-5"
            style={{ backgroundColor: '#F4F9FD' }}
          >
            <img src="logo.png" width="86" height="86" alt="Logo" className="img-fluid" style={{ zIndex: 10 }} />
            <h3 className="text-center">Punti di somministrazione per regione</h3>
          </div>
          <div className="col-12 col-md-12 h-100 p-0">
            <div className="mb-5  d-lg-none " style={{
              position: 'relative',
              background: '#013366',

            }}>
              <div className="text-white w-100">
                <div className="w-100  h-100 d-flex justify-content-start pt-5 pl-4">
                  <h5>Punti di somministrazione per regione</h5>
                </div>
                <div className="w-100  h-100 d-flex justify-content-start pl-4">
                  <p className="numeri_box">{locationTableRef}
                  </p>
                </div>
                <div className="col-12 d-flex justify-content-end  pb-2">
                  <img alt="reset-plot" src="reset_white.png" onClick={resetFilter} height={35} />
                </div>
              </div>
            </div>

            <div className="col-3 col-md-3 h-100 d-none d-lg-block">
              <div style={{
                position: 'relative',
                // width: 300,
                // height: 180,
                background: '#17324D',
                top: -90,
                left: 40
              }}>
                <div className="text-white w-100">
                  <div className="w-100  h-100 d-flex justify-content-start pt-5 pl-4">
                    <h5>Totale punti di<br></br>somministrazione</h5>
                  </div>
                  <div className="w-100  h-100 d-flex justify-content-start pl-4">
                    <p className="numeri_box">{locationTableRef}
                    </p>
                  </div>
                  <div className="col-12 d-flex justify-content-end  pb-2">
                    <img alt="reset-white" src="reset_white.png" onClick={resetFilter} height={35} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6 pt-5">
            <div className="p-4 position-relative d-lg-none">
              <div className="w-100 h-100 d-flex justify-content-start pr-5">
                <img src="logo.png" width="35" height="35" alt="Logo" />
                <h5 className="pl-3 pl-sm-1">Punti di<br /> somministrazione <br /> per regione</h5>
              </div>
            </div>
            <div className="p-4 position-relative d-none d-lg-block" style={{ left: '300px', top: '190px' }}>
              <div className="w-100 h-100 d-flex justify-content-start pr-5">
                <img src="logo.png" width="35" height="35" alt="Logo" />
                <h5 className="pl-3 pl-sm-1">Punti di<br /> somministrazione <br /> per regione</h5>
              </div>
            </div>
            <MapAreaByDeliveryLocation
              summary={{ ...summary }}
              handleCountryClick={handleCountryClickLocations}
              className="w-100 h-100"
              setLocationRegionSelect={setLocationRegionSelect}
              locationRegionSelect={locationRegionSelect}
            />
          </div>
          <div className="col-12 col-md-6 pt-3 pl-3">
            <LocationsTable
              summary={{ ...summary }}
              selected={selectedLocation}
              className="mr-5 h-100"
              setLocationTableRef={setLocationTableRef}
            />
          </div>

        </div>
        <div className="row">
          <div className="col-12 text-center pt-5 pb-3">
            I dati visualizzati sono disponibili all'indirizzo{" "}
            <a href="https://github.com/italia/covid19-opendata-vaccini">
              https://github.com/italia/covid19-opendata-vaccini
        </a>
          </div>
        </div>
      </div>
      <FooterBar />

    </div>
  );
}

export default App;
