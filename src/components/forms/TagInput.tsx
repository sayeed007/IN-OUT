import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
  maxTags?: number;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onTagsChange,
  placeholder = "Add tags...",
  label,
  maxTags = 10,
}) => {
  const [inputText, setInputText] = useState('');

  const handleInputChange = (text: string) => {
    // Remove spaces and commas as user types
    const cleanText = text.replace(/[,\s]/g, '');
    setInputText(cleanText);
  };

  const handleInputSubmit = () => {
    addTag(inputText);
  };

  // const handleKeyPress = (key: string) => {
  //   if (key === ' ' || key === ',') {
  //     addTag(inputText);
  //   }
  // };

  const addTag = (tagText: string) => {
    const trimmedTag = tagText.trim().toLowerCase();

    if (trimmedTag &&
      !tags.includes(trimmedTag) &&
      tags.length < maxTags) {
      onTagsChange([...tags, trimmedTag]);
      setInputText('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const getTagColor = (index: number) => {
    const colors = [
      '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
      '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
      '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
      '#EC4899', '#F43F5E'
    ];
    return colors[index % colors.length];
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.inputContainer}>
        {/* Tags Display */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tagsScrollView}
          contentContainerStyle={styles.tagsContainer}
        >
          {tags.map((tag, index) => (
            <View
              key={tag}
              style={[
                styles.tag,
                { backgroundColor: getTagColor(index) + '20' }
              ]}
            >
              <Text style={[
                styles.tagText,
                { color: getTagColor(index) }
              ]}>
                #{tag}
              </Text>
              <TouchableOpacity
                style={styles.removeTagButton}
                onPress={() => removeTag(tag)}
              >
                <Icon
                  name="close"
                  size={14}
                  color={getTagColor(index)}
                />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Input Field */}
        {tags.length < maxTags && (
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={handleInputChange}
            onSubmitEditing={handleInputSubmit}
            placeholder={tags.length === 0 ? placeholder : "Add another tag..."}
            placeholderTextColor="#9CA3AF"
            returnKeyType="done"
            autoCorrect={false}
            autoCapitalize="none"
            maxLength={20}
          />
        )}
      </View>

      {/* Tag Counter and Helper Text */}
      <View style={styles.footer}>
        <Text style={styles.helperText}>
          Press space or comma to add tags
        </Text>
        <Text style={styles.counterText}>
          {tags.length}/{maxTags}
        </Text>
      </View>

      {/* Suggested Tags - Show remaining suggestions */}
      {(() => {
        const allSuggestions = ['food', 'transport', 'shopping', 'entertainment', 'bills', 'health', 'work', 'family', 'personal', 'gift'];
        const availableSuggestions = allSuggestions.filter(suggestion => !tags.includes(suggestion));
        
        return availableSuggestions.length > 0 && tags.length < maxTags && (
          <View style={styles.suggestedContainer}>
            <Text style={styles.suggestedLabel}>
              {tags.length === 0 ? 'Suggested:' : 'More suggestions:'}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.suggestedScrollView}
            >
              {availableSuggestions.map((suggestedTag) => (
                <TouchableOpacity
                  key={suggestedTag}
                  style={styles.suggestedTag}
                  onPress={() => addTag(suggestedTag)}
                >
                  <Text style={styles.suggestedTagText}>#{suggestedTag}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );
      })()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tagsScrollView: {
    maxHeight: 80,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingBottom: 4,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeTagButton: {
    marginLeft: 4,
    padding: 2,
  },
  textInput: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
    minHeight: 24,
    paddingVertical: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
  },
  counterText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  suggestedContainer: {
    marginTop: 12,
  },
  suggestedLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  suggestedScrollView: {
    flexDirection: 'row',
  },
  suggestedTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    marginRight: 8,
  },
  suggestedTagText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default TagInput;
