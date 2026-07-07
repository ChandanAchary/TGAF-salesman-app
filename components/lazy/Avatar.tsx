import React from 'react';
import {
  Image,
  Text,
  View,
  StyleSheet,
  ImageStyle,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';

type AvatarProps = {
  src?: string | null;
  alt?: string;
  size?: number;
  imageStyle?: StyleProp<ImageStyle>;
  fallbackStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

// A nice pastel/light color palette (light theme friendly)
const COLORS = [
  '#e57373', // soft red
  '#f06292', // pink
  '#ba68c8', // purple
  '#64b5f6', // blue
  '#4dd0e1', // cyan
  '#4db6ac', // teal
  '#81c784', // green
  '#ffd54f', // amber (deep enough for white)
  '#ff8a65', // orange
];


// Simple hash function: hash letter to index
const getColorFromLetter = (letter: string) => {
  const index = letter.toUpperCase().charCodeAt(0) % COLORS.length;
  return COLORS[index];
};

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 24,
  imageStyle,
  fallbackStyle,
  textStyle,
}) => {
  const diameter = size;
  const fallbackLetter = alt?.charAt(0).toUpperCase() || '?';
  const backgroundColor = getColorFromLetter(fallbackLetter);

  if (src) {
    return (
      <Image
        source={{ uri: src }}
        style={[
          {
            width: diameter,
            height: diameter,
            borderRadius: diameter / 2,
          },
          styles.image,
          imageStyle,
        ]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={[
        {
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
          backgroundColor,
        },
        styles.fallback,
        fallbackStyle,
      ]}
    >
      <Text style={[styles.text, textStyle]}>{fallbackLetter}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#ccc',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Avatar;
