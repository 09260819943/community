import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createComment, getPosts, reactPost, reactComment, deletePost } from '../services/api';

export default function PostDetail({ route, navigation }) {
  const { post, refresh } = route.params;
  const userId = 1; // Replace with actual logged-in user ID

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentImage, setCommentImage] = useState(null);

  // Fetch post + comments
  const fetchComments = async () => {
    try {
      const res = await getPosts();
      const updatedPost = res.data.find(p => p.id === post.id);
      setComments(updatedPost?.comments || []);
    } catch (err) {
      console.log('Fetch comments error:', err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  // Pick image for comment
  const pickCommentImage = async () => {
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
      setCommentImage(result.assets[0]);
    }
  };

  // Add new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      return Alert.alert('Error', 'Please type a comment!');
    }

    try {
      if (commentImage) {
        const formData = new FormData();
        formData.append('post', post.id);
        formData.append('content', newComment.trim());

        const fileExt = commentImage.uri.split('.').pop().toLowerCase();
        formData.append('image', {
          uri: commentImage.uri,
          name: `comment.${fileExt}`,
          type: fileExt === 'jpg' ? 'image/jpeg' : `image/${fileExt}`
        });

        await createComment(formData, true);
      } else {
        await createComment({
          post: post.id,
          content: newComment.trim()
        });
      }

      setNewComment('');
      setCommentImage(null);
      fetchComments();
      if (refresh) refresh();
    } catch (err) {
      console.log('Add comment error:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to add comment. Check backend or network.');
    }
  };

  // Reactions for post or comment
  const handleReaction = async (type, commentId = null) => {
    try {
      if (commentId) {
        setComments(prevComments =>
          prevComments.map(comment => {
            if (comment.id === commentId) {
              const reactions = comment.reactions || [];
              const existing = reactions.find(r => r.user_id === userId);

              let updatedReactions;
              if (existing) {
                updatedReactions = existing.reaction_type === type
                  ? reactions.filter(r => r.user_id !== userId)
                  : reactions.map(r => r.user_id === userId ? { ...r, reaction_type: type } : r);
              } else {
                updatedReactions = [...reactions, { reaction_type: type, user_id: userId }];
              }

              return { ...comment, reactions: updatedReactions };
            }
            return comment;
          })
        );

        await reactComment(commentId, type);
      } else {
        post.reactions = post.reactions || [];
        const existing = post.reactions.find(r => r.user_id === userId);

        if (existing) {
          post.reactions = existing.reaction_type === type
            ? post.reactions.filter(r => r.user_id !== userId)
            : post.reactions.map(r => r.user_id === userId ? { ...r, reaction_type: type } : r);
        } else {
          post.reactions.push({ reaction_type: type, user_id: userId });
        }

        await reactPost(post.id, type);
      }
    } catch (err) {
      console.log('Error reacting:', err);
    }
  };

  // Delete post
  const handleDeletePost = async (postId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePost(postId);
              Alert.alert('Deleted', 'Post has been deleted.');
              if (refresh) refresh();
              navigation.goBack();
            } catch (err) {
              console.log('Delete post error:', err);
              Alert.alert('Error', 'Failed to delete post.');
            }
          }
        }
      ]
    );
  };

  // Navigate to update post screen
  const handleUpdatePost = (post) => {
    navigation.navigate('PostUpdate', { post, refresh });
  };

  const getCommentImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `http://10.0.0.47:8000${url}`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      {/* Post */}
      <View style={{ padding: 10, backgroundColor: '#FFF8F0' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{post.title}</Text>
        <Text style={{ marginTop: 5 }}>{post.content}</Text>
        {post.image && (
          <Image
            source={{ uri: getCommentImageUrl(post.image) }}
            style={{ width: '100%', height: 200, marginTop: 10, borderRadius: 10 }}
          />
        )}
        <Text style={{ marginTop: 5, color: 'gray', fontSize: 12 }}>
          {new Date(post.created_at).toLocaleString()}
        </Text>

        {/* Reactions + Actions */}
        <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
          <TouchableOpacity onPress={() => handleReaction('like')} style={{ marginRight: 15 }}>
            <Text style={{ fontSize: 16, color: '#FF385C' }}>
              👍 {post.reactions?.filter(r => r.reaction_type === 'like').length || 0}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleReaction('heart')} style={{ marginRight: 15 }}>
            <Text style={{ fontSize: 16, color: '#FF385C' }}>
              ❤️ {post.reactions?.filter(r => r.reaction_type === 'heart').length || 0}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleReaction('paw')} style={{ marginRight: 15 }}>
            <Text style={{ fontSize: 16, color: '#FF385C' }}>
              🐾 {post.reactions?.filter(r => r.reaction_type === 'paw').length || 0}
            </Text>
          </TouchableOpacity>

          {/* Update button */}
          <TouchableOpacity
            onPress={() => handleUpdatePost(post)}
            style={{ marginRight: 10, padding: 5, backgroundColor: '#FFA500', borderRadius: 5 }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>✏️ Update</Text>
          </TouchableOpacity>

          {/* Delete button */}
          <TouchableOpacity
            onPress={() => handleDeletePost(post.id)}
            style={{ padding: 5, backgroundColor: '#FF4500', borderRadius: 5 }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>🗑 Delete</Text>
          </TouchableOpacity>
        </View>

        <View style={{ borderBottomWidth: 1, borderBottomColor: '#DDD', marginVertical: 10 }} />
        <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}>
          💬 {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </Text>
      </View>

      {/* Comments list */}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 10, backgroundColor: '#FFF8F0' }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {comments.map(comment => (
          <View key={comment.id} style={{ backgroundColor: '#FFF0F5', padding: 10, marginBottom: 10, borderRadius: 10 }}>
            <Text>{comment.content}</Text>
            {comment.image && (
              <Image
                source={{ uri: getCommentImageUrl(comment.image) }}
                style={{ width: '100%', height: 150, marginTop: 5, borderRadius: 10 }}
              />
            )}
            <Text style={{ color: 'gray', fontSize: 12, marginTop: 5 }}>
              {new Date(comment.created_at).toLocaleString()}
            </Text>

            {/* Comment reactions */}
            <View style={{ flexDirection: 'row', marginTop: 5 }}>
              <TouchableOpacity onPress={() => handleReaction('like', comment.id)} style={{ marginRight: 15 }}>
                <Text style={{ fontSize: 14, color: '#FF385C' }}>
                  👍 {comment.reactions?.filter(r => r.reaction_type === 'like').length || 0}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleReaction('heart', comment.id)} style={{ marginRight: 15 }}>
                <Text style={{ fontSize: 14, color: '#FF385C' }}>
                  ❤️ {comment.reactions?.filter(r => r.reaction_type === 'heart').length || 0}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleReaction('paw', comment.id)}>
                <Text style={{ fontSize: 14, color: '#FF385C' }}>
                  🐾 {comment.reactions?.filter(r => r.reaction_type === 'paw').length || 0}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* New comment input */}
        <TextInput
          placeholder="Write a comment..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginBottom: 10 }}
        />

        {commentImage && (
          <View style={{ backgroundColor: '#FFF0F5', padding: 10, marginBottom: 5, borderRadius: 10 }}>
            <Image
              source={{ uri: commentImage.uri }}
              style={{ width: '100%', height: 150, marginTop: 5, borderRadius: 10 }}
            />
          </View>
        )}

        <TouchableOpacity
          onPress={pickCommentImage}
          style={{ backgroundColor: '#FFB347', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 10 }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>🖼 Pick Image (optional)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleAddComment}
          style={{ backgroundColor: '#FFB347', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 30 }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>🐾 Comment</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
