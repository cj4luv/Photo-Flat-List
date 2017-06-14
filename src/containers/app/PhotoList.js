import React, {Component} from 'react';
import {
  Image,
  Platform,
  PropTypes,
  ListView,
  View,
  Text,
  CameraRoll,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  StatusBar
} from 'react-native';

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;

const PIXEL_X = WINDOW_WIDTH/375;
const PIXEL_Y = WINDOW_HEIGHT/667;

const ANDROID_FONT_SIZE = 1;

const FONT_SC = Platform.OS === 'android' ? ANDROID_FONT_SIZE:1;

let PHOTOS_COUNT_BY_FETCH = 30;

import Button from '../../components/buttons/Button';

import {
  Actions,
  ActionConst
} from 'react-native-router-flux';

class PhotoList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      images: [],
      lastCursor: null,
      loadingMore: false,
      noMore: false,
      dataSource: new ListView.DataSource({
        rowHasChanged: (prevRowData, nextRowData) => prevRowData !== nextRowData,
       }),
    }
  }

  componentWillMount(){
    this.fetch();
    //this.fetchPhotos();
  }

  fetch(){
    console.log('fetch: ' +this.state.loadingMore);
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
    console.log(data.page_info);

    if (!data.page_info.has_next_page) {
      newState.noMore = true;
    }

    if (assets.length > 0) {
      const cameraRollArr = [];
      for(let i = 0; i < assets.length; i++) {
        cameraRollArr.push(assets[i].node.image.uri);
      }
      newState.loadingMore = false;
      newState.lastCursor = data.page_info.end_cursor;
      newState.images = this.state.images.concat(cameraRollArr);
      newState.dataSource = this.state.dataSource.cloneWithRows(newState.images);
    }
    this.setState(newState);
  }

  _onEndReached() {
    console.log('_onEndReached: ' +this.state.noMore);
    if (!this.state.noMore) {
      this.fetch();
    }
  }

  _arrayObjectIndexOf(array, property, value) {
    return array.map((o) => { return o[property]; }).indexOf(value);
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
      console.log(response);
      let length = Object.keys(response.edges).length;
      const cameraRollArr = [];
      for(let i = 0; i < length; i++) {
        cameraRollArr.push(response.edges[i].node.image.uri);
      }
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(cameraRollArr)
      })
      }).catch((error)=>{console.log(error)
    });
  }

  _renderSeparator(rowID) {
    let tmep = Number(rowID)
    if(tmep-1 === 0 || (tmep-1)%3 === 0) {
      return(
        <View key={rowID} style={{marginRight:3 * PIXEL_X,}}></View>
      );
    }
    if(tmep === 0 || tmep%3 === 0) {
      return(
        <View key={rowID} style={{marginRight:3 * PIXEL_X,}}></View>
      );
    }
  }

  //이미지 리스트뷰
  _renderImageList() {
    return(
      <ListView
        contentContainerStyle={styles.imageGrid}
        onEndReached={this._onEndReached.bind(this)}
        dataSource={this.state.dataSource}
        renderRow={(rowData, sectionID, rowID, highlightRow) => this._renderImageRow(rowData, sectionID,rowID)}
        enableEmptySections={true}
        renderSeparator={(sectionID, rowID, adjacentRowHighlighted) => this._renderSeparator(rowID)}
      >
      </ListView>
    );
  }

  _renderImageRow(rowData, sectionID, rowID) {
    // console.log(rowID);
    return(
      <View>
        <TouchableOpacity onPress={() => {
          this.props.getImageUrl(rowData);
          this.props.imageCropClicked(true);
          Actions.pop();
        }}>
          <Image style={styles.image} source={{uri:rowData}} />
        </TouchableOpacity>
      </View>
    );
  }

  _renderHeader() {
    return(
      <View style={styles.header}>
        <Button onPress={()=>{Actions.pop({refresh:{refresh:true}});}}>
          <View style={styles.headerLeftBtnArea}>
            <Text style={styles.sendBtnText}>취소</Text>
          </View>
        </Button>

        <View>
          <Text style={styles.sendBtnText}>카메라 롤</Text>
        </View>


        <View style={styles.headerRightBtnArea}>
          <Text style={styles.sendBtnText}></Text>
        </View>

      </View>
    );
  }

   render() {
     return (
       <View style={styles.container}>
         <StatusBar translucent={true} hidden={false} animated={true} showHideTransition='fade' barStyle={'dark-content'} backgroundColor={'transparent'}/>
         {this._renderHeader()}
         {this._renderImageList()}
       </View>
     );

   }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems:'flex-start',
  },
  image: {
    width: 123 * PIXEL_X,
    height: 123 * PIXEL_Y,
    marginBottom: 3 * PIXEL_Y
  },
  header:{
    paddingTop: 10 * PIXEL_Y,
    height: Platform.OS === 'android' ? PIXEL_Y * 60 :PIXEL_Y * 64,
    width: WINDOW_WIDTH,
    justifyContent:'space-between',
    alignItems:'center',
    flexDirection:'row',
  },
  headerLeftBtnArea:{
    paddingLeft:16 * PIXEL_X,
    width: 100 * PIXEL_X,
    height: Platform.OS === 'android' ? PIXEL_Y * 60 :PIXEL_Y * 64,
    justifyContent:'center'
  },
  sendBtnText:{
    fontSize:17 * PIXEL_X * FONT_SC,
    color:'#64a18c',
    fontWeight:'600'
  },
  headerRightBtnArea:{
    paddingRight:16 * PIXEL_X,
    width: 100 * PIXEL_X,
    alignItems:'flex-end',
    height: Platform.OS === 'android' ? PIXEL_Y * 60 :PIXEL_Y * 64,
    justifyContent:'center'
  },
};

module.exports = PhotoList;
