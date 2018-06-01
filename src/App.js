import React, { Component } from 'react';
import ReactMap, { Layer, Feature, Marker } from 'react-mapbox-gl';
//import ReactMapboxGl, { Layer, Feature, Marker } from "react-mapbox-gl";

import { getVehicleUpdate, getVehiclePosition } from './Api';
import stops from './src/stops.json';
import { isNull } from 'util';
import ClusterElement from './clusterElement';

const accessToken = "pk.eyJ1IjoiYWxleDMxNjUiLCJhIjoiY2o0MHp2cGtiMGFrajMycG5nbzBuY2pjaiJ9.QDApU0XH2v35viSwQuln5w";
const style = "mapbox://styles/mapbox/dark-v9";
let latlong = [];

const polygonPaint = {
  'fill-color': '#F98888',
  'fill-opacity': 0.5
};

const Map = ReactMap({
  accessToken
});

const mapStyle = {
  height: '100vh',
  width: '100vw'
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      response: '',
      json: null,
      jsonLenght: null,
      arr: [],
      width: 600,
      height: 400,
      fetchUpdateResponse: null,
      lngLat: null,
      vehicleDetails: null,
      zoom:14,
      center: { lng:  -71.07636094093323, lat: 42.35034583215539 }
    };
    this.arrHandler = this.arrHandler.bind(this);
    this.handleClickTimestamp = this.handleClickTimestamp.bind(this);
    this.handleZoom = this.handleZoom.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.handleParallelCalls = this.handleParallelCalls.bind(this);
  }

  componentWillMount() {
    /**
     * Fetch data on mount and triggers after every 20 sec
     */
    this.handleParallelCalls()
    setInterval(()=>{
      this.handleParallelCalls()
    },20000)
    
  }
  callApi2 = async () => {
    const response = await fetch('/api/transit');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    console.log(body)

    return body;
  };

  handleClickTimestamp() {
    console.log('clicked')
    console.log(stops["Back Bay"].geometry.coordinates[0])

    this.callApi2()
      .then(res => this.setState({
        json: res.express2.header.timestamp,
        jsonLenght: res.express2.entity.length,
        arr: res.express2.entity,
        //newPos: [res.express2.entity[0].id.longitude, res.express2.entity[0].id.latitude]
      }))
      .catch(err => console.log(err));
  }

  handleParallelCalls= async () => {
    var results = await Promise.all([getVehiclePosition(), getVehicleUpdate()])
    if (results.length>0 && results[0].hasOwnProperty('entity') && results[1].hasOwnProperty('entity')) {
      this.setState({
        arr: results[0].entity,
        fetchUpdateResponse: results[1].entity
      })
    }
    return results;
  }
  
  handleZoom = (e) => {
    this.setState({
      zoom:[e.getZoom()]
    })
  }

  handleDrag = (e) => {
    this.setState({
      center: e.getCenter()
    })
  }

  arrHandler() {
    let tripId;
    if (this.state.arr[0]) {
      let input = this.state.arr[0].id;
      let str = input.split('_');
      tripId = str[1];
    }
    return (
      <div>
        <p>
          {latlong}
        </p>
        <p>
          {tripId}
        </p>
        <p>
          {this.state.arr[0] ? this.state.arr[0].id : 'waiting'}
        </p>
      </div>
    )

  }
  render() {
    return (
      <div className="App">
        <button onClick={this.handleClickTimestamp}>
          Get timestamp
          </button>
        <p>
          {this.state.json}
        </p>
        <p>
          {this.state.arr[0] && this.state.arr[0].vehicle.position.longitude}
          {this.state.arr[0] && this.state.arr[0].vehicle.position.latitude}
        </p>
        <p>
          {this.state.arr.length}
        </p>
        <p>
          {this.state.vehicleDetails && this.state.vehicleDetails.delay}
          {this.state.vehicleDetails && this.state.vehicleDetails.tripId}
        </p>
        {this.arrHandler()}


        {
          this.state.arr.length>0 &&
            <Map
              style={style}
              containerStyle={mapStyle}
              center={this.state.center}
              bearing={[20]}
              pitch={[40]}
              zoom={[this.state.zoom]}
              //onZoomEnd={this.handleZoom}   // Degrading performance of browser, need to find a better way to keep zoom upon refresh
              onDragEnd={this.handleDrag}
            >

              <ClusterElement fetchUpdateResponse={this.state.fetchUpdateResponse} arr={this.state.arr}></ClusterElement>

              <Layer type="fill"
                paint={polygonPaint}
              >
                {
                  Object.keys(stops).map((key, index) => (
                    <Feature
                      key={key}
                      coordinates={[stops[key].geometry.coordinates[0]]}
                    />
                  ))
                }
              </Layer>
            </Map>
        }         
      </div>
    );
  }
}

export default App;