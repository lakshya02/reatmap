import React, { Component } from 'react';
import ReactMap, { Layer, Feature, Marker, Cluster, Popup  } from 'react-mapbox-gl';
//import ReactMapboxGl, { Layer, Feature, Marker } from "react-mapbox-gl";

import styled from 'styled-components';
import { getVehicleUpdate, getVehiclePosition } from './Api';
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
const clusterMarker= {
    width: 30,
    height: 30,
    borderRadius: '50%',
    backgroundColor: '#51D5A0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    border: '2px solid #56C498',
    cursor: 'pointer'
  }

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
      height: 400,
      fetchUpdateResponse:null,
      lngLat:null,
      vehicleDetails:null
    };
    this.arrHandler = this.arrHandler.bind(this);
    this.handleClickTimestamp = this.handleClickTimestamp.bind(this);
    this.handlePosition = this.handlePosition.bind(this); 
    this.handleUpdate = this.handleUpdate.bind(this); 
    this.handleMarkerClick = this.handleMarkerClick.bind(this);
  }
  componentDidMount() {
    this.handleUpdate()
    this.handlePosition()
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

  handlePosition = async () => {
    var result = await getVehiclePosition()
    if(result && result.hasOwnProperty('entity')){
      this.setState({
        arr: result.entity
      })
    }
   
  }
  
  handleUpdate = async () => {
    var result = await getVehicleUpdate()
    if (result && result.hasOwnProperty('entity'))
    {
      this.setState({
        fetchUpdateResponse: result.entity
      })
    }
  }
  /**
   * Displays popup and set vehicleDetailsin state 
   */
  handleMarkerClick = (e)=>{
    console.log(e)
    var filteredResponse = this.state.fetchUpdateResponse.filter(data =>  data.id === e.id);
    let tripId = filteredResponse[0]['trip_update']['trip']['trip_id']
    let arrivalDelay = filteredResponse[0]['trip_update']['stop_time_update'][0]['arrival']['delay']
    let stopId = filteredResponse[0]['trip_update']['stop_time_update'][0]['stop_id']
    this.setState({
      vehicleDetails:{
        delay: arrivalDelay,
        tripId: tripId,
        stopId:stopId
      }
    })
    this.setState({
      lngLat: [e.vehicle.position.longitude, e.vehicle.position.latitude]
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
     /**
      * Currently Not using this cluster, It will wrap Markers
      * @param {*} coordinates 
      * @param {*} pointCount 
      */
    const clusterMarker = (
      coordinates,
      pointCount
    ) => (
        <Marker
          key={coordinates.toString()}
          coordinates={coordinates}
          style={clusterMarker}
        >
          <div>{pointCount}</div>
        </Marker>
      );

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

        <Map
          style={style}
          containerStyle={mapStyle}
          center={{ lng: this.state.arr[0] && this.state.arr[0].vehicle.position.longitude || -71.07636094093323, lat: this.state.arr[0] && this.state.arr[0].vehicle.position.latitude || 42.35034583215539 }}
          bearing={[20]}
          pitch={[40]}
          zoom={[14]}
        >
         
          {
            this.state.vehicleDetails &&
            <Popup
            coordinates={this.state.lngLat}
            offset={{
              'bottom-left': [12, -38], 'bottom': [0, -38], 'bottom-right': [-12, -38]
            }}>
            <h1>
              Trip: {this.state.vehicleDetails && this.state.vehicleDetails.tripId===undefined?"NA":this.state.vehicleDetails.tripId}
            </h1>
            <p>
              Delay : {this.state.vehicleDetails && this.state.vehicleDetails.delay===undefined?"NA":this.state.vehicleDetails.delay}
            </p>
            <p>
              Stop Id : {this.state.vehicleDetails && this.state.vehicleDetails.stopId===undefined?"NA":this.state.vehicleDetails.stopId}
            </p>
            <p>
              Current Stop : NA
            </p>
          </Popup>
          }
          
          {/**
           * Displaying First 10, Because of the performance issue, once Cluster starts working performance will be improved
           */
            this.state.arr.slice(0, 10).map((markers, index) => {
              
                return (

                  <Marker key={markers.id}
                    coordinates={{ lng: markers && markers.vehicle.position.longitude || -71.07636094093323, lat: markers && markers.vehicle.position.latitude || 42.35034583215539 }}
                    anchor="bottom"
                onClick={(e) => { this.handleMarkerClick(markers) }}
                  >
                    <Mark />
                  </Marker>
                )
             
             
            })
          } 

          {/**
            * Cluster Component, to be used in future 
           */
            /* <Cluster ClusterMarkerFactory={this.clusterMarker}>
            
          {
            this.state.arr.map((markers,index) => {
              return (
                <Marker key={markers.id}
                  coordinates={{ lng: markers && markers.vehicle.position.longitude || -71.07636094093323, lat: markers && markers.vehicle.position.latitude || 42.35034583215539 }}
                  anchor="bottom"
                  onClick={() => { this.handleHover(markers)}}
                >
                  <Mark />
                </Marker>
              )
          })
        } 
        </Cluster> */}
        
          <Layer type="fill"
            paint={polygonPaint}
            >
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