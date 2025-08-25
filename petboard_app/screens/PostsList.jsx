import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image } from 'react-native';
import { getPosts, reactPost } from '../services/api';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getFullImageUrl } from '../services/api';

export default function PostsList({ navigation }) {
  const [posts, setPosts] = useState([]);
  const insets = useSafeAreaInsets();

  const fetchPosts = async () => {
    try {
      const res = await getPosts();
      setPosts(res.data);
    } catch (err) {
      console.log('Error fetching posts:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleReaction = async (postId, type) => {
    try {
      await reactPost(postId, type);
      fetchPosts();
    } catch (err) {
      console.log('Error reacting to post:', err);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F0' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {posts.map(post => (
          <View
            key={post.id}
            style={{
              backgroundColor: '#FFF',
              margin: 10,
              borderRadius: 15,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 5,
              padding: 10
            }}
          >
            <TouchableOpacity onPress={() => navigation.navigate('PostDetail', { post, refresh: fetchPosts })}>
                <Image
                  source={{ uri: post.image ? post.image : 'https://place-puppy.com/200x200' }}
                  style={{ width: '100%', height: 200, borderRadius: 15, marginBottom: 10 }}
                  resizeMode="cover"
                />


              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>🐾 {post.title}</Text>
              <Text style={{ marginTop: 5, color: '#555' }}>{post.content}</Text>
              <Text style={{ marginTop: 5, color: 'gray', fontSize: 12 }}>
                {new Date(post.created_at).toLocaleString()}
              </Text>

              <Text style={{ marginTop: 5, fontSize: 14, color: '#777' }}>
                💬 {post.comments?.length || 0} {post.comments?.length === 1 ? 'comment' : 'comments'}
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <TouchableOpacity onPress={() => handleReaction(post.id, 'like')} style={{ marginRight: 15 }}>
                <Text style={{ fontSize: 16, color: '#FF385C' }}>
                  👍 {post.reactions?.filter(r => r.reaction_type === 'like').length || 0}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleReaction(post.id, 'heart')} style={{ marginRight: 15 }}>
                <Text style={{ fontSize: 16, color: '#FF385C' }}>
                  ❤️ {post.reactions?.filter(r => r.reaction_type === 'heart').length || 0}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleReaction(post.id, 'paw')}>
                <Text style={{ fontSize: 16, color: '#FF385C' }}>
                  🐾 {post.reactions?.filter(r => r.reaction_type === 'paw').length || 0}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={{ position: 'absolute', bottom: insets.bottom + 20, right: 20 }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddPost', { refresh: fetchPosts })}
          style={{
            backgroundColor: '#FFB347',
            width: 60,
            height: 60,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 5
          }}
        >
          <Text style={{ fontSize: 28, color: '#fff' }}>➕</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

