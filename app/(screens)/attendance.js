import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';

const AttendanceLog = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [logData, setLogData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async (date) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://192.168.0.105/logs?date=${date}`);
      setLogData(response.data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) fetchLogs(selectedDate);
  }, [selectedDate]);

  const renderLog = ({ item }) => (
    <View style={styles.logRow}>
      <Text>{item.clockIn}</Text>
      <Text>{item.clockOut}</Text>
      <Text>{item.totalHours}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, marked: true, selectedColor: 'blue' },
        }}
        style={styles.calendar}
      />
      <Text style={styles.dateText}>Selected Date: {selectedDate || 'None'}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="blue" style={styles.loader} />
      ) : (
        <FlatList
          data={logData}
          renderItem={renderLog}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={<Text style={styles.noData}>No Data Available</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  calendar: { marginBottom: 20 },
  dateText: { fontSize: 16, marginBottom: 10 },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  noData: { textAlign: 'center', marginTop: 20, color: 'gray' },
  loader: { marginTop: 20 },
});

export default AttendanceLog;
