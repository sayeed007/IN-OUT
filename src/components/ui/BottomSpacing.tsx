import React from 'react'
import { StyleSheet, View } from 'react-native'

const BottomSpacing = () => {
    return (
        <View style={styles.bottomSpacing} />
    )
}

const styles = StyleSheet.create({
    bottomSpacing: {
        height: 70, // Space for tab bar
    },
});

export default BottomSpacing