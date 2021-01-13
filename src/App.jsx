import { useState, useEffect } from 'react';
import { HeaderBar } from "./components/HeaderBar";
import { FooterBar } from "./components/FooterBar";
import { MapArea } from "./components/MapArea";
import { MapAreaByDeliveryLocation } from "./components/MapAreaByDeliveryLocation";
import { StaticBlock } from "./components/StaticBlock";
import { LocationsTable } from "./components/LocationsTable";
import { Deliveries } from "./containers/deliveries";
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
  const [categorySelectedRegion, setCategorySelectedRegion] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [categoryMapData, setCategoryMapData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCodeCategory, setSelectedCodeCategory] = useState(null);
  const [totalByCategory, setTotalByCategory] = useState(0);
  const [locationTableRef, setLocationTableRef] = useState(0);
  const [locationRegionSelect, setLocationRegionSelect] = useState(null);
  const [categoryMapField, setCategoryMapField] = useState('dosi_somministrate');

  useEffect(() => {
    loadData().then((d) => {
      hideLoader();
      setSummary(d);
      setCategoryData(d.categories);
      setTotalByCategory(d.tot);
      setCategoryMapData(d?.totalDeliverySummary)
    });
  }, []);

  const handleCountryClickLocations = (countryIndex) => {
    setSelectedLocation(countryIndex);
  };







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
        <Deliveries
          data={summary}
        />
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
                  <img alt="reset-plot" src="reset_white.png" onClick={()=>{}} height={35} />
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
                    <img alt="reset-white" src="reset_white.png" onClick={()=>{}} height={35} />
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
