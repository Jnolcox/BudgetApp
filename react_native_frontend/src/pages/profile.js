import React, { Component } from 'react';
import { Alert, View, StyleSheet, TouchableOpacity, Image, Dimensions, ImagePickerIOS } from 'react-native';
import { Container, Content, Text, Left, Right, Card, CardItem, ListItem } from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getPlatformValue } from '../utils';
import * as firebase from 'firebase';
import RNFetchBlob from 'react-native-fetch-blob';
import { _localRank } from '../utils/pointHelpers';
import ImagePicker from 'react-native-image-picker';

const { height, width } = Dimensions.get('window');

const options = {
  title: 'Select Avatar',
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
};

export default class Points extends Component {
  constructor() {
    super();
    this.state = { image: 'https://static.pexels.com/photos/7613/pexels-photo.jpg',
      chosenImage: '',
      userName: '',
      userLocalRank: 0,
      userGlobalRank: 0,
      friends: 0,
    };
  }

  componentWillMount() {
    const uid = this.props.Firebase.auth().currentUser.uid;
    const _this = this;
    const storageRef = this.props.Firebase.storage().ref();
    const userName = this.props.Firebase.auth().currentUser.displayName;
    const ref = this.props.Firebase.database().ref();

    const peopleRef = ref.child('/people');
    peopleRef.child(userName).once('value').then((snap) => {
      if (snap.val().photoUrl) {
        return snap.val().photoUrl;
      }
      return 'https://static.pexels.com/photos/7613/pexels-photo.jpg';
    }).then((pic) => {
      this.setState({ chosenImage: pic });
    });

    _this.setState({ userName });
    this._localRank();
    this._getBoard();
    this.setFriends();
  }

  async setFriends() {
    try {
      const _this = this;
      await this.props.Firebase.auth().currentUser;

      const uid = this.props.Firebase.auth().currentUser.uid;
      const ref = this.props.Firebase.database().ref();
      const userFriendsRef = ref.child('userReadable/userFriends').child(uid);
      userFriendsRef.orderByKey().once('value').then((snap) => {
        const friendList = [];
        snap.forEach((snapshot) => {
          friendList.push({ displayName: snapshot.val().displayName, uid: snapshot.val().uid });
        });
        return friendList;
      }).then((value) => {
        if ((value.length > 0)) {
          _this.setState({
            friends: value.length,
          });
        } else {
          _this.setState({
            friends: 0,
          });
        }
      });
    } catch (e) {
    }
  }

  async _getBoard() {
    try {
      const ref = this.props.Firebase.database().ref();
      const user = this.props.Firebase.auth().currentUser;
      const userRankingRef = ref.child('userReadable/userPoints');
      const leaderBoard = [];

      userRankingRef.orderByChild('points').once('value').then((snap) => {
        snap.forEach((snapshot) => {
          leaderBoard.push([snapshot.val().displayName, snapshot.val().points]);
        });
        return Promise.all(leaderBoard);
      })
      .then((leaderBoard) => {
        const newleaderBoard = leaderBoard.reverse();
        return newleaderBoard;
      })
      .then((newleaderBoard) => {
        const rankings = [];
        const ranks = Object.keys(newleaderBoard);
        ranks.forEach((ranked) => {
          const name = newleaderBoard[ranked][0];
          const rank = +ranked + 1;
          rankings.push([name, `${rank}`]);
        });
        return rankings;
      })
      .then((rankings) => {
        rankings.forEach((Rank) => {
          if (Rank[0] === user.displayName) {
            this.setState({ userGlobalRank: Rank[1] });
          }
        });
      });
    } catch (e) {
    }
  }

  async _localRank() {
    try {
      const ref = this.props.Firebase.database().ref();
      const user = this.props.Firebase.auth().currentUser;
      const uid = user.uid;
      const userFriendsRef = ref.child('userReadable/userFriends').child(uid);
      const userRankingRef = ref.child('userReadable/userPoints');
      const leaderBoard = [];

      userFriendsRef.orderByKey().once('value').then((snap) => {
        const friendList = [];
        snap.forEach((snapshot) => {
          friendList.push({ displayName: snapshot.val().displayName });
        });
        return friendList;
      })
      .then((friendList) => {
        userRankingRef.orderByChild('points').once('value').then((snap) => {
          snap.forEach((snapshot) => {
            leaderBoard.push([snapshot.val().displayName, snapshot.val().points]);
          });
          return Promise.all(leaderBoard);
        })
          .then((leaderBoard) => {
            const newleaderBoard = leaderBoard.reverse();
            return newleaderBoard;
          })
          .then((newleaderBoard) => {
            const friendRank = [];
            friendList.forEach((element) => {
              for (let i = 0; i < newleaderBoard.length; i++) {
                if ((newleaderBoard[i][0] === `${element.displayName}`)) {
                  friendRank.push([newleaderBoard[i][1], newleaderBoard[i][0]]);
                }
              }
            });
            newleaderBoard.forEach((element) => {
              if (element[0] === user.displayName) {
                friendRank.push([element[1], element[0]]);
              }
            });
            function sortNumber(a, b) {
              return b[0] - a[0];
            }
            const sortedFriends = friendRank.sort(sortNumber);
            const rankings = [];
            const ranks = Object.keys(friendRank);
            ranks.forEach((ranked) => {
              const name = sortedFriends[ranked][1];
              const rank = +ranked + 1;
              rankings.push([name, `${rank}`]);
            });
            return rankings;
          })
          .then((rankings) => {
            const localRank = 0;
            rankings.forEach((Rank) => {
              if (Rank[0] === user.displayName) {
                this.setState({ userLocalRank: Rank[1] });
              }
            });
          });
      });
    } catch (e) {
    }
  }

