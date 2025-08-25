import React, { useState } from 'react';
import { View, Alert, Image, TouchableOpacity, Text, ScrollView } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { createPost } from '../services/api'; // make sure this points to your API

export default function AddPost({ navigation }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postImage, setPostImage] = useState(null);

  // Pick image from gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Camera roll permission is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setPostImage(result.assets[0]);
    }
  };

  // Submit post to backend
  const handleSubmit = async () => {
    if (!title || !content) {
      return Alert.alert('Error', 'Please fill all fields!');
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);

      if (postImage) {
        const fileExt = postImage.uri.split('.').pop();
        formData.append('image', {
          uri: postImage.uri,
          name: `post.${fileExt}`,
          type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
        });
      }

      await createPost(formData); // Axios handles Content-Type automatically
      Alert.alert('Success', 'Post created successfully!');
      navigation.navigate('PostsList'); // navigate back to posts list
    } catch (err) {
      console.log(err.response?.data || err.message);
      Alert.alert('Error', 'Failed to create post.');
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 15, backgroundColor: '#FFF8F0' }}>
      <TextInput
        label="Title"
        value={title}
        onChangeText={setTitle}
        style={{ marginBottom: 15, backgroundColor: '#fff', borderRadius: 10 }}
      />

      <TextInput
        label="Content"
        value={content}
        onChangeText={setContent}
        multiline
        style={{ marginBottom: 15, height: 150, backgroundColor: '#fff', borderRadius: 10 }}
      />

      {postImage && (
        <Image
          source={{ uri: postImage.uri }}
          style={{ width: '100%', height: 200, marginBottom: 15, borderRadius: 10 }}
        />
      )}

      <TouchableOpacity
        onPress={pickImage}
        style={{ backgroundColor: '#FFB347', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 20 }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>🖼 Pick Image</Text>
      </TouchableOpacity>

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={{ backgroundColor: '#FFB347', padding: 8 }}
      >
        🐾 Post
      </Button>
    </ScrollView>
  );
}
