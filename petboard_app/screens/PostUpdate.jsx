import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { updatePost } from '../services/api';

export default function PostUpdate({ route, navigation }) {
  const { post, refresh } = route.params;

  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [image, setImage] = useState(post.image ? { uri: post.image } : null);

  // Pick new image
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Camera roll permission is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImage(result.assets[0]);
    }
  };

  // Handle update
  const handleUpdate = async () => {
    if (!title.trim() || !content.trim()) {
      return Alert.alert('Error', 'Title and content cannot be empty.');
    }

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());

      if (image && image.uri && !image.uri.startsWith('http')) {
        const fileExt = image.uri.split('.').pop().toLowerCase();
        formData.append('image', {
          uri: image.uri,
          name: `post.${fileExt}`,
          type: fileExt === 'jpg' ? 'image/jpeg' : `image/${fileExt}`
        });
      }

      await updatePost(post.id, formData, true); // true for multipart
      Alert.alert('Success', 'Post updated successfully!');
      if (refresh) refresh();
      navigation.goBack();
    } catch (err) {
      console.log('Update post error:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to update post.');
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `http://10.0.0.47:8000${url}`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ padding: 15 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Edit Post</Text>

        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginBottom: 10 }}
        />

        <TextInput
          placeholder="Content"
          value={content}
          onChangeText={setContent}
          multiline
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginBottom: 10, height: 150 }}
        />

        {image && (
          <View style={{ marginBottom: 10 }}>
            <Image
              source={{ uri: image.uri || getImageUrl(image.uri) }}
              style={{ width: '100%', height: 200, borderRadius: 10 }}
            />
          </View>
        )}

        <TouchableOpacity
          onPress={pickImage}
          style={{ backgroundColor: '#FFB347', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 10 }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>🖼 Pick Image</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleUpdate}
          style={{ backgroundColor: '#FF385C', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 30 }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>✏️ Update Post</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