  cameraRoll() {
    ImagePicker.showImagePicker(options, (response) => {
      this.setState({ image: response.origURL });
      this.pickImage();
    });
  }

  pickImage() {
    const _this = this;
    const ref = this.props.Firebase.database().ref();
    const peopleRef = ref.child('/people');
    const uid = this.props.Firebase.auth().currentUser.uid;
    const displayName = this.props.Firebase.auth().currentUser.displayName;
    const Blob = RNFetchBlob.polyfill.Blob;
    window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
    window.Blob = Blob;
    const storageRef = this.props.Firebase.storage().ref();
    const rnfbURI = RNFetchBlob.wrap(RNFetchBlob.fs.asset(this.state.image));

    Blob
      .build(rnfbURI, { type: 'image/jpg;' })
      .then((blob) => {
        storageRef
        .child(`${uid}`)
        .put(blob, { contentType: 'image/jpg' })
        .then((snapshot) => {
          blob.close();
          storageRef.child(`${uid}`).getDownloadURL().then((url) => {
            _this.setState({ chosenImage: url });
            peopleRef.child(displayName).update({
              photoUrl: url,
            });
          });
        });
      })
    .catch((err) => {
    });
  }


  render() {
    return (
      <Container style={{ backgroundColor: '#212121' }}>
        <View style={styles.header}>
          <TouchableOpacity>
            <Icon
              name="bars"
              size={30}
              color="white"
              onPress={this.props.sideMenu}
            />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 25,
              textAlign: 'center',
              width: 250,
              color: 'white',
              fontWeight: '300',
              marginBottom: 5,
            }}
          >
            PROFILE
          </Text>
          <Icon name="diamond" size={20} color="#ffc107" />
        </View>
        <Card style={{ backgroundColor: 'black', borderWidth: 0 }}>
          <CardItem header style={{ backgroundColor: 'transparent' }}>
            <View style={styles.containerHeader}>
              <TouchableOpacity onPress={this.cameraRoll.bind(this)}>
                <Image
                  style={styles.icon}
                  source={{ uri: this.state.chosenImage }}
                />
              </TouchableOpacity>
              <Text style={{ color: 'white', marginTop: 20 }}>
                {this.state.userName}
              </Text>
            </View>
          </CardItem>
          <CardItem style={{ backgroundColor: 'transparent' }}>
            <Content>
              <ListItem style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#ffc107' }}>
                <Left>
                  <Text style={{ fontFamily: 'OpenSans', color: 'white' }}>
                  Friends
                </Text>
                </Left>
                <Text style={{ fontFamily: 'OpenSans', color: 'white' }}>
                  {this.state.friends}
                </Text>
              </ListItem>
              <ListItem style={{ borderBottomWidth: 1, borderColor: '#ffc107' }}>
                <Left>
                  <Text style={{ fontFamily: 'OpenSans', color: 'white' }}>
                  Local Rank
                </Text>
                </Left>
                <Text style={{ fontFamily: 'OpenSans', color: 'white' }}>
                  {this.state.userLocalRank}
                </Text>
              </ListItem>
              <ListItem style={{ borderBottomWidth: 1, borderColor: '#ffc107' }} >
                <Left>
                  <Text style={{ fontFamily: 'OpenSans', color: 'white' }}>
                  Global Rank
                </Text>
                </Left>
                <Text style={{ fontFamily: 'OpenSans', color: 'white' }}>
                  {this.state.userGlobalRank}
                </Text>
              </ListItem>
            </Content>
          </CardItem>
        </Card>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  headline: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 0,
    width: 200,
    textAlign: 'center',
    backgroundColor: 'yellow',
  },
  header: {
    paddingTop: getPlatformValue('android', 25, 20),
    flex: 0,
    flexDirection: 'row',
    height: 60,
    backgroundColor: 'black',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#424242',
  },
  containerHeader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: 'transparent',

  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginTop: 40,
  },
  icon: {
    width: 220,
    height: 220,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 40,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
});
