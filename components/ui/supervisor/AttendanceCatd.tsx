import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { format, getDaysInMonth, isSameMonth, subDays, isSameDay } from "date-fns";
import { FireIcon } from "phosphor-react-native";
import { LinearGradient } from 'expo-linear-gradient';

interface Attendance {
  id: string;
  tenantId: string;
  salesmanId: string;
  checkInTime: Date;
  checkOutTime: Date | null;
  startPoint: string;
  selfieUrl: string;
  oddometerUrl: string | null;
  updatedBy: string | null;
}

interface AttendenceProps {
  attendence: Attendance[];
}

export default function AttendanceStatsCard(props: AttendenceProps) {
  const router = useRouter();
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Calculate attendance data
  const calculateAttendanceData = () => {
    const daysInMonth = getDaysInMonth(today);
    const daysSoFar = today.getDate();

    // Get unique attended dates
    const attendedDates = new Set(
      props.attendence
        .filter(att => isSameMonth(new Date(att.checkInTime), today))
        .map(att => format(new Date(att.checkInTime), 'yyyy-MM-dd'))
    );

    const attendedDays = attendedDates.size;
    const percentage = daysSoFar > 0 ? (attendedDays / daysSoFar) * 100 : 0;

    // Calculate Streak
    let streak = 0;
    // Check previous days
    for (let i = 0; i < 365; i++) { // Check up to a year back
      const checkDate = subDays(today, i);
      // If it's today, we count it if present, otherwise we don't break streak yet (unless it's end of day logic, but for now let's assume streak includes today if checked in)
      // Actually, standard streak logic: count consecutive days backwards from today (or yesterday if today not done yet)

      const dateString = format(checkDate, 'yyyy-MM-dd');
      // Check if this date exists in the full attendance list (not just this month)
      const hasAttendance = props.attendence.some(att =>
        isSameDay(new Date(att.checkInTime), checkDate)
      );

      if (hasAttendance) {
        streak++;
      } else {
        // If it's today and no attendance, don't break streak yet if we are just checking history, 
        // but for simplicity, let's say streak breaks if a day is missed. 
        // If today is missed, streak might be from yesterday.
        if (i === 0) continue; // Skip today if not present yet
        break;
      }
    }

    return {
      percentage: Math.round(percentage),
      attendedDays,
      totalDays: daysSoFar,
      attendedDates,
      streak
    };
  };

  const attendanceData = calculateAttendanceData();

  // Generate day boxes for the current month
  const renderDayBoxes = () => {
    const daysInMonth = getDaysInMonth(today);
    const dayBoxes = [];
    const now = new Date();
    const currentDay = now.getDate();

    // Calculate how many days to show (max 31)
    const daysToShow = Math.min(daysInMonth, 31);

    for (let day = 1; day <= daysToShow; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = format(date, 'yyyy-MM-dd');
      const isAttended = attendanceData.attendedDates.has(dateString);
      const isFuture = day > currentDay;

      dayBoxes.push(
        <View
          key={day}
          style={[
            styles.dayDot,
            isFuture ? styles.dayDotFuture :
              isAttended ? styles.dayDotPresent : styles.dayDotAbsent,
          ]}
        />
      );
    }

    return dayBoxes;
  };

  return (
    <View style={styles.card} >
      <View style={styles.cardHeader}>
        <LinearGradient
          colors={['#FF4B6E', '#FF8E53']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.streakBadge}
        >
          <FireIcon weight="fill" color="white" size={14} />
          <Text style={styles.streakText}>{attendanceData.streak} Day Streak</Text>
        </LinearGradient>
        <View>
          {/* <Text style={styles.cardTitle}>Attendance</Text> */}
          <Text style={styles.monthText}>{format(today, 'MMMM yyyy')}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{attendanceData.percentage}%</Text>
          <Text style={styles.statLabel}>Attendance Rate</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {attendanceData.attendedDays}
            <Text style={styles.statTotal}>/{attendanceData.totalDays}</Text>
          </Text>
          <Text style={styles.statLabel}>Days Present</Text>
        </View>
      </View>

      <View style={styles.calendarContainer}>
        <View style={styles.daysGrid}>
          {renderDayBoxes()}
        </View>
      </View>

      {/* <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.checkOutButton,
            { transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
          onPressIn={() => Haptics.selectionAsync()}
          onPress={() => router.push("/screens/checkout")}
        >
          <Text style={styles.checkOutText}>Check Out</Text>
          <CaretRight size={16} color="#EF4444" weight="bold" />
        </Pressable>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  monthText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  streakText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
  },
  statItem: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  statTotal: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  calendarContainer: {
    marginBottom: 20,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
  },
  dayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dayDotPresent: {
    backgroundColor: '#10B981',
  },
  dayDotAbsent: {
    backgroundColor: '#E2E8F0',
  },
  dayDotFuture: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  footer: {
    alignItems: 'center',
  },
  checkOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    gap: 8,
    width: '100%',
  },
  checkOutText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 14,
  },
});