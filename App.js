import React, { Component } from "react";
import {
  Text,
  StyleSheet,
  Keyboard,
  View,
  PermissionsAndroid,
  TouchableWithoutFeedback,
  Platform
} from "react-native";
import MapScreen from "./MapScreen";
import axios from "axios";
import PlaceInput from "./components/PlaceInput";
import PolyLine from "@mapbox/polyline";
import MapView, { Polyline, Marker } from "react-native-maps";
import Tiles from './components/Tiles';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasMapPermission: false,
      userLatitude: 0,
      userLongitude: 0,
      destinationCoords: []
    };
    this.locationWatchId = null;
    this.showDirectionsOnMap = this.showDirectionsOnMap.bind(this);
    this.map = React.createRef();
  }

  componentDidMount() {
    this.requestFineLocation();
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.locationWatchId);
  }

  async showDirectionsOnMap(placeId) {
    const { userLatitude, userLongitude } = this.state;
    try {
      const result = await axios.get(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${userLatitude},${userLongitude}&destination=place_id:${placeId}&key=AIzaSyAXpQAvtoxL8ZtyHQeirhEfn-yVF1iVkmo`
      );
      const points = PolyLine.decode(
        result.data.routes[0].overview_polyline.points
      );
      const latLng = points.map(point => ({
        latitude: point[0],
        longitude: point[1]
      }));
      this.setState({ destinationCoords: latLng });
      this.map.current.fitToCoordinates(latLng, {
        edgePadding: { top: 40, bottom: 40, left: 40, right: 40 }
      });
      console.log(latLng);
    } catch (err) {
      console.error(err);
    }
  }

  hideKeyboard() {
    Keyboard.dismiss();
  }

  getUserPosition() {
    this.setState({ hasMapPermission: true });
    this.locationWatchId = navigator.geolocation.watchPosition(
      pos => {
        this.setState({
          userLatitude: pos.coords.latitude,
          userLongitude: pos.coords.longitude
        });
      },
      err => console.warn(err),
      {
        enableHighAccuracy: true
      }
    );
  }

  async requestFineLocation() {
    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          this.getUserPosition();
        }
      } else {
        this.getUserPosition();
      }
    } catch (err) {
      console.warn(err);
    }
  }

  render() {
    const {
      destinationCoords,
      userLatitude,
      userLongitude,
      hasMapPermission
    } = this.state;
    let polyline = null;
    let marker = null;
    if (destinationCoords.length > 0) {
      polyline = (
        <Polyline
          coordinates={destinationCoords}
          strokeWidth={4}
          strokeColor="#000"
        />
      );
      marker = (
        <Marker coordinate={destinationCoords[destinationCoords.length - 1]} />
      );
    }
    if (hasMapPermission) {
      return (
        <TouchableWithoutFeedback onPress={this.hideKeyboard}>
        <View style={styles.container}>
          <MapView
            ref={this.map}
            showsUserLocation
            followsUserLocation
            style={styles.map}
            region={{
              latitude: userLatitude,
              longitude: userLongitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.0121
            }}
          >
            {polyline}
            {marker}
          </MapView>
          <PlaceInput
            showDirectionsOnMap={this.showDirectionsOnMap}
            userLatitude={userLatitude}
            userLongitude={userLongitude}
          />
          <Tiles />
        </View>
      </TouchableWithoutFeedback>
      );
    }
    return null;
  }
}

const styles = StyleSheet.create({
  container: {
    height: 250,
  },
  map: {
    ...StyleSheet.absoluteFillObject
  }
});