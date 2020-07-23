import React, { useState, useEffect } from 'react';
import {MenuItem, FormControl,Select, Card, CardContent} from "@material-ui/core";
import InfoBox from './InfoBox';  
import Map from './Map';
import Table from './Table';
import numeral, { format } from 'numeral';
import './App.css';
import { sortData } from './util';
import LineGraph from './LineGraph';
import 'leaflet/dist/leaflet.css';

function App() {

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = 
  useState({ lat : 20.5937, lng : 78.9629});
  const [mapZoom, setMapZoom] = useState(3.5);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");


  useEffect(()=>{
    fetch('https://disease.sh/v3/covid-19/all')
    .then(response => response.json())
    .then(data =>{
      setCountryInfo(data);
    });
  }, []);

  useEffect(()=>{
    const getCountriesData = async()=>{
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response)=> response.json())
      .then((data)=>{
        const countries = data.map((country)=>(
          {
            name : country.country,
            value : country.countryInfo.iso2,
          }));

          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
      });
    };
    getCountriesData();
  },[]);

  const onCountryChange = async (event) =>{
    const countryCode = event.target.value;

    const url = 
      countryCode === "worldwide" 
        ? "https://disease.sh/v3/covid-19/all"
        : "https://disease.sh/v3/covid-19/countries/" + countryCode;

    await fetch(url)
    .then(response => response.json())
    .then(data => {
      setCountry(countryCode);
      setCountryInfo(data);
      
      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(3.5);
    });
  };
  
  return (
    <div className="app">
      <div className = "app_left">
        <div className="app__header">
        <h1>CORONA TIMES</h1>
          <FormControl className="app__dropdown">
          <Select variant = "outlined" onChange={onCountryChange} value ={country}>  
          <MenuItem value = "worldwide">Worldwide</MenuItem>
            {
              countries.map((country)=>(
                <MenuItem value = {country.value}>{country.name}</MenuItem>
              ))}

          </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox isRed active = {casesType === "cases"} onClick = {e => setCasesType('cases')}
           title = "New Corona Cases" cases = {numeral(countryInfo.todayCases).format("+0,0")} total = {numeral(countryInfo.cases).format("0,0")}/>

          <InfoBox className = "infoBox__recoveredCases" active = {casesType === "recovered"} onClick = {e => setCasesType('recovered')} 
          title = "Recovered" cases = {numeral(countryInfo.todayRecovered).format("+0,0")} total = {numeral(countryInfo.recovered).format("0,0")}/>

          <InfoBox isRed active = {casesType === "deaths"} onClick = {e => setCasesType('deaths')} 
          title = "Deaths" cases = {numeral(countryInfo.todayDeaths).format("+0,0")} total = {numeral(countryInfo.deaths).format("0,0")}/>


        </div>

         <Map casesType = {casesType} countries = {mapCountries} center={mapCenter} zoom={mapZoom}
         />
      </div>

      
        <Card className="app__right">
          <CardContent>
            <h3>Global Status</h3>
            <Table countries={tableData}/>
            <h3 className ="app__graphTitle">Worldwide New Cases</h3>
            <LineGraph className="app__graph"  />
          </CardContent>
           

        </Card>
        <div className = "footer">
          <h4>by Lavanya Paradkar</h4>
        </div>
    </div>
    
  );
}

export default App;
