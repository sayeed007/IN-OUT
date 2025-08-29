import React from 'react';
import { View, StyleSheet } from 'react-native';
import Input from '../ui/Input';
import Chip from '../ui/Chip';
import { Spacing } from '../../theme';

const theme = {
    spacing: Spacing,
    colors: {
        surface: '#F5F5F7',
    },
};

interface FormFieldProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    error?: string;
    required?: boolean;
    multiline?: boolean;
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
    maxLength?: number;
}

interface SelectFieldProps {
    label: string;
    value: string;
    onPress: () => void;
    placeholder?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
}

interface TagsFieldProps {
    label: string;
    tags: string[];
    onAddTag: (tag: string) => void;
    onRemoveTag: (index: number) => void;
    placeholder?: string;
    error?: string;
}

interface AmountFieldProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    currencyCode: string;
    error?: string;
    required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    required = false,
    multiline = false,
    keyboardType = 'default',
    maxLength,
}) => {
    return (
        <View style={styles.fieldContainer}>
            <Input
                label={`${label}${required ? ' *' : ''}`}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                error={error}
                multiline={multiline}
                keyboardType={keyboardType}
                maxLength={maxLength}
            />
        </View>
    );
};

export const SelectField: React.FC<SelectFieldProps> = ({
    label,
    value,
    onPress,
    placeholder,
    error,
    required = false,
    disabled = false,
}) => {
    return (
        <View style={styles.fieldContainer}>
            <Input
                label={`${label}${required ? ' *' : ''}`}
                value={value}
                onPressIn={disabled ? undefined : onPress}
                placeholder={placeholder}
                error={error}
                editable={false}
                pointerEvents={disabled ? 'none' : 'auto'}
                inputStyle={styles.selectInput}
            />
        </View>
    );
};

export const TagsField: React.FC<TagsFieldProps> = ({
    label,
    tags,
    onAddTag,
    onRemoveTag,
    placeholder = 'Add tag...',
    error,
}) => {
    const [newTag, setNewTag] = React.useState('');

    const handleAddTag = () => {
        const trimmedTag = newTag.trim();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            onAddTag(trimmedTag);
            setNewTag('');
        }
    };



    return (
        <View style={styles.fieldContainer}>
            <Input
                label={label}
                value={newTag}
                onChangeText={setNewTag}
                placeholder={placeholder}
                error={error}
                onSubmitEditing={handleAddTag}
                returnKeyType="done"
            />

            {tags.length > 0 && (
                <View style={styles.tagsContainer}>
                    {tags.map((tag, index) => (
                        <Chip
                            key={index}
                            label={tag}
                            onPress={() => onRemoveTag(index)}
                            variant="outlined"
                            style={styles.tagChip}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

export const AmountField: React.FC<AmountFieldProps> = ({
    label,
    value,
    onChangeText,
    currencyCode,
    error,
    required = false,
}) => {
    const formatAmount = (text: string) => {
        // Remove all non-numeric characters except decimal point
        const cleaned = text.replace(/[^0-9.]/g, '');

        // Ensure only one decimal point
        const parts = cleaned.split('.');
        if (parts.length > 2) {
            return parts[0] + '.' + parts.slice(1).join('');
        }

        // Limit to 2 decimal places
        if (parts.length === 2 && parts[1].length > 2) {
            return parts[0] + '.' + parts[1].substring(0, 2);
        }

        return cleaned;
    };

    const handleChangeText = (text: string) => {
        const formatted = formatAmount(text);
        onChangeText(formatted);
    };

    return (
        <View style={styles.fieldContainer}>
            <Input
                label={`${label}${required ? ' *' : ''}`}
                value={value}
                onChangeText={handleChangeText}
                placeholder="0.00"
                error={error}
                keyboardType="numeric"
                leftIcon={currencyCode}
                inputStyle={styles.amountInput}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    fieldContainer: {
        marginBottom: theme.spacing.md,
    },
    selectInput: {
        backgroundColor: theme.colors.surface,
    },
    disabledInput: {
        opacity: 0.6,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: theme.spacing.sm,
        gap: theme.spacing.xs,
    },
    tagChip: {
        marginRight: theme.spacing.xs,
        marginBottom: theme.spacing.xs,
    },
    amountInput: {
        fontSize: 18,
        fontWeight: '600',
    },
});