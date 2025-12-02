// src/components/calculator/CalculatorModal.tsx
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useCalculator } from '../../app/providers/CalculatorProvider';
import { useTheme } from '../../app/providers/ThemeProvider';

const { height } = Dimensions.get('window');

interface CalculatorButtonProps {
  title: string;
  onPress: () => void;
  style?: 'number' | 'operation' | 'equals' | 'clear' | 'function';
  flex?: number;
  disabled?: boolean;
}

const CalculatorButton: React.FC<CalculatorButtonProps> = ({
  title,
  onPress,
  style = 'number',
  flex = 1,
  disabled = false,
}) => {
  const { theme } = useTheme();

  const getButtonStyle = () => {
    const baseStyle = {
      flex,
      height: 45,
      margin: 4,
      borderRadius: 12,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    };

    switch (style) {
      case 'operation':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.primary[500],
        };
      case 'equals':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.success[500],
        };
      case 'clear':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.error[500],
        };
      case 'function':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.secondary[500],
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
    }
  };

  const getTextStyle = () => {
    const baseStyle = {
      fontSize: 18,
      fontWeight: '600' as const,
    };

    switch (style) {
      case 'operation':
      case 'equals':
      case 'clear':
      case 'function':
        return {
          ...baseStyle,
          color: '#fff',
        };
      default:
        return {
          ...baseStyle,
          color: theme.colors.text,
        };
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

export const CalculatorModal: React.FC = () => {
  const { theme } = useTheme();
  const {
    isVisible,
    hideCalculator,
    display,
    expression,
    inputNumber,
    inputOperation,
    inputDecimal,
    calculate,
    clear,
    clearEntry,
    backspace,
    history,
    clearHistory,
    setFromHistory,
  } = useCalculator();

  const [showHistory, setShowHistory] = useState(false);

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    calculatorContainer: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: height * 0.80,
      minHeight: height * 0.65,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    headerButton: {
      padding: 8,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      margin: 16,
      borderRadius: 12,
      padding: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 16,
      alignItems: 'center',
      borderRadius: 8,
    },
    activeTab: {
      backgroundColor: theme.colors.primary[500],
    },
    tabText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    activeTabText: {
      color: '#fff',
    },
    displayContainer: {
      padding: 20,
      alignItems: 'flex-end',
      backgroundColor: theme.colors.surface,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 12,
      minHeight: 80,
    },
    expression: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    display: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    buttonContainer: {
      paddingHorizontal: 12,
      paddingBottom: 20,
    },
    buttonRow: {
      flexDirection: 'row',
    },
    historyContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    historyItem: {
      backgroundColor: theme.colors.surface,
      padding: 16,
      marginVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    historyExpression: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    historyResult: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    historyTimestamp: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    emptyHistory: {
      textAlign: 'center',
      color: theme.colors.textSecondary,
      fontSize: 16,
      marginTop: 40,
    },
    clearHistoryButton: {
      backgroundColor: theme.colors.error[500],
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      margin: 16,
    },
    clearHistoryText: {
      color: '#fff',
      fontWeight: '600',
    },
    bottomPadding: {
      paddingBottom: 20
    }
  });

  const renderCalculator = () => (
    <View>
      <View style={styles.displayContainer}>
        {expression ? <Text style={styles.expression}>{expression}</Text> : null}
        <Text style={styles.display} numberOfLines={1} adjustsFontSizeToFit>
          {display}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        {/* Row 1 */}
        <View style={styles.buttonRow}>
          <CalculatorButton title="C" onPress={clear} style="clear" />
          <CalculatorButton title="CE" onPress={clearEntry} style="function" />
          <CalculatorButton title="⌫" onPress={backspace} style="function" />
          <CalculatorButton title="÷" onPress={() => inputOperation('÷')} style="operation" />
        </View>

        {/* Row 2 */}
        <View style={styles.buttonRow}>
          <CalculatorButton title="7" onPress={() => inputNumber('7')} />
          <CalculatorButton title="8" onPress={() => inputNumber('8')} />
          <CalculatorButton title="9" onPress={() => inputNumber('9')} />
          <CalculatorButton title="×" onPress={() => inputOperation('×')} style="operation" />
        </View>

        {/* Row 3 */}
        <View style={styles.buttonRow}>
          <CalculatorButton title="4" onPress={() => inputNumber('4')} />
          <CalculatorButton title="5" onPress={() => inputNumber('5')} />
          <CalculatorButton title="6" onPress={() => inputNumber('6')} />
          <CalculatorButton title="−" onPress={() => inputOperation('-')} style="operation" />
        </View>

        {/* Row 4 */}
        <View style={styles.buttonRow}>
          <CalculatorButton title="1" onPress={() => inputNumber('1')} />
          <CalculatorButton title="2" onPress={() => inputNumber('2')} />
          <CalculatorButton title="3" onPress={() => inputNumber('3')} />
          <CalculatorButton title="+" onPress={() => inputOperation('+')} style="operation" />
        </View>

        {/* Row 5 */}
        <View style={styles.buttonRow}>
          <CalculatorButton title="0" onPress={() => inputNumber('0')} flex={2} />
          <CalculatorButton title="." onPress={inputDecimal} />
          <CalculatorButton title="=" onPress={calculate} style="equals" />
        </View>
      </View>
    </View>
  );

  const renderHistoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => setFromHistory(item.result)}
    >
      <Text style={styles.historyExpression}>{item.expression}</Text>
      <Text style={styles.historyResult}>{item.result}</Text>
      <Text style={styles.historyTimestamp}>
        {item.timestamp.toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  const renderHistory = () => (
    <View style={styles.historyContainer}>
      {history.length > 0 ? (
        <>
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={renderHistoryItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.bottomPadding}
          />
          <TouchableOpacity
            style={styles.clearHistoryButton}
            onPress={clearHistory}
          >
            <Text style={styles.clearHistoryText}>Clear History</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.emptyHistory}>No calculations yet</Text>
      )}
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={hideCalculator}
    >
      <TouchableOpacity
        style={styles.modalContainer}
        activeOpacity={1}
        onPress={hideCalculator}
      >
        <TouchableOpacity
          style={styles.calculatorContainer}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Calculator</Text>
            <TouchableOpacity style={styles.headerButton} onPress={hideCalculator}>
              <Icon name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, !showHistory && styles.activeTab]}
              onPress={() => setShowHistory(false)}
            >
              <Text style={[styles.tabText, !showHistory && styles.activeTabText]}>
                Calculator
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, showHistory && styles.activeTab]}
              onPress={() => setShowHistory(true)}
            >
              <Text style={[styles.tabText, showHistory && styles.activeTabText]}>
                History ({history.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {showHistory ? renderHistory() : renderCalculator()}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};