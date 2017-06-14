
import React, { Component, } from 'react';
import {
  View,
  Text,
  FlatList,
  CameraRoll,
  Image,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity
} from 'react-native';

let PHOTOS_COUNT_BY_FETCH = 50;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      images: [],
      lastCursor: null,
      loadingMore: false,
      noMore: false,
    }
  }

  componentWillMount(){
    this.fetch();
  }

  fetch(){
    console.log('fetch: ' , !this.state.loadingMore);
    if(!this.state.loadingMore){
      //this.setState({loadingMore: true}, ()=>{this._fetch();});
      this._fetch();
    }
  }

  _fetch() {
    var fetchParams = {
      first: PHOTOS_COUNT_BY_FETCH,
      assetType: 'Photos',
    };
    if (this.state.lastCursor) {
      fetchParams.after = this.state.lastCursor;
    }
    CameraRoll.getPhotos(fetchParams)
      .then((data) => this._appendImages(data), (e) => console.log(e));
  }

  _appendImages(data) {
    var assets = data.edges;
    var newState = {
      loadingMore: false,
    };
    // console.log(data.page_info);

    if (!data.page_info.has_next_page) {
      newState.noMore = true;
    }
    const cameraRollArr = [];

    if (assets.length > 0) {
      for(let i = 0; i < assets.length; i++) {
        cameraRollArr.push(assets[i].node.image.uri);
      }
      newState.loadingMore = false;
      newState.lastCursor = data.page_info.end_cursor;
      newState.images = this.state.images.concat(cameraRollArr);
    }
    this.setState(newState);
  }

  _onEndReached() {
    console.log('_onEndReached: ' , !this.state.noMore);
    if (!this.state.noMore) {
      // console.log('_onEndReached: ' +this.state.noMore);
      this.fetch();
    }
  }

  render() {
    return (
        <FlatList
          data={this.state.images}
          initialNumToRender={50}
          numColumns={3}

          onEndReached={this._onEndReached.bind(this)}
          onEndReachedThreshold={5}

          enableEmptySections={true}
          renderItem={({item,index}) => {
            // console.log(index)
            return(
              <TouchableOpacity  onPress={()=>alert(index)}>
                <Image source={{uri:item}}
                  style={{width: 120, height: 120, borderWidth: 1, borderColor:'red'}}>
                  <Text style={{fontSize: 15, color:'green'}}>{index}</Text>
                </Image>
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item, index) => index}
        />

    );
  }
}

module.exports = App;
