import React, { useEffect, useState } from 'react';
import { isEmpty } from "lodash";
import { MapAreaByDeliveryLocation } from "./../components/MapAreaByDeliveryLocation";
import { LocationsTable } from "./../components/LocationsTable";

export const Locations = ({ data }) => {

    const [summary, setSummary] = useState({});
    const [selectedLocation, setSelectedLocation] = useState("");
    const [locationCount, setLocationCount] = useState(0);
    const [locationRegionSelect, setLocationRegionSelect] = useState(null);

    useEffect(() => {
        if(!isEmpty(data)){
            setSummary(data);
        }
    }, [data]);

    const resetFilter = () => {
        setSelectedLocation("");
        setLocationCount(0);
        setLocationRegionSelect(null);
    }

    const handleCountryClickLocations = (countryIndex) => {
        setSelectedLocation(countryIndex);
      };
    
    return (
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
                <p className="numeri_box">{locationCount}
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
                  <p className="numeri_box">{locationCount}
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
            setLocationCount={setLocationCount}
          />
        </div>

      </div>)
}