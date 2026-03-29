import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { Document } from '../types';

interface DocumentCardProps {
  document: Document;
  onUpload: (docType: string) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onUpload }) => {
  const getStatusColor = () => {
    switch (document.status) {
      case 'valid':
        return COLORS.success;
      case 'expiring_soon':
        return COLORS.warning;
      case 'expired':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusLabel = () => {
    switch (document.status) {
      case 'valid':
        return 'Valid';
      case 'expiring_soon':
        return 'Expiring Soon';
      case 'expired':
        return 'Expired';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (document.status) {
      case 'valid':
        return 'checkmark-circle';
      case 'expiring_soon':
        return 'warning';
      case 'expired':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="document-text" size={24} color={COLORS.accent} />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{document.name}</Text>
        <Text style={styles.expiry}>Expires: {document.expiryDate}</Text>
      </View>

      <View style={styles.rightContainer}>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}20` }]}>
          <Ionicons name={getStatusIcon() as any} size={14} color={getStatusColor()} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusLabel()}
          </Text>
        </View>
        <TouchableOpacity style={styles.uploadButton} onPress={() => onUpload(document.type)}>
          <Ionicons name="cloud-upload" size={18} color={COLORS.accent} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(128, 229, 203, 0.2)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(128, 229, 203, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  expiry: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  rightContainer: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  uploadButton: {
    padding: SPACING.xs,
  },
});
