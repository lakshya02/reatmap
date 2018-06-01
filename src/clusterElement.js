import React from 'react';
import { Marker, Cluster, Popup } from 'react-mapbox-gl';
import styled from 'styled-components';

const Mark = styled.div`
  background-color: #e74c3c;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  border: 4px solid #eaa29b;
`;

export default class ClusterElement extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            arr: [],
            vehicleDetails: null,
            popup: false
        }
        this.handleMarkerClick = this.handleMarkerClick.bind(this);

    }

    componentWillMount() {
        if (this.props.arr.length > 0) {
            this.setState({
                arr: this.props.arr
            })
        }
    }
    componentWillReceiveProps() {
        if (this.props.arr.length > 0) {
            this.setState({
                arr: this.props.arr
            })
        }
    }
    /**
   * Displays popup and set vehicleDetailsin state 
   */
    handleMarkerClick = (e) => {
        console.log(e)
        if (this.props.fetchUpdateResponse == null) {
            return;
        }

        var filteredResponse = this.props.fetchUpdateResponse.filter(data => data.id === e.id);

        if (filteredResponse.length === 0) {
            return;
        }

        let tripId = filteredResponse[0]['trip_update']['trip']['trip_id']
        let arrivalDelay = filteredResponse[0]['trip_update']['stop_time_update'][0]['arrival']['delay']
        let stopId = filteredResponse[0]['trip_update']['stop_time_update'][0]['stop_id']
        let routeId = filteredResponse[0]['trip_update']['trip']['route_id']
        this.setState({
            vehicleDetails: {
                delay: arrivalDelay,
                tripId: tripId,
                stopId: stopId,
                routeId: routeId
            },
            lngLat: [e.vehicle.position.longitude, e.vehicle.position.latitude],
            popup: !this.state.popup
        })
    }

    render() {
        const iterateElement = () => {
            let markers = []
            for (let itr = 0; itr < this.state.arr.length; itr++) {
                markers.push(
                    <Marker key={this.state.arr[itr].id}
                        coordinates={[this.state.arr[itr].vehicle.position.longitude, this.state.arr[itr].vehicle.position.latitude]}
                        anchor="bottom"
                        onClick={() => { this.handleMarkerClick(this.state.arr[itr]) }}
                    >
                        <Mark />
                    </Marker>
                )
            }
            return markers
        }
        return (
            <div>
                {
                    this.state.vehicleDetails && this.state.popup &&
                    <Popup
                        coordinates={this.state.lngLat}
                        offset={{
                            'bottom-left': [12, -38], 'bottom': [0, -38], 'bottom-right': [-12, -38]
                        }}>
                        <h1>
                            Trip: {this.state.vehicleDetails && this.state.vehicleDetails.tripId === undefined ? "NA" : this.state.vehicleDetails.tripId}
                        </h1>
                        <p>
                            Delay: {this.state.vehicleDetails && this.state.vehicleDetails.delay === undefined ? "NA" : this.state.vehicleDetails.delay}
                        </p>
                        <p>
                            StopId: {this.state.vehicleDetails && this.state.vehicleDetails.stopId === undefined ? "NA" : this.state.vehicleDetails.stopId}
                        </p>
                        <p>
                            RouteId: {this.state.vehicleDetails && this.state.vehicleDetails.routeId === undefined ? "NA" : this.state.vehicleDetails.routeId}
                        </p>
                    </Popup>
                }
                <Cluster ClusterMarkerFactory={(coordinates, pointCount) => (<Marker key={coordinates.toString()} coordinates={coordinates}><Mark style={{ textAlign: 'center', color: 'white' }}>{pointCount}</Mark></Marker>)} clusterThreshold={8} radius={350}>
                    {iterateElement()}
                </Cluster>
            </div>

        );
    }

}