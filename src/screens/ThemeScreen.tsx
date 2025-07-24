import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { borderRadius } from '../theme/borderRadius';
import { spacing } from '../theme/spacing';

const ThemeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Colors</Text>
      <View style={styles.grid}>
        {Object.entries(colors).map(([name, color]) => (
          <View key={name} style={styles.colorContainer}>
            <View style={[styles.colorBox, { backgroundColor: color as string }]} />
            <Text style={styles.label}>{name}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.heading}>Typography</Text>

      <Text style={styles.subHeading}>Font Families</Text>
      {Object.entries(typography.fontFamily).map(([name, family]) => (
        <Text key={name} style={{ fontFamily: family, fontSize: typography.fontSize.md, marginBottom: 8 }}>{name}: {family}</Text>
      ))}

      <Text style={styles.subHeading}>Font Sizes</Text>
      {Object.entries(typography.fontSize).map(([name, size]) => (
        <Text key={name} style={{ fontSize: size, marginBottom: 8 }}>{name}: {size}px</Text>
      ))}

      <Text style={styles.subHeading}>Font Weights</Text>
      {Object.entries(typography.fontWeight).map(([name, weight]) => (
        <Text key={name} style={{ fontWeight: weight as any, fontSize: typography.fontSize.md, marginBottom: 8 }}>{name}: {weight}</Text>
      ))}

      <Text style={styles.subHeading}>Line Heights</Text>
      {Object.entries(typography.lineHeight).map(([name, height]) => (
        <Text key={name} style={{ lineHeight: height, fontSize: typography.fontSize.md, marginBottom: 8 }}>{name}: {height}</Text>
      ))}

      <Text style={styles.subHeading}>Letter Spacing</Text>
      {Object.entries(typography.letterSpacing).map(([name, space]) => (
        <Text key={name} style={{ letterSpacing: space, fontSize: typography.fontSize.md, marginBottom: 8 }}>{name}: {space}</Text>
      ))}

      <Text style={styles.heading}>Border Radius</Text>
      <View style={styles.grid}>
        {Object.entries(borderRadius).map(([name, radius]) => (
          <View key={name} style={styles.radiusContainer}>
            <View style={[styles.radiusBox, { borderRadius: radius }]} />
            <Text style={styles.label}>{name}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.heading}>Spacing</Text>
      <View style={styles.grid}>
        {Object.entries(spacing).map(([name, size]) => (
          <View key={name} style={styles.spacingContainer}>
            <View style={[styles.spacingBox, { width: size, height: size }]} />
            <Text style={styles.label}>{name}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
  },
  subHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorContainer: {
    alignItems: 'center',
    marginBottom: 16,
    width: '30%',
  },
  colorBox: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  label: {
    marginTop: 8,
  },
  radiusContainer: {
    alignItems: 'center',
    marginBottom: 16,
    width: '30%',
  },
  radiusBox: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f0f0f0',
  },
  spacingContainer: {
    alignItems: 'center',
    marginBottom: 16,
    width: '30%',
  },
  spacingBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f0f0f0',
  },
});

export default ThemeScreen;
