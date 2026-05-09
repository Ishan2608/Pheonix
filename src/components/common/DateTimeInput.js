import React, { useState } from 'react';
import { View, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import AppText from './AppText';
import { useTheme } from '../../hooks/useTheme';

export default function DateTimeInput({ label, value, onChange, mode = 'date' }) {
  const { colors, radius } = useTheme();
  const [show, setShow] = useState(false);

  // value is a Date object
  const display = mode === 'date'
    ? value.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : value.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const icon = mode === 'date' ? 'calendar' : 'clock';

  const handleChange = (event, selected) => {
    if (Platform.OS === 'android') setShow(false);
    if (selected) onChange(selected);
  };

  return (
    <View>
      {label && <AppText variant="label" style={{ marginBottom: 8, marginTop: 20 }}>{label}</AppText>}
      <TouchableOpacity
        onPress={() => setShow(true)}
        style={[styles.btn, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: radius.md }]}
        activeOpacity={0.7}
      >
        <Feather name={icon} size={15} color={colors.textMuted} />
        <AppText variant="body" color={colors.textPrimary}>{display}</AppText>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={value}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          onTouchCancel={() => setShow(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
});
