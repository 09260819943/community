import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PostsList from './screens/PostsList';
import AddPost from './screens/AddPost';
import PostDetail from './screens/PostDetail';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="PostsList" component={PostsList} options={{ title: 'Pet Forum' }} />
        <Stack.Screen name="AddPost" component={AddPost} options={{ title: 'Add Post' }} />
        <Stack.Screen name="PostDetail" component={PostDetail} options={{ title: 'Post Detail' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
