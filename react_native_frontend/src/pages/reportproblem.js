import React, { Component } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Container, Text, Left, Right, ListItem, Spinner } from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getPlatformValue } from '../utils';


export default class ReportProblem extends Component {

  render() {
    return (
      <Container style={{ backgroundColor: 'black' }}>
        <View style={styles.header}>
          <TouchableOpacity>
            <Icon
              name="bars"
              size={30}
              color="white"
              onPress={this.props.sideMenu}
            />
          </TouchableOpacity>
          <Text style={{color: 'white', fontSize:25, textAlign:'center', width:250, fontWeight:'300', marginBottom:5}}>Report A Problem</Text>
          <Icon name="diamond" size={20} color="gold" />
        </View>
        <ScrollView horizontal={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{}}>
          <ListItem>
            <Left>
              <Text style={{color:'white', textAlign:'left'}}>Work In Progress</Text>
            </Left>
            <Right>
              <Spinner color="green" />
            </Right>
          </ListItem>
        </ScrollView>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  totalPoints: {
    color: 'blue',
    fontWeight: 'bold',
    fontSize: 60,
  },
  red: {
    color: 'red',
  },
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
  title: {
    fontSize: 25,
    textAlign: 'center',
    width: 250,
    color: 'white',
    fontWeight: '300',
    marginBottom: 5,
  },
});
