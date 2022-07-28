import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  StatusBar,
  Text,
  View,
  FlatList,
  Button,
} from 'react-native';
import axios from 'axios';
import AuthContext from './../context/AuthContext';
import EncryptedStorage from 'react-native-encrypted-storage';
import {useIsFocused} from '@react-navigation/native';

function FriendsScreen() {
  const [data, setData] = useState([]);
  const {signOut} = React.useContext(AuthContext);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      getUserFriends();
    }
  }, [isFocused]);

  const renderItem = ({item}) => (
    <View style={styles.item}>
      <Text style={styles.username}>{item.username}</Text>
      <Text style={styles.email}>{item.email}</Text>
      <Button title="Delete friend" onPress={() => deleteFriend(item.email)} />
    </View>
  );

  const deleteFriend = async friend_email => {
    const session = await EncryptedStorage.getItem('userSession');
    if (session) {
      const email = JSON.parse(session).email;
      const userAccessToken = JSON.parse(session).token;

      axios({
        method: 'delete',
        url: `http://192.168.88.23:3000/api/v1/users/friend/${email}/${friend_email}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + userAccessToken,
        },
      }).then(
        response => {
          getUserFriends();
        },
        error => {
          if (error.response.status === 401) {
            console.log('Unauthorized, logging out.');
            signOut();
          }
        },
      );
    }
  };

  const getUserFriends = async () => {
    const session = await EncryptedStorage.getItem('userSession');
    if (session) {
      const email = JSON.parse(session).email;
      const userAccessToken = JSON.parse(session).token;

      axios({
        method: 'get',
        url: `http://192.168.88.23:3000/api/v1/users/friends/${email}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + userAccessToken,
        },
      }).then(
        response => {
          setData(response.data);
        },
        error => {
          if (error.response.status === 401) {
            console.log('Unauthorized, logging out.');
            signOut();
          }
        },
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <FlatList
        style={styles.flatList}
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
      <Button title="Sign out" onPress={signOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    marginBottom: 10,
    marginLeft: 20,
    marginRight: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  username: {
    fontSize: 18,
    color: '#000000',
    fontWeight: '500',
  },
  email: {
    fontSize: 15,
    marginTop: 5,
    marginBottom: 10,
  },
});

export default FriendsScreen;
