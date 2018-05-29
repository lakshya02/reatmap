import React, { Component } from 'react';
import ReactMap, { Layer, Feature, Marker } from 'react-mapbox-gl';
//import ReactMapboxGl, { Layer, Feature, Marker } from "react-mapbox-gl";

import styled from 'styled-components';

import stops from './src/stops.json';

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

const Mark = styled.div`
  background-color: #e74c3c;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  border: 4px solid #eaa29b;
`;
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
      height: 400
    };
    this.arrHandler = this.arrHandler.bind(this);
    this.handleClickTimestamp = this.handleClickTimestamp.bind(this);
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
        {this.arrHandler()}

        <Map
          style={style}
          containerStyle={mapStyle}
          center={{ lng: this.state.arr[0] && this.state.arr[0].vehicle.position.longitude || -71.07636094093323, lat: this.state.arr[0] && this.state.arr[0].vehicle.position.latitude || 42.35034583215539 }}
          bearing={[20]}
          pitch={[40]}
          zoom={[14]}
        >
          <Marker
            coordinates={{ lng: this.state.arr[0] && this.state.arr[0].vehicle.position.longitude || -71.07636094093323, lat: this.state.arr[0] && this.state.arr[0].vehicle.position.latitude || 42.35034583215539 }}
            anchor="bottom"
          >
            <Mark />
          </Marker>


          <Layer type="fill"
            paint={polygonPaint}>
            {Object.keys(stops).map((key, index) => (
              <Feature
                key={key}
                coordinates={[stops[key].geometry.coordinates[0]]}
              />
            ))}
          </Layer>
        </Map>
      </div>
    );
  }
}

export default App;
