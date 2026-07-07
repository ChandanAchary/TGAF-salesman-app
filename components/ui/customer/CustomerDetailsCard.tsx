import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';
import { primary } from '@/constants/Colors';
import { Phone, MapPin, CalendarBlank, NavigationArrow } from 'phosphor-react-native';

interface CustomerDetailsCardProps {
  name: string;
  phone?: string;
  createdAt?: Date;
  latitude?: number;
  longitude?: number;
}

export default function CustomerDetailsCard({ name, phone, createdAt, latitude, longitude }: CustomerDetailsCardProps) {

  const handleCall = () => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleMap = () => {
    if (latitude && longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.card}>
      {/* <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        {createdAt && (
          <View style={styles.dateContainer}>
            <CalendarBlank size={14} color="#6B7280" />
            <Text style={styles.dateText}>Since {new Date(createdAt).getFullYear()}</Text>
          </View>
        )}
      </View>

      <View style={styles.divider} /> */}

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCall} disabled={!phone}>
          <View style={[styles.iconBox, !phone && styles.disabledIcon]}>
            <Phone size={20} color={phone ? primary : '#9CA3AF'} weight="fill" />
          </View>
          <View>
            <Text style={styles.actionLabel}>Phone</Text>
            <Text style={styles.actionValue}>{phone?.slice(0, 11) || 'N/A'}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.verticalDivider} />

        <TouchableOpacity style={styles.actionButton} onPress={handleMap} disabled={!latitude}>
          <View style={[styles.iconBox, !latitude && styles.disabledIcon]}>
            <NavigationArrow size={20} color={latitude ? primary : '#9CA3AF'} weight="fill" />
          </View>
          <View>
            <Text style={styles.actionLabel}>Location</Text>
            <Text style={styles.actionValue}>{latitude ? 'View Map' : 'No Loc'}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
    marginHorizontal: 20,
    marginTop: -50, // Increased negative margin
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
    zIndex: 1,
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledIcon: {
    backgroundColor: '#F3F4F6',
  },
  actionLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
    fontWeight: '500',
  },
  actionValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
  },
});
