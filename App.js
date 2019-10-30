import React, {Component} from 'react';
import {TextInput, View, StyleSheet, Text} from 'react-native';
import MapView, {Polyline} from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import apiKey from './google_api_key';
import _ from 'lodash';
import PolyLine from '@mapbox/polyline';



export class App extends Component {
  constructor(props){
    super(props);
    this.state = {
    error: "",
    latitude: 0,
    longitude: 0,
    destination: "",
    predictions: [],
    pointCoords: []
  };
  //this.onChangeDestinationDebounced = _.debounce(this.onChangeDestination, 1000);   
  }

  componentDidMount(){
    //Get current location and set initial region to this
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        this.getRouteDirections();
      },
      error => this.setState({ error: error.message }),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 }
    );
  }

  async getRouteDirections(){
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${this.state.latitude},${this.state.longitude}&destination=Universal+Studios+Hollywood&key=AIzaSyC4y4F3IFEUHRP69oXOAhT81zb_cuiVuk8`
        );
        const json = await response.json();
        const points = PolyLine.decode(json.routes[0].overview_polyline.points);
        const pointCoords = points.map(point => {
          return {latitude: point[0], longitude: point[1]};
        });
        this.setState({pointCoords});
      } catch (error) {
        console.error(error);
      }
  }

  async onChangeDestination(destination){
    this.setState({ destination })
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${apiKey}&input=${destination}&location=${this.state.latitude},${this.state.longitude}&radius=2000`;
    try {
      const result = await fetch(apiUrl);
      const json = await result.json();
      this.setState({
        predictions: json.predictions
      });
    } catch (error) {
      console.error(error)
    }
   
  }

  render() {

    const predictions =this.state.predictions.map(prediction => 
    <Text style={styles.suggestions} key={prediction.id}>{prediction.description}</Text>)

    return (
      <View style={styles.container}>
      <MapView
      style={styles.map}
      region={{
        latitude: this.state.latitude,
        longitude: this.state.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      }}
      showsUserLocation = {true}
        >
      <Polyline 
      coordinates = {this.state.pointCoords}
      strokewidth = {2}
      strokeColor = "red"
    />
    </MapView>
  
    <TextInput placeholder='Enter destination' value={this.state.destination}
    onChangeText = {destination => 
      //this.onChangeDestinationDebounced(destination)
      this.onChangeDestination(destination)
    }
    style = {styles.destinationInput}
    />
    {predictions}
    </View>
    )
  }
}

export default App


const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  destinationInput: {
    backgroundColor: 'white',
    marginLeft: 5,
    marginRight: 5
  },
  suggestions: {
    backgroundColor: "white",
    padding: 5,
    borderWidth: 0.2,
    fontSize: 18
  }
})