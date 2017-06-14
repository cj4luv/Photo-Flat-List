
import React, { Component, } from 'react';
import {
  View,
  Text,
  FlatList,
  CameraRoll,
  Image
} from 'react-native';

let PHOTOS_COUNT_BY_FETCH = 30;
const cameraRollArr = [];

class App extends Component {

  componentDidMount(){
    this.fetchPhotos();
  }

  fetchPhotos() {
    const fetchParams: Object = {
      //   first: ..., // (required) The number of photos wanted in reverse order of the photo application
      //   after: ..., // A cursor returned from a previous call to 'getPhotos'
      //   groupTypes: ..., // Specifies which group types to filter the results to
      //                    // One of ['Album', 'All', 'Event', 'Faces', 'Library', 'PhotoStream', 'SavedPhotos'(default)]
      //   groupName: ..., // Specifies filter on group names, like 'Recent Photos' or custom album titles
      //   assetType: ... // Specifies filter on assetType
      //                  // One of ['All', 'Videos', 'Photos'(default)]
      //    mimeTypes: '',
      first: PHOTOS_COUNT_BY_FETCH,
    };

    CameraRoll.getPhotos(fetchParams).then((response)=>{
      let length = Object.keys(response.edges).length;

      for(let i = 0; i < length; i++) {
        cameraRollArr.push(response.edges[i].node.image.uri);
      }
      }).catch((error)=>{console.log(error)
    });
  }


  render() {
    console.log(cameraRollArr)
    return (
      <FlatList
        data={cameraRollArr}
        renderItem={({item,index}) => {
          // console.log(item)
          return(<Text key={index}>{item}</Text>)
        }}
      />
    );
  }
}

module.exports = App;
