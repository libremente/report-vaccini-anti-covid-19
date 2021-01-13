import { useState, useEffect } from 'react';
import { HeaderBar } from "./components/HeaderBar";
import { FooterBar } from "./components/FooterBar";
import { StaticBlock } from "./components/StaticBlock";
import { Deliveries } from "./containers/deliveries";
import { Categories } from "./containers/categories";
import { Locations } from "./containers/locations";
import { Total } from "./components/Total";
import { loadData } from "./loadData";
import { hideLoader } from "./utils";
import "./App.css";

function App() {
  const [summary, setSummary] = useState({});

  useEffect(() => {
    loadData().then((d) => {
      hideLoader();
      setSummary(d);
    });
  }, []);




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
        <Categories
          data={summary}
        />
        <Locations
          data={summary}
        />
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
