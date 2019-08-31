import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default class Tiles extends Component{
    render(){
        return(
        <View style = {styles.tiles}>
            <View style = {styles.sites}>
            <Text style = {styles.siteText}>Tourism Sites</Text>
            </View>
            <View style = {styles.sites}>
            <Text style = {styles.siteText}>Hotels</Text>
            </View>
            <View style = {styles.sites}>
            <Text style = {styles.siteText}>Restaurants</Text>
            </View>
        </View>
        );
    }
}
const styles = StyleSheet.create({
    tiles: {
        marginTop: 170
    },
    sites: {
        backgroundColor: 'grey',
        height: 90,
        margin: 5,
        borderRadius: 5,
        alignItems: "center"     
    },
    siteText: {
        color: 'white',
        textAlign: 'center',
        alignContent: 'center',
        fontSize: 25,
        marginTop: 25
    }

})