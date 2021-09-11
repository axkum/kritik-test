import React, { useEffect, useState } from 'react'
import './App.css';

const getRandomCountry = (countries) => countries[Math.floor(Math.random()*countries.length)];

const getNeighbors = async (countryName) => {
  const neighboursResponse = await fetch(`https://travelbriefing.org/${countryName}?format=json`);
  const {names, neighbors} = await neighboursResponse.json();
  return {name: names.name, neighbors};
}

const getGroupings = (neighbors, countries) => {
  const groupings = {};
  neighbors.forEach(n => {
    n.neighbors.forEach( nc => {
      if(countries.includes(nc.name)) {
        if(nc.name > n.name) groupings[n.name] = nc.name;
        else groupings[nc.name] = n.name;
      }
    })
  });

  return groupings;
}

const App = () => {
  const [randomCountries, setRandomCountries] = useState(null);
  const [neighbors, setNeighbors] = useState(null);  // [{name: 'usa', neighbors: []}
  const [groupings, setGroupings] = useState(null);  // { canada: usa, austrailia: mexico}

  useEffect(() => {
    const getRandomCountriesAndNeighbors = async () => {
      const countriesResponse = await fetch('https://travelbriefing.org/countries.json');
      const countries = await countriesResponse.json();

      let randomCountries = [];
      while(randomCountries.length < 10) {
        const randomCountry = getRandomCountry(countries);
        if(!randomCountries.includes(randomCountry.name)) {
          randomCountries.push(randomCountry.name);
        }
      }

      const promises = randomCountries.map(async country => {
        return getNeighbors(country);
      })

      Promise.all(promises)
        .then(values => {
          setNeighbors(values);
          setRandomCountries(randomCountries);
        })
    }

    getRandomCountriesAndNeighbors();
  }, []);

  if(!neighbors) return <div>Loading...</div>;

  return (
    <div className="App" style={{ textAlign: 'left'}}>
      <button 
        onClick={() => {
        const groupings = getGroupings(neighbors, randomCountries);
        setGroupings(groupings);
      }}>
        Generate groupings
      </button>
      <h1>Selected countries</h1>
      <ul>
       {
         neighbors.map(neighbor => {
           return <li>{neighbor.name}</li>
         })
       }
       </ul>
       <h1>Neighbours</h1>
       {
         groupings ? 
          ((Object.keys(groupings).length) ? 
              <>{Object.keys(groupings).map(group => {
                return <div style={{ display: 'flex'}}>
                  <span>{group}</span>
                  &nbsp;
                  <span>
                    {groupings[group]}
                  </span>
                </div>
              })}</> : <div>No groupings found</div>) 
          :<div>Click on generate groupings to find neighbors</div>
        }
    </div>
  );
}

export default App;
