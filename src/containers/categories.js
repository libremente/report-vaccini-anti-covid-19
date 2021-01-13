import React, { useEffect, useState } from 'react';
import { find, head, max, isEmpty } from "lodash";
import { HBarChart } from "./../components/HBarChart";
import { MapArea } from "./../components/MapArea";

export const Categories = ({ data }) => {
    const [summary, setSummary] = useState({});
    const [categoryData, setCategoryData] = useState([]);
    const [categoryMapData, setCategoryMapData] = useState([]);
    const [selectedCodeCategory, setSelectedCodeCategory] = useState(null);
    const [totalByCategory, setTotalByCategory] = useState(0);
    const [categoryMapField, setCategoryMapField] = useState('dosi_somministrate');
    const [categorySelectedRegion, setCategorySelectedRegion] = useState(null);

    useEffect(()=>{
        if(!isEmpty(data)){
            setSummary(data);
            setCategoryData(data.categories);
            setTotalByCategory(data.tot);
            setCategoryMapData(data?.totalDeliverySummary)
        }
    },[data])

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

    return (<div className="row ">
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
  </div>)
}