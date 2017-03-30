import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { Goals } from '../../pages/goals.js'

export default class GoalsSnapshot extends Component {

  constructor() {
    super();
    this.state = { goal: '',
      amount: 0,
      goals: [],
    };
  }

  handlePress() {
    Actions.goals();
  }

  render() {
    let i = 1;
    const goals = [];
    const myGoals = ['Paris Trip', "Yeezy's", "Mac 'n' Cheese"];
    myGoals.forEach((element) => {
      goals.push(
        <View key={i} style={{ marginTop: 5 }}>
          <Text style={ styles.goalText }>
            { element }
          </Text>
          <View style={ styles.goal } >
            <View style={{ flex: 1, backgroundColor: '#0d47a1', borderRadius: 0, width: 100 }} />
          </View>
        </View>,
      );
      i += 1;
    });
    return (
      <TouchableOpacity style={ styles.section } onPress={ this.handlePress.bind(this) }>
        <Text style={ styles.headerText }>
          GOALS
        </Text>
        { goals }
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  section: {
    flex: 1,
    borderColor: '#e0e0e0',
    marginTop: 2,
    borderBottomWidth: 1,
    backgroundColor: 'white',
    marginBottom: 1,
  },
  goal: {
    height: 20,
    marginRight: 20,
    marginLeft: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 0,
    backgroundColor: 'white',
  },
  goalText: {
    backgroundColor: 'transparent',
    position: 'absolute',
    width: 335,
    textAlign: 'center',
    fontSize: 15,
    color: '#424242'
  },
  headerText: {
    marginLeft: 6,
    fontFamily: 'OpenSans',
    fontSize: 17,
    color: '#424242',
    marginBottom: 10
  },
});
